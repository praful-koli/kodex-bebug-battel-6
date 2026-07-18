# Debug Challenge Report

## Bug 1: Start Game button uses an invalid signup route

### Error

Clicking the **Start Game** button does not open the signup page. The user appears to remain on, or return to, the landing page.

### Root cause

The click handler in `frontend/src/pages/LandingPage.jsx` navigates to a route that does not exist:

```js
navigate('/auth/signup');
```

The configured signup route in `frontend/src/constants/index.js` is:

```js
SIGNUP: '/signup'
```

Because `/auth/signup` does not match any configured route, the wildcard route redirects the user to the home page.

### Solution

Change the Start Game navigation target to the configured signup route:

```js
navigate('/signup');
```

Prefer using the shared route constant to prevent future mismatches:

```js
navigate(ROUTES.SIGNUP);
```

### Verification

1. Start the frontend with `npm run dev`.
2. Open the landing page.
3. Click **Start Game**.
4. Confirm that the browser opens `/signup` and displays the signup page.

### Status

Fixed and verified.

## Bug 2: Selecting an avatar deletes signup form data

### Error

Submitting the signup form returns HTTP `400` with backend validation errors:

```text
Username is required
Full name is required
Password is required
```

The user account is not created.

### Root cause

In `frontend/src/features/auth/hooks/useSignup.js` at line 75, selecting an avatar replaces the complete `formData` object:

```js
setFormData(() => ({ avatar: avatar.url }));
```

This removes the previously collected `username`, `password`, and `fullName` values. The final signup request therefore sends only the avatar, and backend validation correctly rejects the missing required fields.

### Solution

Replace line 75 with a state update that preserves the existing form fields:

```js
setFormData((prev) => ({ ...prev, avatar: avatar.url }));
```

### Solution location

```text
File: frontend/src/features/auth/hooks/useSignup.js
Line: 75
Function: selectAvatar
```

### Verification

1. Complete signup steps 1 and 2.
2. Select an avatar in step 3.
3. Click **Finish**.
4. Confirm the request body contains `username`, `password`, `fullName`, and `avatar`.
5. Confirm the backend creates the user without missing-field validation errors.

### Status

Fixed and verified.

## Bug 3: Signup existing-user condition is reversed

### Error

After the signup request passes validation, a new username is incorrectly rejected with:

```text
Username is already taken
```

The backend can also continue toward user creation when the username already exists.

### Root cause

In `backend/src/services/auth.service.js` at line 17, the signup service throws the conflict error when no existing user is found:

```js
if (!exists) {
  throw new ApiError(HTTP_STATUS.CONFLICT, 'Username is already taken');
}
```

`userRepository.existsByUsername(username)` returns a truthy value when the username already exists and `null` when it is available. The `!exists` condition therefore reverses the intended behavior.

### Solution

Remove the negation from the condition at line 17:

```js
if (exists) {
  throw new ApiError(HTTP_STATUS.CONFLICT, 'Username is already taken');
}
```

### Solution location

```text
File: backend/src/services/auth.service.js
Line: 17
Function: signup
```

### Verification

1. Submit signup using a new, valid username and confirm the account is created.
2. Submit signup again using the same username.
3. Confirm the second request returns HTTP `409` with `Username is already taken`.
4. Confirm no duplicate user is created.

### Status

Fixed and verified.

## Bug 4: Stale unique email index prevents additional signups

### Error

MongoDB rejects signup with error code `11000`:

```text
E11000 duplicate key error collection: test.users index: email_1 dup key: { email: null }
```

### Root cause

The live `test.users` collection retained a unique, non-sparse `email_1` index from an older schema. The current `User` model does not contain an `email` field, so new users have no email value. After the first missing/null email value, the unique index rejects every subsequent user as a duplicate.

The live indexes before the fix were:

```text
_id_
username_1 (unique)
email_1 (unique, obsolete)
```

### Solution

Removed only the obsolete index from MongoDB Atlas:

```javascript
use test
db.users.dropIndex('email_1')
```

### Solution location

```text
Database: test
Collection: users
Index: email_1
```

### Verification

The live collection was queried after the change. Its remaining indexes are:

