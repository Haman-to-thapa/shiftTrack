import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'shifttrack_token';
const USER_KEY = 'shifttrack_user';

export const saveSession = async (token: string, user: object) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getSession = async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const user = await SecureStore.getItemAsync(USER_KEY);

    if (!token || !user) {
        return null;
    }

    return {
        token,
        user: JSON.parse(user),
    };
};

export const clearSession = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
};