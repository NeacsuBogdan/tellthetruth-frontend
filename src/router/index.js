import { createRouter, createWebHistory } from 'vue-router';
import * as Pages from '../pages/pages.js';
import { useAuthStore , useLocationsStore } from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Pages.Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Pages.Auth,
    meta: { guestOnly: true }
  },
  {
    path: '/map',
    name: 'Map',
    component: Pages.Map,
  },
  {
    path: '/locations',
    name: 'Locations',
    component: Pages.Locations
  },
  {
    path: '/location-details/:id',
    name: 'LocationDetails',
    component: Pages.LocationDetails,
    props: route => ({ id: Number(route.params.id) })
  },
  {
    path: '/recommendations',
    name: 'RecommendationsPage',
    component: Pages.RecommendationsPage,
    meta: { requiresAuth: true } // Adăugat meta requiresAuth
  },
  {
    path: '/favorites',
    name: 'FavoritesPage',
    component: Pages.FavoritesPage,
    meta: { requiresAuth: true } // Adăugat meta requiresAuth
  },
  {
    path: '/owned-locations',
    name: 'OwnedLocationsPage',
    component: Pages.OwnedLocationsPage,
    meta: { requiresAuth: true, requiredRole: 'location_owner' } // Adăugat meta requiresAuth și requiredRole
  }
];

export function createRouterInstance() {
  const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  });

  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    await authStore.checkAuth(); // Asigură-te că checkAuth este o funcție asincronă dacă este necesar
    const isLoggedIn = authStore.isLoggedIn;
    let userRole = authStore.userRole;
    const locationsStore = useLocationsStore();

    if (authStore.userId) {
      if (locationsStore.userOwnedLocationsCount(authStore.userId) > 0) {
        userRole = "location_owner";
      }
    }

    if (to.matched.some(record => record.meta.guestOnly) && isLoggedIn) {
      next({ name: 'Home' });
    } else if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
      next({ name: 'Login' });
    } else if (to.matched.some(record => record.meta.requiredRole)) {
      const requiredRole = to.meta.requiredRole;
      if (userRole === requiredRole) {
        next();
      } else {
        next({ name: 'Home' });
      }
    } else {
      next();
    }
  });

  return router;
}
