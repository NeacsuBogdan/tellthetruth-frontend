// store/profile.js
import { defineStore } from 'pinia';
import { persist } from '@pinia/plugin-persist';

export const useProfileStore = defineStore('profile', {
  plugins: [persist({
    key: 'profileStore',
    storage: window.sessionStorage
  })],
  state: () => ({
    userId: null
  }),
  actions: {
    setUserId(userId) {
      this.userId = userId;
    },
    clearProfile() {
      this.userId = null;
    }
  }
});
