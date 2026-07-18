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

Identified and documented; not fixed yet.

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

Identified and documented; not fixed yet.

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

Identified and documented; not fixed yet.

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
