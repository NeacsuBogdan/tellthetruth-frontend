// plugins/index.js
import vuetify from './vuetify';
import pinia from '@/store/index.js';
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export function registerPlugins(app) {
  app
    .use(vuetify)
    .use(pinia)
    .use(Vue3Toastify, {
      autoClose: 3000,
      position: 'top-right'
    });
}
