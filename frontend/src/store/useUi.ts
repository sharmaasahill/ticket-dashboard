import { create } from 'zustand';
import { api } from '@/lib/api';

type UiState = {
  superOn: boolean;
  toggleSuper: (password?: string) => Promise<void>;
};

export const useUi = create<UiState>((set, get) => ({
  superOn: false,
  async toggleSuper(password?: string) {
    if (!get().superOn) {
      const { data } = await api.post('/admin/super-verify', { password });
      if (data.ok) set({ superOn: true });
    } else {
      set({ superOn: false });
    }
  },
}));


