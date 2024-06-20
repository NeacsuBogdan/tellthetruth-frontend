// store/index.js
import { createPinia } from 'pinia';
import { useAuthStore } from './auth';
import { useCategoriesStore } from './categories';
import { useLocationsStore } from './locations';
import { useReviewsStore } from './reviews';  // Adaugă importul pentru noul store
import { useReportsStore } from './reports';
import { useBadWordsStore } from './badWords';

const pinia = createPinia();

export { useAuthStore, useCategoriesStore, useLocationsStore, useReviewsStore, useReportsStore,useBadWordsStore };  // Exportă noul store

export default pinia;
