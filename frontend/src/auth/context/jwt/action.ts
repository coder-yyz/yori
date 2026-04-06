import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  account: string;
  password: string;
};

export type SignUpParams = {
  username: string;
  email: string;
  password: string;
  displayName: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ account, password }: SignInParams): Promise<void> => {
  try {
    const params = { account, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { token: accessToken } = res.data.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  username,
  email,
  password,
  displayName,
}: SignUpParams): Promise<void> => {
  const params = { username, email, password, displayName };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { token: accessToken } = res.data.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
