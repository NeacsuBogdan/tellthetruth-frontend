<template>
  <v-app>
    <v-sheet color="indigo" dark class="app-bar">
      <v-container class="toolbar-content">
        <v-text-field v-model="search" label="Search favorite locations..." solo-inverted hide-details
          class="input-field" @input="updateSearch(search)" />
        <v-select v-model="selectedCategories" :items="categoryOptions" item-title="text" item-value="value"
          label="Filter by Category" multiple chips solo-inverted hide-details class="input-field"
          @update:modelValue="updateCategories">
        </v-select>
      </v-container>
    </v-sheet>
  </v-app>
      <v-main>
      <v-container v-if="filteredFavoriteLocations.length === 0" class="d-flex flex-column justify-center align-center full-height animation-container">
        <LottieAnimation animationTag="noData" :loop="true" :scale="0.5" />
        <div class="no-favorites-message">Nu aveți locații la favorite!</div>
      </v-container>
      <card-list v-else :locations="filteredFavoriteLocations" />
    </v-main>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import CardList from '../components/CardList.vue';
import { useAuthStore, useLocationsStore, useCategoriesStore } from '@/store';
import LottieAnimation from '@/components/LottieAnimation.vue'; // Asigură-te că calea este corectă

export default {
  components: {
    CardList,
    LottieAnimation
  },
  setup() {
    const authStore = useAuthStore();
    const locationsStore = useLocationsStore();
    const categoriesStore = useCategoriesStore();
    const search = ref('');
    const selectedCategories = ref([]);
    const loading = ref(false);

    const categoryOptions = computed(() => {
      return categoriesStore.categories.map(category => ({
        text: category.Denumire,
        value: category.Id
      }));
    });

    function updateSearch(value) {
      locationsStore.setSearchQuery(value);
    }

    function updateCategories(newValues) {
      selectedCategories.value = newValues;
      locationsStore.setSelectedCategoryIds(newValues);
    }

    const filteredFavoriteLocations = computed(() => {
      const favoriteLocationIds = authStore.getFavoriteLocationIds;

      let filtered = locationsStore.locations.filter(location =>
        favoriteLocationIds.includes(location.Id)
      );

      if (search.value) {
        const normalizedSearch = search.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        filtered = filtered.filter(location => {
          const normalizedName = location.Nume.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          const normalizedServices = location.ProduseServicii.map(service => service.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
          const normalizedTip = location.Tip?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || '';
          return (
            normalizedName.includes(normalizedSearch) ||
            normalizedServices.some(service => service.includes(normalizedSearch)) ||
            normalizedTip.includes(normalizedSearch)
          );
        });
      }

      if (selectedCategories.value.length > 0) {
        filtered = filtered.filter(location => {
          return location.Categorii.some(catId => selectedCategories.value.includes(catId));
        });
      }

      return filtered;
    });

    return {
      updateSearch,
      updateCategories,
      selectedCategories,
      categoryOptions,
      filteredFavoriteLocations,
      search,
      isLoggedIn: authStore.isLoggedIn,
    };
  }
};
</script>

<style scoped>
.app-bar {
  margin-top: 64px;
  padding: 8px 16px;
  width: 100%;
  box-sizing: border-box;
}

.toolbar-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  gap: 16px;
  width: 100%;
}

.input-field {
  flex: 1;
  min-width: 100px;
}

/* Adăugăm margine de jos pentru a separa bara de restul conținutului */
.v-main {
    padding-top: 16px;
    margin-top: -750px;
}



/* Media query pentru ecrane mici */
@media (max-width: 600px) {
  .app-bar {
    padding: 16px 8px;
  }

  .toolbar-content {
    flex-direction: column;
    align-items: stretch;
  }

  .input-field {
    width: 100%;
  }
  /* Adăugăm margine de jos pentru a separa bara de restul conținutului */
.v-main {
    padding-top: 16px;
    margin-top: -400px;
}

}

.v-container.full-height {
  height: calc(100vh - 64px); /* Ajustează această valoare conform înălțimii app-bar */
}

.v-container.animation-container {
  margin-top: -300px; /* Ajustează această valoare pentru a muta containerul mai sus */
}

.no-favorites-message {
  color: white;
  font-size: 24px;
  text-align: center;
  margin-top: -230px;
}
</style>