```text
_id_
username_1 (unique)
```

No user documents were deleted. A new signup can now insert a user without conflicting on `email: null`.

### Status

Fixed and verified.

## Bug 5: Online game does not alternate turns between players

### Error

Only one player can make moves in an online match. The opponent's board and turn do not update correctly.

### Root cause

The problem existed in both client and server state handling:

- The frontend optimistic update placed the opposite mark and retained the old `isXTurn` value.
- The frontend previously ignored authoritative `match-update` state from the server.
- The backend did not validate that the user making a move owned the current turn.
- The backend did not toggle `game.isXTurn` after a valid non-winning move.

### Solution

Corrected the optimistic move in `frontend/src/features/game/providers/GameProvider.jsx`:

```js
newBoard[cellIndex] = prev.isXTurn ? 'X' : 'O';

return {
  ...prev,
  board: newBoard,
  isXTurn: !prev.isXTurn,
};
```

The frontend also stores each server update:

```js
setMatch(updatedMatch);
```

Added server-side ownership validation in `backend/src/services/game/GameManager.js`:

```js
const isUsersTurn =
  (game.isXTurn && isPlayerX) || (!game.isXTurn && isPlayerO);

if (!isUsersTurn) return null;
```

The backend toggles the turn after a valid move:

```js
game.isXTurn = !game.isXTurn;
```

### Solution locations

```text
frontend/src/features/game/providers/GameProvider.jsx:65
frontend/src/features/game/providers/GameProvider.jsx:69
frontend/src/features/game/providers/GameProvider.jsx:128
backend/src/services/game/GameManager.js:80
backend/src/services/game/GameManager.js:139
```

### Verification

- Frontend production build completed successfully.
- A focused backend game-state test confirmed X moves first.
- A second consecutive move by X was rejected.
- O could make the next move.
- The turn returned to X after O moved.

### Status

Fixed and verified.

## Bug 6: Winning line remains after a round resets

### Error

After a player wins an online round and the board resets, the winning line remains visible over the new empty board.

### Root cause

`resetRound()` cleared `board` and `roundWinner` but retained the previous `winCombo`. The frontend renders the line whenever `winCombo` is not null.

### Solution

Updated `backend/src/services/game/GameManager.js` to clear the winning combination during a round reset:

```js
game.board = Array(9).fill(null);
game.roundWinner = null;
game.winCombo = null;
game.isXTurn = startingMark === 'X';
```

### Solution location

```text
File: backend/src/services/game/GameManager.js
Line: 154
Function: resetRound
```

### Verification

- Confirmed all board cells reset to `null`.
- Confirmed `roundWinner` resets to `null`.
- Confirmed `winCombo` resets to `null`.
- Confirmed the next round's starting turn is preserved.
- Frontend production build completed successfully.

### Status

Fixed and verified.

## Bug 7: Correct passwords are rejected during login

### Error

Valid credentials return `Invalid username or password`.

### Root cause

The login service threw the unauthorized error when `comparePassword()` returned `true`.

### Solution

Negated the condition so only an invalid password is rejected:

```js
if (!isPasswordValid) {
  throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid username or password');
}
```

### Solution location

```text
backend/src/services/auth.service.js:40
```

### Status

Fixed and verified.

## Bug 8: Every protected request reports an invalid JWT

### Error

Protected API requests return HTTP `401` with `Invalid token` immediately after authentication.

### Root cause

Tokens were signed with `env.JWT_ACCESS_SECRET` but verified using the misspelled property `env.JWT_ACCES_SECRET`, whose value was undefined.

### Solution

Use the same secret for signing and verification:

```js
return jwt.verify(token, env.JWT_ACCESS_SECRET);
```

### Solution location

```text
backend/src/utils/jwt.js:22
```

### Status

Fixed and verified.

## Bug 9: Invalid access token remains after logout or HTTP 401

### Error

The browser repeatedly sends an old invalid token after credentials are cleared.

### Root cause

The token was stored under `accessToken`, but `clearCredentials` removed the unrelated key `token`.

### Solution

Remove the correct local-storage key:

```js
localStorage.removeItem('accessToken');
```

### Solution location

