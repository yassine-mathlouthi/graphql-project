import { useSyncExternalStore } from 'react';
import { getAuthSession, subscribeAuthSession } from './session';

export function useAuthSession() {
  return useSyncExternalStore(subscribeAuthSession, getAuthSession, getAuthSession);
}
