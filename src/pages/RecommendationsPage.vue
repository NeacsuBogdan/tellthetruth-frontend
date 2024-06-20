<template>
  <v-app>
    <v-sheet color="indigo" dark class="app-bar">
      <v-container class="toolbar-content">
        <v-text-field v-model="search" label="Search locations..." solo-inverted hide-details
          class="input-field" @input="updateSearch(search)" />
        <v-select v-model="selectedCategories" :items="categoryOptions" item-title="text" item-value="value"
          label="Filter by Category" multiple chips solo-inverted hide-details class="input-field"
          @update:modelValue="updateCategories">
        </v-select>
      </v-container>
    </v-sheet>
  </v-app>
      <v-main>
      <v-container v-if="loading" class="d-flex justify-center align-center full-height animation-container">
        <LottieAnimation animationTag="loadingRecomendations" :loop="true" :scale="0.5" />
      </v-container>
      <v-container v-else-if="!loading && filteredRecommendedLocations.length === 0" class="d-flex flex-column justify-center align-center full-height animation-container">
        <LottieAnimation animationTag="noData" :loop="true" :scale="0.5" />
        <div class="no-recommendations-message">Nu s-au găsit recomandări în apropierea dumneavoastră!</div>
      </v-container>
      <card-list v-else :locations="filteredRecommendedLocations" />
    </v-main>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import CardList from '../components/CardList.vue';
import { useAuthStore, useLocationsStore, useCategoriesStore } from '@/store';
import { getRecommendedLocations } from '@/services/locationService';
import { getCurrentLocation } from '@/services/generalService';
import LottieAnimation from '@/components/LottieAnimation.vue'; // Asigură-te că calea este corectă
import { toast } from 'vue3-toastify';

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
    const loading = ref(true);

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
    const filteredRecommendedLocations = computed(() => {
      return locationsStore.filteredRecommendedLocations;
    });

    onMounted(async () => {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        const recommendedIds = await getRecommendedLocations(latitude, longitude);

        const allLocations = locationsStore.locations;
        const recommendedLocations = allLocations.filter(location => recommendedIds.includes(location.Id));

        locationsStore.setRecommendedLocations(recommendedLocations);

      } catch (error) {
        toast.error(`${error.response.data.message}`);
      } finally {
        loading.value = false;
      }
    });

    return {
      updateSearch,
      updateCategories,
      selectedCategories,
      categoryOptions,
      filteredRecommendedLocations,
      search,
      loading,
      isLoggedIn: authStore.isLoggedIn,
    };
  }
};
</script>

<style scoped>

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
  height: calc(100vh - 64px); /* Adjust this value according to your app-bar height */
}

.v-container.animation-container {
  margin-top: -250px; /* Adjust this value to move the container higher */
}

.no-recommendations-message {
  color: white;
  font-size: 24px;
  text-align: center;
  margin-top: -230px;
}
</style>
