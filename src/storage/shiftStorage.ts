import * as SecureStore from 'expo-secure-store';

const ACTIVE_SHIFT_KEY = 'shifttrack_active_shift';

export const saveActiveShift = async (shift: object) => {
  await SecureStore.setItemAsync(
    ACTIVE_SHIFT_KEY,
    JSON.stringify(shift),
  );
};

export const getActiveShift = async () => {
  try {
    const shift = await SecureStore.getItemAsync(ACTIVE_SHIFT_KEY);

    if (!shift) {
      return null;
    }

    return JSON.parse(shift);
  } catch {
    return null;
  }
};

export const clearActiveShift = async () => {
  try {
    await SecureStore.deleteItemAsync(ACTIVE_SHIFT_KEY);
  } catch {
    // Ignore error if key doesn't exist
  }
};
