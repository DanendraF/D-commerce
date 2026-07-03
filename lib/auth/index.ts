// Auth utilities placeholder
// Full auth implementation will be added when Supabase auth is integrated

import { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export const mockAuthState: AuthState = {
  user: {
    id: 'mock-user-id',
    email: 'sarah.dewi@email.com',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {
      first_name: 'Sarah',
      last_name: 'Dewi',
    },
    aud: 'authenticated',
    confirmation_sent_at: undefined,
    confirmed_at: undefined,
    email_confirmed_at: undefined,
    invited_at: undefined,
    last_sign_in_at: undefined,
    phone: undefined,
    role: 'authenticated',
    updated_at: undefined,
  } as User,
  isLoading: false,
};

export function useAuthMock() {
  return mockAuthState;
}
