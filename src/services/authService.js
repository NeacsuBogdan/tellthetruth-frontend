import axios from 'axios';
import { useAuthStore } from '@/store/auth'; // Import the store

const getApiUrl = () => {
    let apiUrl;
    if (window.location.hostname === 'localhost') {
        apiUrl = 'http://localhost:8080';  // Local development
    } else {
        const hostname = window.location.hostname;
        apiUrl = `https://${hostname}:8080`;  // Presupunem HTTPS și portul 8080
    }
    return apiUrl;
}

const API_URL = getApiUrl();

const authService = {
    async login(userCredentials) {
        try {
            const response = await axios.post(`${API_URL}/login`, userCredentials);
            const { token, userId, role } = response.data; // Asumăm că role-ul este returnat
            if (token && userId) {
                const authStore = useAuthStore();
                authStore.logIn(token, userId, role, null); // Loghează utilizatorul în sistem cu token, userId și rol
                await this.fetchUserData(); // Fetch user data after login
                return response.data;
            } else {
                throw new Error('Login response missing token or userId');
            }
        } catch (error) {
            throw error;
        }
    },
    async register(userData) {
        return axios.post(`${API_URL}/register`, userData);
    },
    logout() {
        const authStore = useAuthStore();
        authStore.logOut(); // Log out using the store
    },
async fetchUserData() {
    const authStore = useAuthStore();
    if (authStore.userToken) {
        try {
            const response = await axios.get(`${API_URL}/verify-token`, {
                headers: {
                    Authorization: `Bearer ${authStore.userToken}`
                }
            });
            const { id, name, role, favoriteLocationIds } = response.data; // Include favoriteLocationIds in destructuring

            authStore.updateUserInfo(id, name, role); // Update user info in the store
            authStore.updateFavoriteLocations(favoriteLocationIds); // Update favorite locations in the store
        } catch (error) {
            if (error.response && error.response.status === 401) {
                authStore.logOut(); // Log out if token is invalid
            }
            throw error;
        }
    }
}

}

export default authService;
