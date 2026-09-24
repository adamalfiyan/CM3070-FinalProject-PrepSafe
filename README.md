# PrepSafe — Feature Prototype

A standalone React Native (Expo) prototype implementing the **gamification engine**
for PrepSafe, a gamified disaster preparedness app. This prototype corresponds to
**Chapter 4** of the PrepSafe Preliminary Report.

## What it does

- **XP system** — 10 XP per task, 25 XP per quiz.
- **Streak tracking** — daily streak that persists across sessions and resets after a lapsed day.
- **Badges** — `First Steps`, `On a Roll` (3-day streak), and `Quiz Master`, awarded automatically.
- **Dashboard UI** — XP counter, streak, earned/locked badge row, task list, and quiz section.
- **Persistence** — all state stored in AsyncStorage, surviving app restarts.

## Tech stack

- React Native + Expo (SDK 54)
- `@react-native-async-storage/async-storage` for persistence
- `expo-linear-gradient` for the header
- Jest (`jest-expo`) for unit testing the gamification logic

## File structure

```
App.js                              Root entry; wraps app in GamificationProvider
src/context/GamificationContext.js  XP, streak, badge state (Context + useReducer)
src/screens/DashboardScreen.js      Main UI: XP, streak, badges, tasks, quizzes
src/screens/TaskScreen.js           Task/quiz completion (self-contained Modal)
src/utils/gamification.js           Pure functions: calculateXP, calculateStreak, evaluateBadges
src/utils/storage.js                AsyncStorage read/write helpers
src/constants/tasks.js              Task & quiz definitions
src/constants/badges.js             Badge definitions
src/constants/theme.js              Shared styling tokens
__tests__/gamification.test.js      Jest unit tests for the gamification engine
```

## Getting started

Install dependencies:

```bash
npm install
```

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
next-day, and lapsed-day scenarios), and badge evaluation including
combined-session edge cases.
