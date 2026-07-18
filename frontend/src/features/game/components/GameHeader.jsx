import { Bell, LogOut, Users, UserPlus, X, Send, Wifi, Check, Play } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useState, useRef, useEffect, useCallback } from 'react';
import useAuth from '@/features/auth/hooks/useAuth';
import authService from '@/features/auth/services/auth.service';
import { ROUTES } from '@/constants';
import friendsApi from '../api/friends.api';
import gameApi from '../api/game.api';
import authApi from '@/features/auth/api/auth.api';
import { updateUser, selectUser } from '@/store/authSlice';
import ConnectionManager from '../services/ConnectionManager';

/* ─── Single friend row ─────────────────────────────────────────────────── */
const FriendRow = ({ friend, index, onInvite }) => {
  const initials = friend.fullName
    ? friend.fullName.split(' ').map(w => w[0]).join('').toUpperCase()
    : 'U';

  const [inviting, setInviting] = useState(false);

  const handleInvite = async (e) => {
    e.stopPropagation();
    setInviting(true);
    try {
      await onInvite(friend.id, friend.fullName);
    } finally {
      setInviting(false);
    }
  };

  return (
    <motion.div
      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/60 rounded-xl transition-colors cursor-pointer"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.045, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {friend.avatar ? (
            <img src={friend.avatar} alt={friend.fullName} className="w-9 h-9 rounded-full object-cover bg-muted animate-none" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
          )}
          {/* Online dot below avatar */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
              friend.online ? 'bg-muted-foreground/30' : 'bg-emerald-500'
            }`}
          />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{friend.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">@{friend.username}</p>
        </div>
      </div>

      {/* Action panel (replaces the online/offline status text badge) */}
      <div className="flex-shrink-0">
        {friend.online ? (
          friend.activity === 'playing' ? (
            <span className="text-xs text-muted-foreground/50 font-medium px-2 py-1 bg-muted/40 rounded-md select-none">
              In Game
            </span>
          ) : (
            <button
              onClick={handleInvite}
              disabled={inviting}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{inviting ? 'Inviting...' : 'Invite'}</span>
            </button>
          )
        ) : null}
      </div>
    </motion.div>
  );
};

/* ─── Single pending request row ────────────────────────────────────────── */
const PendingRow = ({ request, onRespond, index }) => {
  const initials = request.fullName
    ? request.fullName.split(' ').map(w => w[0]).join('').toUpperCase()
    : 'U';

  return (
    <motion.div
      className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-muted/40 rounded-xl transition-colors"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.045, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        {request.avatar ? (
          <img src={request.avatar} alt={request.fullName} className="w-8 h-8 rounded-full object-cover bg-muted animate-none" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-primary">{initials}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{request.fullName}</p>
          <p className="text-[10px] text-muted-foreground truncate">@{request.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onRespond(request.id, 'accept')}
          className="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer transition-colors"
          title="Accept"
        >
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => onRespond(request.id, 'decline')}
          className="p-1 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer transition-colors"
          title="Decline"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Friends Panel ─────────────────────────────────────────────────────── */
const FriendsPanel = ({ onClose, friends, pending, onRefresh, onInvite }) => {
  const [addingFriend, setAddingFriend] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (addingFriend && inputRef.current) inputRef.current.focus();
  }, [addingFriend]);

  const handleSendRequest = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const response = await friendsApi.sendRequest(username.trim());
      toast.success(response.data.message || 'Friend request sent!');
      setUsername('');
      setAddingFriend(false);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requesterId, action) => {
    try {
      await friendsApi.respondToRequest(requesterId, action);
      toast.success(action === 'accept' ? 'Request accepted!' : 'Request declined');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendRequest();
    if (e.key === 'Escape') setAddingFriend(false);
  };

  const onlineCount = friends.filter(f => f.online).length;

  return (
    <motion.div
      className="fixed sm:absolute top-[76px] sm:top-full left-4 sm:left-auto right-4 sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-[100]"
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      style={{ transformOrigin: 'top right' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <div>
          <p className="text-sm font-bold text-foreground">Friends</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {onlineCount} online
          </p>
        </div>

        {/* Add Friend Toggle Button */}
        <button
          onClick={() => {
            setAddingFriend(p => !p);
            if (addingFriend) setUsername('');
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-muted ${
            addingFriend ? 'text-primary' : 'text-muted-foreground'
          }`}
          title={addingFriend ? 'Cancel' : 'Add Friend'}
        >
          <motion.div
            animate={{ rotate: addingFriend ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {addingFriend ? (
              <X className="w-5 h-5" strokeWidth={2} />
            ) : (
              <UserPlus className="w-5 h-5" strokeWidth={1.8} />
            )}
          </motion.div>
        </button>
      </div>

      {/* Add friend input — slides in */}
      <AnimatePresence>
        {addingFriend && (
          <motion.div
            className="px-4 pt-3 pb-2 border-b border-border bg-muted/30"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs text-muted-foreground mb-2 font-medium">Enter a username to add</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="username"
                  disabled={loading}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all disabled:opacity-50"
                />
              </div>
              <motion.button
                onClick={handleSendRequest}
                disabled={!username.trim() || loading}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                whileHover={{ scale: username.trim() && !loading ? 1.06 : 1 }}
                whileTap={{ scale: 0.94 }}
              >
                <Send className="w-4 h-4" strokeWidth={2} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Requests Section */}
      {pending.length > 0 && (
        <div className="border-b border-border bg-primary/[0.02] py-2">
          <p className="text-[10px] font-mono tracking-wider text-muted-foreground/60 uppercase px-4 pb-1">
            Pending Requests ({pending.length})
          </p>
          <div className="max-h-32 overflow-y-auto px-1">
            {pending.map((req, i) => (
              <PendingRow key={req.id} request={req} onRespond={handleRespond} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="px-1 py-2 max-h-64 overflow-y-auto">
        {friends.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-muted-foreground">No friends yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add someone using their username to start playing!</p>
          </div>
        ) : (
          friends.map((friend, i) => (
            <FriendRow key={friend.id} friend={friend} index={i} onInvite={onInvite} />
          ))
        )}
      </div>
    </motion.div>
  );
};

import OnlineGame from './OnlineGame';
import GameProvider from '../providers/GameProvider';

/* ─── Game Header ───────────────────────────────────────────────────────── */
const GameHeader = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [friendsPanelOpen, setFriendsPanelOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const friendsRef = useRef(null);

  // Keep track of invite IDs we have already popped toasts for
  const seenInvitesRef = useRef(new Set());

  const handleLogout = () => {
    authService.logout(dispatch);
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN, { replace: true });
  };

  // 1. Presence Heartbeat & Socket Session Lifecycle (every 20s)
  useEffect(() => {
    if (!user) {
      ConnectionManager.disconnect();
      return;
    }

    // Connect socket for the session
    ConnectionManager.connect();

    friendsApi.heartbeat().catch(() => {});
    const interval = setInterval(() => {
      friendsApi.heartbeat().catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, [user]);

  // 2. Profile Activity Sync (every 4s)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const response = await authApi.getMe();
        dispatch(updateUser(response.data.data.user));
      } catch (e) {
        console.error('Failed to sync profile', e);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [user, dispatch]);

  // 2.5 Real-Time Invite Acceptance Listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = ConnectionManager.subscribe('invite-accepted', () => {
      dispatch(updateUser({ activity: 'playing' }));
    });
    return () => {
      unsubscribe();
    };
  }, [user, dispatch]);

  // 3. Fetch friend/request data
  const fetchFriendshipData = async () => {
    if (!user) return;
    try {
      const [friendsRes, pendingRes] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getPending(),
      ]);
      setFriends(friendsRes.data.data || []);
      setPending(pendingRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch friends data', error);
    }
  };

  // 4. Polling for Friends Panel updates (when open)
  useEffect(() => {
    if (!user || !friendsPanelOpen) return;
    fetchFriendshipData();
    const interval = setInterval(fetchFriendshipData, 8000);
    return () => clearInterval(interval);
  }, [user, friendsPanelOpen]);

  // 5. Polling for Incoming Game Invites (every 4s)
  useEffect(() => {
    if (!user) return;

    const pollGameInvites = async () => {
      try {
        const response = await gameApi.getPending();
        const invites = response.data.data || [];

        invites.forEach((invite) => {
          if (!seenInvitesRef.current.has(invite._id)) {
            seenInvitesRef.current.add(invite._id);
            showInviteToast(invite);
          }
        });
      } catch (error) {
        console.error('Failed to poll game invites', error);
      }
    };

    pollGameInvites();
    const interval = setInterval(pollGameInvites, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // 6. Handle Invitation Responses
  const handleRespondInvite = async (inviteId, action) => {
    try {
      const response = await gameApi.respond(inviteId, action);
      if (action === 'accept') {
        toast.success('Joined online match!');
        dispatch(updateUser({ activity: 'playing' }));
      } else {
        toast.success('Invitation declined');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Response action failed');
    }
  };

  // 7. Trigger Sonner invite prompt toast
  const showInviteToast = (invite) => {
    toast.custom(
      (t) => (
        <div className="bg-background border border-border p-4 rounded-2xl shadow-xl flex flex-col gap-2.5 max-w-sm w-full pointer-events-auto">
          <div>
            <p className="text-sm font-bold text-foreground">Play Tic Tac Toe!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              @{invite.sender.username} has invited you to an online match.
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-1 font-mono">
              Offer expires in 5 minutes
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                handleRespondInvite(invite._id, 'accept');
                toast.dismiss(t);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              Decline
            </button>
            <button
              onClick={() => {
                handleRespondInvite(invite._id, 'reject');
                toast.dismiss(t);
              }}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Accept
            </button>
          </div>
        </div>
      ),
      {
        duration: 300000, // Valid for 5 minutes (300,000 milliseconds)
        id: invite._id,
      }
    );
  };

  // 8. Invite a friend
  const handleInviteFriend = async (friendId, friendName) => {
    try {
      await gameApi.invite(friendId);
      toast.success(`Invite request sent to ${friendName}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send game invite');
    }
  };

  // 9. Leave game lobby
  const handleLeaveGame = useCallback(async () => {
    try {
      await gameApi.leave();
      dispatch(updateUser({ activity: 'idle' }));
      toast.success('Left match successfully');
    } catch (error) {
      toast.error('Failed to leave match lobby');
    }
  }, [dispatch]);

  /* Close panel on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (friendsRef.current && !friendsRef.current.contains(e.target)) {
        setFriendsPanelOpen(false);
      }
    };
    if (friendsPanelOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [friendsPanelOpen]);

  const onlineCount = friends.filter((f) => f.online).length;

  return (
    <>
      <header className="bg-background relative z-50">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 40 40"
                fill="none"
                className="w-10 h-10 text-foreground"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <line x1="13" y1="8" x2="13" y2="32" />
                <line x1="27" y1="8" x2="27" y2="32" />
                <line x1="8" y1="13" x2="32" y2="13" />
                <line x1="8" y1="27" x2="32" y2="27" />
              </svg>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                Tic Tac Toe
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">

              {/* Notification */}
              <motion.button
                className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                whileHover={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  transition: { duration: 0.5 },
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="h-5 w-5 text-foreground" strokeWidth={2} />
              </motion.button>

              {/* ── Friends Button + Panel ── */}
              <div className="relative" ref={friendsRef}>
                <motion.button
                  onClick={() => setFriendsPanelOpen((p) => !p)}
                  className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                  animate={friendsPanelOpen ? { backgroundColor: 'var(--color-muted, hsl(240 4.8% 95.9%))' } : {}}
                >
                  <motion.div
                    animate={friendsPanelOpen
                      ? { rotate: [0, -8, 8, 0], scale: 1.1, transition: { duration: 0.4 } }
                      : { rotate: 0, scale: 1 }
                    }
                  >
                    <Users className="h-5 w-5 text-foreground" strokeWidth={1.8} />
                  </motion.div>
                  <span className="text-sm font-medium text-foreground hidden sm:block">Friends</span>

                  {/* Online badge */}
                  {onlineCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 600, damping: 14 }}
                    >
                      {onlineCount}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {friendsPanelOpen && (
                    <FriendsPanel
                      onClose={() => setFriendsPanelOpen(false)}
                      friends={friends}
                      pending={pending}
                      onRefresh={fetchFriendshipData}
                      onInvite={handleInviteFriend}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile with hover-reveal logout */}
              <div
                className="relative"
                onMouseEnter={() => setIsProfileHovered(true)}
                onMouseLeave={() => setIsProfileHovered(false)}
              >
                {/* Profile pill */}
                <motion.div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer select-none"
                  animate={{
                    backgroundColor: isProfileHovered
                      ? 'var(--color-muted, hsl(240 4.8% 95.9%))'
                      : 'transparent',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Avatar with playful wobble on hover */}
                  <motion.div
                    animate={
                      isProfileHovered
                        ? {
                            rotate: [0, -8, 8, -5, 5, -3, 3, 0],
                            y: [0, -5, 0, -3, 0],
                            scale: [1, 1.1, 1],
                            transition: { duration: 0.6, ease: 'easeInOut' },
                          }
                        : { rotate: 0, y: 0, scale: 1 }
                    }
                    className="relative"
                  >
                    {user?.avatar ? (
                      <motion.img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-9 h-9 rounded-full bg-muted object-cover animate-none"
                        animate={{
                          boxShadow: isProfileHovered
                            ? '0 0 0 3px hsl(var(--primary) / 0.35)'
                            : '0 0 0 2px transparent',
                        }}
                        transition={{ duration: 0.25 }}
                      />
                    ) : (
                      <motion.div
                        className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center"
                        animate={{
                          boxShadow: isProfileHovered
                            ? '0 0 0 3px hsl(var(--primary) / 0.35)'
                            : '0 0 0 2px transparent',
                        }}
                        transition={{ duration: 0.25 }}
                      >
                        <span className="text-sm font-bold text-primary">
                          {user?.fullName?.[0]?.toUpperCase() ?? 'O'}
                        </span>
                      </motion.div>
                    )}

                    {/* Sparkle dot */}
                    <AnimatePresence>
                      {isProfileHovered && (
                        <motion.span
                          key="sparkle"
                          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 600, damping: 14 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Name */}
                  <span className="text-sm font-medium text-foreground">
                    {user?.fullName ?? 'Om Pawar'}
                  </span>
                </motion.div>

                {/* Logout button */}
                <AnimatePresence>
                  {isProfileHovered && (
                    <motion.button
                      key="logout-btn"
                      onClick={handleLogout}
                      className="absolute top-full left-1/2 mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold shadow-lg whitespace-nowrap cursor-pointer"
                      style={{ x: '-50%' }}
                      initial={{ opacity: 0, y: -8, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.85 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                    >
                      <LogOut className="h-3 w-3" strokeWidth={2.5} />
                      Log out
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Online Game Mode Overlay */}
      <AnimatePresence>
        {user?.activity === 'playing' && (
          <GameProvider onGameExit={handleLeaveGame}>
            <OnlineGame
              currentUser={user}
              onGameExit={handleLeaveGame}
            />
          </GameProvider>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameHeader;
