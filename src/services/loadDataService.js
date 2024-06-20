import axios from 'axios';
import { useReviewsStore } from '@/store/reviews';  // Importă useReviewsStore

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

export async function loadCategories() {
    try {
        const token = sessionStorage.getItem('TellTheTruth Token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const response = await axios.get(`${API_URL}/categories`, config);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch categories: Status ${response.status}`);
        }

        return response.data;  // Returnează direct datele pentru a fi gestionate de magazin
    } catch (error) {
        console.error('Error loading categories:', error.message);
        return null;
    }
}

export async function loadLocations() {
    try {
        const token = sessionStorage.getItem('TellTheTruth Token');
        const config = {
            headers: {}
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get(`${API_URL}/locations`, config);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch locations: Status ${response.status}`);
        }

        return response.data;  // Returnează direct datele pentru a fi gestionate de magazin
    } catch (error) {
        console.error('Error loading locations:', error.message);
        return null;
    }
}

// Funcția pentru încărcarea recenziilor
export async function loadReviews() {
    const token = sessionStorage.getItem('TellTheTruth Token');
    const config = {
        headers: {}
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await axios.get(`${API_URL}/reviews`, config);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch reviews: Status ${response.status}`);
        }

        const reviewsStore = useReviewsStore();
        reviewsStore.setReviews(response.data);  // Setează recenziile în magazinul Pinia
    } catch (error) {
        console.error('Error loading reviews:', error.message);
        return null;
    }
}

export async function loadLocationReports() {
    try {
        const token = sessionStorage.getItem('TellTheTruth Token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const response = await axios.get(`${API_URL}/get-reports-locations`, config);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch location reports: Status ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error loading location reports:', error.message);
        return null;
    }
}

export async function loadReviewReports() {
    try {
        const token = sessionStorage.getItem('TellTheTruth Token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const response = await axios.get(`${API_URL}/get-reports-reviews`, config);

        if (response.status !== 200) {
            throw new Error(`Failed to fetch review reports: Status ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error loading review reports:', error.message);
        return null;
    }
}