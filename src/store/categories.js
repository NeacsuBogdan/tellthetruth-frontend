// in store/categories.js
import { defineStore } from 'pinia';

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: []
  }),
  actions: {
    setCategories(categories) {
      this.categories = categories;
    },
    clearCategories() {
      this.categories = [];
    },
getCategoryNameById(id) {
  const numericId = parseInt(id, 10);
  const category = this.categories.find(cat => cat.Id === numericId);
  return category ? category.Denumire : 'Unknown Category';
}
  }
});
