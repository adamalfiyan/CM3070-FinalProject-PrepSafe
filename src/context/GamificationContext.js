// Global gamification state (XP, streak, completed tasks, badges) via Context + useReducer, persisted to AsyncStorage/Firestore.

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { calculateXP, calculateStreak, evaluateBadges } from '../utils/gamification';
import { getTaskById } from '../constants/tasks';
import { loadState, saveState } from '../utils/storage';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const gamificationDocRef = (uid) => doc(db, 'users', uid, 'gamification', 'state');

// Throws on network errors so caller can distnguish "no doc yet" from "offline".
async function loadFirestoreState(uid) {
  const snap = await getDoc(gamificationDocRef(uid));
  return snap.exists() ? snap.data() : null;
}

async function saveFirestoreState(uid, state) {
  try {
    await setDoc(gamificationDocRef(uid), state);
  } catch (error) {
    console.warn('PrepSafe: failed to save Firestore gamification state (offline?)', error);
  }
}

const initialState = {
  xp: 0,
  streak: 0,
  lastCompletionDate: null,
  completedTaskIds: [],
  earnedBadgeIds: [],
  hydrated: false,
  lastEarnedBadgeIds: [],
};

const ACTIONS = {
  LOAD_STATE: 'LOAD_STATE',
  COMPLETE_TASK: 'COMPLETE_TASK',
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_STATE: {
      return {
        ...state,
        ...action.payload,
        hydrated: true,
        lastEarnedBadgeIds: [],
      };
    }

    case ACTIONS.COMPLETE_TASK: {
      const { taskId, taskType } = action.payload;

      // Ignore unknown or already completed items.
      if (!getTaskById(taskId) || state.completedTaskIds.includes(taskId)) {
        return { ...state, lastEarnedBadgeIds: [] };
      }

      const now = Date.now();
      const newXP = calculateXP(state.xp, taskType);
      const newStreak = calculateStreak(state.lastCompletionDate, state.streak, now);
      const newCompletedTaskIds = [...state.completedTaskIds, taskId];
      const newlyEarned = evaluateBadges(
        newCompletedTaskIds,
        newStreak,
        state.earnedBadgeIds
      );
      const newEarnedBadgeIds = [...state.earnedBadgeIds, ...newlyEarned];

      return {
        ...state,
        xp: newXP,
        streak: newStreak,
        lastCompletionDate: now,
        completedTaskIds: newCompletedTaskIds,
        earnedBadgeIds: newEarnedBadgeIds,
        lastEarnedBadgeIds: newlyEarned,
      };
    }

    default:
      return state;
  }
}

const GamificationContext = createContext(undefined);

export function GamificationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();

  // Hydrate on user change: Firestore is the source of truth per-account, local cache is only a fallback when offline.
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        const local = await loadState();
        if (mounted) dispatch({ type: ACTIONS.LOAD_STATE, payload: local || {} });
        return;
      }

      try {
        const remote = await loadFirestoreState(user.uid);
        if (mounted) dispatch({ type: ACTIONS.LOAD_STATE, payload: remote || {} });
      } catch (error) {
        console.warn('PrepSafe: could not reach Firestore, using local cache', error);
        const local = await loadState(user.uid);
        if (mounted) dispatch({ type: ACTIONS.LOAD_STATE, payload: local || {} });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Persist state after hydration always to AsyncStorage, and to Firestore in the background if signed in.
  useEffect(() => {
    if (!state.hydrated) {
      return;
    }
    const snapshot = {
      xp: state.xp,
      streak: state.streak,
      lastCompletionDate: state.lastCompletionDate,
      completedTaskIds: state.completedTaskIds,
      earnedBadgeIds: state.earnedBadgeIds,
    };
    saveState(snapshot, user?.uid);
    if (user) {
      saveFirestoreState(user.uid, snapshot);
    }
  }, [
    user,
    state.hydrated,
    state.xp,
    state.streak,
    state.lastCompletionDate,
    state.completedTaskIds,
    state.earnedBadgeIds,
  ]);

  const completeTask = (taskId, taskType) => {
    dispatch({ type: ACTIONS.COMPLETE_TASK, payload: { taskId, taskType } });
  };

  const value = { ...state, completeTask };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
