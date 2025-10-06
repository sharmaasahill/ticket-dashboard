import { create } from 'zustand';
import { api, setAuthToken } from '@/lib/api';

type AuthState = {
  token?: string;
  email?: string;
  issueOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: undefined,
  email: undefined,
  async issueOtp(email: string) {
    await api.post('/auth/issue-otp', { email });
    set({ email });
  },
  async verifyOtp(email: string, code: string) {
    const { data } = await api.post('/auth/verify-otp', { email, code });
    setAuthToken(data.token);
    set({ token: data.token, email });
  },
  logout() {
    setAuthToken(undefined);
    set({ token: undefined, email: undefined });
  },
}));


