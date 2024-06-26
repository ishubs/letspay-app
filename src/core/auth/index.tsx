import auth from '@react-native-firebase/auth';
import { create } from 'zustand';

import { createSelectors } from '../utils';
import type { TokenType } from './utils';
import { removeToken, setToken } from './utils';

interface AuthState {
  token: TokenType | null;
  status: 'idle' | 'signOut' | 'signIn';
  signIn: (data: TokenType) => void;
  signOut: () => void;
  hydrate: () => void;
}

const _useAuth = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  signIn: (token) => {
    setToken(token);
    set({ status: 'signIn', token });
  },
  signOut: () => {
    removeToken();
    try {
      auth()
        .signOut()
        .then(() => {
          set({ status: 'signOut', token: null });
        })
        .catch((err) => {
          console.error('Error signing out: ', err);
          set({ status: 'signOut', token: null });
        });
    } catch (e) {
      console.error('Error signing out: ', e);
    }
  },
  hydrate: async () => {
    try {
      const user = auth().currentUser;
      console.log('User: ', user);
      if (user) {
        // User is signed in
        const idToken = await user.getIdToken();
        if (idToken) {
          get().signIn({ access: idToken, refresh: '' });
        } else {
          get().signOut();
        }
      } else {
        // No user is signed in
        get().signOut();
      }
    } catch (e) {
      console.error('Error during hydration: ', e);
      // Sign out user in case of error
      get().signOut();
    }
  },
}));

export const useAuth = createSelectors(_useAuth);

export const signOut = () => _useAuth.getState().signOut();
export const signIn = (token: TokenType) => _useAuth.getState().signIn(token);
export const hydrateAuth = () => _useAuth.getState().hydrate();