```text
frontend/src/store/authSlice.js:51
```

### Status

Fixed and verified.

## Bug 10: All friends appear offline

### Error

The friends panel and online-game modal display active users as offline.

### Root cause

The backend calculated a dynamic `isOnline` value from `lastActive` but returned a hardcoded `online: false` value.

### Solution

Return the calculated value:

```js
online: Boolean(isOnline),
```

### Solution location

```text
backend/src/services/friendship.service.js:108
```

### Status

Fixed and verified.

## Bug 11: Every game invitation reports that the player is offline

### Error

`POST /api/game/invite` always returns `Player is offline and cannot accept invitations`.

### Root cause

The invitation service calculated `isReceiverOnline` but threw the offline error unconditionally.

### Solution

Throw only when the receiver is actually offline:

```js
if (!isReceiverOnline) {
  throw new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    'Player is offline and cannot accept invitations'
  );
}
```

### Solution location

```text
backend/src/services/gameInvite.service.js:46
```

### Status

Fixed and verified.

## Bug 12: Pending invitations are rejected as inactive

### Error

Responding to a new invitation returns `Invitation not found or no longer active`.

### Root cause

The response service required a new invitation to already have status `accepted`, although invitations are created with status `pending`.

### Solution

Validate against the pending status:

```js
if (!invite || invite.status !== 'pending') {
  throw new ApiError(
    HTTP_STATUS.NOT_FOUND,
    'Invitation not found or no longer active'
  );
}
```

### Solution location

```text
backend/src/services/gameInvite.service.js:84
```

### Status

Fixed and verified.

## Bug 13: Invitation Accept and Decline actions are reversed

### Error

Clicking **Accept** sends a reject action, while clicking **Decline** sends an accept action.

### Root cause

The two button handlers passed opposite action strings.

### Solution

Corrected both handlers:

```js
// Decline
handleRespondInvite(invite._id, 'reject');

// Accept
handleRespondInvite(invite._id, 'accept');
```

### Solution locations

```text
frontend/src/features/game/components/GameHeader.jsx:438
frontend/src/features/game/components/GameHeader.jsx:447
```

### Status

Fixed and verified.

## Bug 14: MongoDB Atlas DNS failure silently redirects data to local MongoDB

### Error

The backend prints `Primary MongoDB connection failed` and stores users in local database `xogame` instead of Atlas.

### Root cause

Node.js could not resolve the Atlas SRV record through the system DNS resolver. A direct connection test succeeded when using Google DNS.

### Solution

Configured Node's DNS resolver before connecting with Mongoose:

```js
dns.setServers(['8.8.8.8', '8.8.4.4']);
```

### Solution location

```text
backend/src/config/db.js:7
```

### Verification

The backend connected to an Atlas shard and selected the configured Atlas database.

### Status

Fixed and verified.

## Bug 15: Production frontend cannot reach the API, Socket.IO, or client-side routes

### Error

A Vercel deployment would send `/api` and Socket.IO traffic to the Vercel frontend origin. Directly opening routes such as `/login` or `/dashboard` could also return a Vercel 404, and the Render API did not enable HTTP CORS.

### Root cause

- `/api` depended on the development-only Vite proxy.
- Socket.IO used `window.location.origin` outside localhost.
- The Vite SPA had no Vercel fallback rewrite.
- Express did not install its existing `cors` dependency as middleware.

### Solution

- Added production API and socket URLs with `VITE_API_BASE_URL` and `VITE_SOCKET_URL` overrides.
- Updated Socket.IO to use the shared `SOCKET_URL` configuration.
- Added `frontend/vercel.json` to rewrite SPA routes to `index.html`.
- Added Express CORS using `env.CLIENT_ORIGIN`.

### Solution locations

```text
frontend/src/config/index.js:2
frontend/src/lib/socket.js:2
frontend/vercel.json
backend/src/app.js:17
```

### Verification

- Frontend production build completed successfully.
- Frontend and backend syntax checks passed.
- `vercel.json` parsed successfully.
- The production bundle contains the Render backend URL.

### Status

Fixed and verified. Render still requires CLIENT_ORIGIN to be set to the final Vercel URL.
