// AsyncStorage helpers for gamification state, keyed by uid so accounts never share cached data.

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_KEY = '@prepsafe/gamification_state';

function keyFor(uid) {
  return `${BASE_KEY}/${uid || 'guest'}`;
}

// loadState: reads persisted gamification state for a uid, or null if none stored.
export async function loadState(uid) {
  try {
    const raw = await AsyncStorage.getItem(keyFor(uid));
    if (raw == null) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn('PrepSafe: failed to load state', error);
    return null;
  }
}

// saveState: persists gamification state to AsyncStorage for a uid.
export async function saveState(state, uid) {
  try {
    await AsyncStorage.setItem(keyFor(uid), JSON.stringify(state));
  } catch (error) {
    console.warn('PrepSafe: failed to save state', error);
  }
}

// clearState: removes all persisted state for a uid (testing/reset).
export async function clearState(uid) {
  try {
    await AsyncStorage.removeItem(keyFor(uid));
  } catch (error) {
    console.warn('PrepSafe: failed to clear state', error);
  }
}
