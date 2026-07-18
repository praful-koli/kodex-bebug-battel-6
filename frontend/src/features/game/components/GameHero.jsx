import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight, Users, Wifi, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/authSlice';
import friendsApi from '../api/friends.api';
import gameApi from '../api/game.api';
import { toast } from 'sonner';
import InPersonGame from './InPersonGame';

/* ─── Game Mode Button ──────────────────────────────────────────────────── */
const ModeButton = ({ icon: Icon, label, sublabel, index, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative w-full flex items-center justify-between py-7 cursor-pointer text-left overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Fill that slides in from left */}
      <motion.div
        className="absolute inset-0 bg-primary-foreground/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0, transformOrigin: 'left' }}
      />

      {/* Left — number + icon + label */}
      <div className="relative z-10 flex items-center gap-6 pl-2">
        {/* Index */}
        <span className="text-primary-foreground/30 text-xs font-mono w-5 select-none">
          0{index + 1}
        </span>

        {/* Icon */}
        <motion.div
          animate={hovered ? { rotate: [0, -6, 6, 0], y: [0, -3, 0] } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Icon
            className="w-5 h-5 text-primary-foreground"
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Text */}
        <div>
          <p className="text-primary-foreground font-bold text-2xl sm:text-3xl tracking-tight leading-none">
            {label}
          </p>
          <motion.p
            className="text-primary-foreground/50 text-sm mt-1 font-normal"
            animate={{ opacity: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.25 }}
          >
            {sublabel}
          </motion.p>
        </div>
      </div>

      {/* Right — arrow */}
      <div className="relative z-10 pr-2">
        <motion.div
          animate={hovered ? { x: 4, opacity: 1 } : { x: -8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <ArrowRight className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
        </motion.div>
      </div>
    </motion.button>
  );
};



/* ─── Matchmaking Animation ─────────────────────────────────────────────── */
const MatchmakingAnimation = ({ currentUser, friend, onCancel }) => {
  const userInitials = currentUser?.fullName?.split(' ').map(w => w[0]).join('').toUpperCase() || 'U';
  const friendInitials = friend.fullName?.split(' ').map(w => w[0]).join('').toUpperCase() || 'F';
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="flex items-center justify-between w-full max-w-xs mb-8 relative">
        {/* User Avatar */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="You" className="w-14 h-14 rounded-full object-cover border-2 border-primary" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-lg font-bold text-primary">
              {userInitials}
            </div>
          )}
          <span className="text-xs font-semibold text-muted-foreground">You</span>
        </div>

        {/* Connect Animation line */}
        <div className="flex-1 h-[2px] bg-border mx-4 relative overflow-hidden">
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/3 bg-primary rounded"
            animate={{ x: ['-100%', '300%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Opponent Avatar */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          {friend.avatar ? (
            <img src={friend.avatar} alt={friend.fullName} className="w-14 h-14 rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-muted border-2 border-border flex items-center justify-center text-lg font-bold text-muted-foreground">
              {friendInitials}
            </div>
          )}
          <span className="text-xs font-semibold text-muted-foreground">{friend.fullName}</span>
        </div>
      </div>

      <p className="text-sm font-bold text-foreground">Invited {friend.fullName}</p>
      <p className="text-xs text-muted-foreground mt-1.5 animate-pulse max-w-xs">
        Waiting for response. You will automatically enter the arena when they accept...
      </p>

      <button
        onClick={onCancel}
        className="mt-8 px-5 py-2.5 rounded-xl border border-destructive/20 text-destructive text-xs font-bold hover:bg-destructive/10 cursor-pointer transition-colors"
      >
        Cancel Invitation
      </button>
    </div>
  );
};

