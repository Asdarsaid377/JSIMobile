import * as SecureStore from "expo-secure-store";

import type { AuthUser, Session } from "@/types/auth";

const TOKEN_KEY = "acces_token";
const USER_KEY = "session_user";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setSession(token: string, user: AuthUser): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function getSession(): Promise<Session | null> {
  const [token, rawUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);
  if (!token || !rawUser) {
    return null;
  }
  try {
    return { token, user: JSON.parse(rawUser) as AuthUser };
  } catch (error) {
    console.error("[lib/api/token/getSession]", error);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
