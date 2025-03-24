import { createApp } from 'vue';
import { registerPlugins } from '@/plugins';
import 'leaflet/dist/leaflet.css';
import App from './App.vue';
import { loadCategories, loadLocations, loadReviews, loadLocationReports, loadReviewReports } from "./services/loadDataService.js";
import { useLocationsStore, useCategoriesStore, useReviewsStore, useAuthStore, useReportsStore, useBadWordsStore } from './store';
import authService from './services/authService'; 
import { fetchBadWords } from './services/generalService'; 
import { createRouterInstance } from '@/router';
import { preloadAnimations } from '@/services/animationService';

async function loadAndMount() {
    const app = createApp(App);

    app.config.warnHandler = (msg, vm, trace) => {
        if (msg.includes('<Suspense>')) {
            return;
        }
        console.warn(`[Vue warn]: ${msg}${trace}`);
    };

    registerPlugins(app);

    const categoriesStore = useCategoriesStore();
    const locationsStore = useLocationsStore();
    const reviewsStore = useReviewsStore();
    const authStore = useAuthStore();
    const reportsStore = useReportsStore();
    const badWordsStore = useBadWordsStore();

    try {
        if (authStore.userToken) {
            await authService.fetchUserData();
        }

        const categories = await loadCategories();
        const locations = await loadLocations();
        const reviews = await loadReviews();
        const locationReports = await loadLocationReports();
        const reviewReports = await loadReviewReports();
        const badWordsResponse = await fetchBadWords();

        if (categories) {
            categoriesStore.setCategories(categories);
        }
        if (locations) {
            locationsStore.setLocations(locations);
        }
        if (reviews) {
            reviewsStore.setReviews(reviews);
        }
        if (locationReports) {
            reportsStore.setLocationReports(locationReports);
        }
        if (reviewReports) {
            reportsStore.setReviewReports(reviewReports);
        }
        if (badWordsResponse.data) {
            badWordsStore.loadBadWordsData(badWordsResponse.data);
        }

        const animationPaths = [
            { tag: 'main', path: '/animations/1716816015618.json' },
            { tag: 'login', path: '/animations/1717006180139.json' },
            { tag: 'review', path: '/animations/1717022407384.json' },
            { tag: 'report', path: '/animations/1717059038323.json'},
            { tag: 'reportVerify', path: '/animations/1717064567174.json'},
            { tag: 'loadingRecomendations', path: '/animations/1717067759771.json'},
            { tag: 'noData', path: '/animations/1717426915771.json'},
            { tag: 'rating', path: '/animations/1717447371897.json'},
        ];

        await preloadAnimations(animationPaths);

        const router = createRouterInstance();

        app.use(router);

        app.mount('#app');

    } catch (error) {
        console.error('Error during initial data loading:', error);
    }
}

loadAndMount();
