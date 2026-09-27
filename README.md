# PrepSafe

A React Native (Expo) app for local disaster preparedness, built for CM3070 Final Year Project. PrepSafe combines a gamified preparedness engine, live location-based emergency alerts, and a fully offline resource hub, backed by Firebase.

## What it does

- **Onboarding & auth** — Firebase email/password accounts with a household profile
  (family size, country, postcode, medical needs) stored in Firestore.
- **Gamification** — XP (10 per task, 25 per quiz), daily streaks, and badges
  (`First Steps`, `On a Roll`, `Quiz Master`), backed by Firestore with an
  AsyncStorage fallback for offline use.
- **Location-based alerts** — watches the device's GPS against emergency zones
  declared in Firestore using a haversine-formula distance check, and fires a
  local push notification with step-by-step guidance on entry. Includes a
  "Simulate Nearby Alert" demo button that creates a real zone at the device's
  current position, and a scrollable alert history.
- **Offline resource hub** — 18 first aid, evacuation, and emergency contact
  guides seeded into a local SQLite database, fully readable with no network
  connection at all.

## Tech stack

- React Native + Expo
- Firebase Authentication + Firestore (real-time listeners)
- `expo-location` and `expo-notifications` for GPS geofencing and local alerts
- `expo-sqlite` for the offline resource hub
- `@react-native-async-storage/async-storage` for the gamification fallback cache and auth session persistence
- `@react-navigation` (bottom tabs + native stack)
- Jest (`jest-expo`) for unit testing the gamification and geofencing logic

## File structure

```
App.js                                Root entry; wraps app in Auth/Gamification providers
firestore.rules                       Firestore security rules
src/config/firebase.js                Firebase app/auth/Firestore initialization
src/context/AuthContext.js            Auth state + Firestore household profile
src/context/GamificationContext.js    XP, streak, badge state (Context + useReducer)
src/navigation/RootNavigator.js       Onboarding vs. main tab navigator switch
src/screens/OnboardingScreen.js       Location permission, login/sign-up, household profile
src/screens/DashboardScreen.js        XP, streak, badges, tasks, quizzes
src/screens/PreparednessHubScreen.js  Full checklist & quiz library by category
src/screens/AlertsScreen.js           Live geofenced alerts, simulate button, alert history
src/screens/ResourceHubScreen.js      Offline first aid / evacuation / contacts guides
src/screens/TaskScreen.js             Task/quiz completion (self-contained Modal)
src/utils/gamification.js             Pure functions: calculateXP, calculateStreak, evaluateBadges
src/utils/geo.js                      distanceMeters (haversine) and isInsideZone
src/utils/resourceDb.js               SQLite seeding and queries for the resource hub
src/utils/storage.js                  Per-account AsyncStorage read/write helpers
src/constants/tasks.js                Task & quiz definitions
src/constants/badges.js               Badge definitions
src/constants/theme.js                Shared styling tokens
__tests__/gamification.test.js        Jest unit tests for the gamification engine
__tests__/geo.test.js                 Jest unit tests for the geofencing logic
```

## Getting started

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your Firebase project's web app config
(Firebase console → Project settings → General → Your apps → SDK setup and
configuration). `.env` is gitignored and never committed.

```bash
cp .env.example .env
```

Deploy `firestore.rules` to your Firebase project (via the Firebase console or
`firebase deploy --only firestore:rules` if you have the Firebase CLI set up),
so the app's Firestore reads/writes are actually permitted.

Run the app (opens Expo Dev Tools; scan the QR code with Expo Go):

```bash
npm start
```

Run on a specific platform:

```bash
npm run ios      # iOS simulator
npm run android  # Android emulator
```

## Running the tests

```bash
npm test
```

This runs the Jest suite covering XP calculation, streak logic (same-day,
next-day, and lapsed-day scenarios), badge evaluation including combined-session
edge cases, and the geofencing distance/zone-containment checks.