/* ─── Friends List View ──────────────────────────────────────────────────── */
const FriendsListView = ({ friends, loading, onInvite }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[250px]">
        <p className="text-xs text-muted-foreground animate-pulse">Loading friends...</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[250px] p-6 text-center">
        <p className="text-sm font-semibold text-muted-foreground">No friends found</p>
        <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
          Add friends using the Friends panel in the header before starting online games.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto p-4">
      {friends.map((friend) => {
        const initials = friend.fullName
          ? friend.fullName.split(' ').map(w => w[0]).join('').toUpperCase()
          : 'U';

        return (
          <div
            key={friend.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                {friend.avatar ? (
                  <img src={friend.avatar} alt={friend.fullName} className="w-9 h-9 rounded-full object-cover bg-muted" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{initials}</span>
                  </div>
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
                    friend.online ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  }`}
                />
              </div>

              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">{friend.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">@{friend.username}</p>
              </div>
            </div>

            <div>
              {friend.online ? (
                friend.activity === 'playing' ? (
                  <span className="text-xs text-muted-foreground/50 font-medium px-2.5 py-1 bg-muted/40 rounded-md select-none">
                    In Game
                  </span>
                ) : (
                  <button
                    onClick={() => onInvite(friend)}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Invite
                  </button>
                )
              ) : (
                <span className="text-[10px] text-muted-foreground/40 font-semibold uppercase tracking-wider select-none pr-1">
                  Offline
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Online Matchmaker Modal ───────────────────────────────────────────── */
const OnlineMatchmakerModal = ({ onClose, currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await friendsApi.getFriends();
        setFriends(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load friends list');
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const handleInvite = async (friend) => {
    setSelectedFriend(friend);
    setInviting(true);
    try {
      await gameApi.invite(friend.id);
      toast.success(`Invitation sent to ${friend.fullName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
      setSelectedFriend(null);
      setInviting(false);
    }
  };

  const handleCancelInvite = async () => {
    try {
      await gameApi.leave();
    } catch (e) {}
    setSelectedFriend(null);
    setInviting(false);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[130] bg-black/55 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Container */}
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          className="pointer-events-auto w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
          initial={{ scale: 0.88, y: 32, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 32, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2.5">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground/50 tracking-[0.18em] uppercase mb-0.5">
                Multiplayer Arena
              </p>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                {inviting ? 'Matchmaking' : 'Invite a Friend'}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-border flex-1">
            {inviting && selectedFriend ? (
              <MatchmakingAnimation
                currentUser={currentUser}
                friend={selectedFriend}
                onCancel={handleCancelInvite}
              />
            ) : (
              <FriendsListView
                friends={friends}
                loading={loading}
                onInvite={handleInvite}
              />
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

/* ─── Game Hero ─────────────────────────────────────────────────────────── */
const GameHero = () => {
  const [inPersonOpen, setInPersonOpen] = useState(false);
  const [onlineModalOpen, setOnlineModalOpen] = useState(false);
  const currentUser = useSelector(selectUser);

  // Auto-close matchmaking modal once game is accepted and starts
  useEffect(() => {
    if (currentUser?.activity === 'playing') {
      setOnlineModalOpen(false);
    }
  }, [currentUser?.activity]);

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Top Cream Section */}
      <div className="relative bg-background pt-12 sm:pt-16 pb-32 sm:pb-40">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          {/* Let's Play */}
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-lg font-normal text-foreground">Let's Play</h2>
            <div className="h-px w-20 bg-border" />
          </div>

          {/* Quote - Absolute positioned in top right, hidden on mobile */}
          <div className="absolute right-6 sm:right-8 lg:right-12 top-12 sm:top-16 text-right hidden sm:block">
            <p className="text-muted-foreground text-sm sm:text-base mb-0.5 italic">
              "Every genius was once a beginner."
            </p>
            <p className="text-muted-foreground/60 text-xs sm:text-sm">
              – Unknown
            </p>
          </div>
        </div>

        {/* Large Title - Absolutely positioned to overlap */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-[40%] z-20">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
            <h1
              className="font-black text-primary leading-[3] tracking-tighter whitespace-nowrap"
              style={{
                fontSize: 'clamp(2.5rem, 12vw, 14rem)',
                fontWeight: 900,
              }}
            >
              TIC TAC TOE
            </h1>
          </div>
        </div>
      </div>

      {/* Blue Section */}
      <div className="relative flex-1 bg-primary min-h-[50vh]">
        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-16 flex flex-col">

          {/* Divider label */}
          <motion.div
            className="flex items-center gap-4 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-primary-foreground/40 text-xs font-mono tracking-widest uppercase">
              Choose Mode
            </span>
            <div className="h-px flex-1 bg-primary-foreground/15" />
          </motion.div>

          {/* Mode Buttons — separated by hairline dividers */}
          <div className="flex flex-col">
            {/* Top hairline */}
            <div className="h-px w-full bg-primary-foreground/15" />

            <ModeButton
              icon={Users}
              label="In Person"
              sublabel="Pass & play with a friend sitting next to you"
              index={0}
              onClick={() => setInPersonOpen(true)}
            />

            <div className="h-px w-full bg-primary-foreground/15" />

            <ModeButton
              icon={Wifi}
              label="Online with Friend"
              sublabel="Challenge a friend anywhere in the world"
              index={1}
              onClick={() => setOnlineModalOpen(true)}
            />

            {/* Bottom hairline */}
            <div className="h-px w-full bg-primary-foreground/15" />
          </div>

        </div>
      </div>


      {/* Modals & Dialog overlays */}
      <AnimatePresence>
        {inPersonOpen && (
          <InPersonGame onClose={() => setInPersonOpen(false)} />
        )}
        {onlineModalOpen && (
          <OnlineMatchmakerModal
            onClose={() => setOnlineModalOpen(false)}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default GameHero;
