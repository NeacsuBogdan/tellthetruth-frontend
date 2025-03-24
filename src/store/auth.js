import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    userToken: sessionStorage.getItem('TellTheTruth Token') || null,
    userId: null,
    userName: null,
    userRole: null,
    favoriteLocations: []
  }),
  actions: {
    logIn(token, userId, userName, userRole) {
      sessionStorage.setItem('TellTheTruth Token', token);
      this.userToken = token;
      this.userId = userId;
      this.userName = userName;
      this.userRole = userRole;
      this.isLoggedIn = true;
    },
    logOut() {
      sessionStorage.removeItem('TellTheTruth Token');
      sessionStorage.removeItem('userConsent');
      this.userToken = null;
      this.userId = null;
      this.userName = null;
      this.userRole = null;
      this.favoriteLocations = [];
      this.isLoggedIn = false;
    },
    checkAuth() {
      const token = sessionStorage.getItem('TellTheTruth Token');
      if (token) {
        this.userToken = token;
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    },
    updateUserInfo(userId, userName, userRole) {
      this.userId = userId;
      this.userName = userName;
      this.userRole = userRole;
    },
    updateFavoriteLocations(favoriteLocations) {
      this.favoriteLocations = favoriteLocations || [];
    },
    addFavoriteLocation(locationId) {
      if (!this.favoriteLocations.includes(locationId)) {
        this.favoriteLocations.push(locationId);
      }
    },
    removeFavoriteLocation(locationId) {
      this.favoriteLocations = this.favoriteLocations.filter(id => id !== locationId);
    }
  },
  getters: {
    getFavoriteLocationIds: (state) => state.favoriteLocations
  }
});
