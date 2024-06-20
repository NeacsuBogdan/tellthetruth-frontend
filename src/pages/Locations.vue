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
                <v-btn class="add-location-btn" @click="dialog = true" v-if="isLoggedIn">Add Location</v-btn>
            </v-container>
        </v-sheet>
        <v-dialog v-model="dialog" persistent max-width="600px">
            <location-form @close-dialog="dialog = false"></location-form>
        </v-dialog>
    </v-app>
            <v-main>
            <card-list :locations="filteredLocations" />
        </v-main>
</template>

<script>
import { computed, ref } from 'vue';
import CardList from '../components/CardList.vue';
import LocationForm from '../components/LocationForm.vue';
import { useAuthStore, useLocationsStore, useCategoriesStore } from '@/store';

export default {
    components: {
        CardList,
        LocationForm
    },
    setup() {
        const authStore = useAuthStore();
        const locationsStore = useLocationsStore();
        const categoriesStore = useCategoriesStore();
        const dialog = ref(false);
        const search = ref('');
        const selectedCategories = ref([]);

        const categoryOptions = computed(() => {
            return categoriesStore.categories.map(category => ({
                text: category.Denumire,  // Textul afișat
                value: category.Id  // Valoarea folosită pentru model
            }));
        });

        function updateSearch(value) {
            search.value = value;
        }

        function updateCategories(newValues) {
            selectedCategories.value = newValues;
        }

        const filteredLocations = computed(() => {
            let filtered = locationsStore.locations;

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
            isLoggedIn: authStore.isLoggedIn,
            updateSearch,
            updateCategories,
            selectedCategories,
            categoryOptions,
            filteredLocations,
            dialog,
            search
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
    max-height: 400px;
    /* Asigurăm că se ajustează corect înălțimea */
}

.input-field {
    flex: 1;
    min-width: 100px;
}

.add-location-btn {
    color: #4caf50;
    border: 2px solid #4caf50;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: bold;
    text-transform: uppercase;
    transition: background-color 0.3s, color 0.3s;
    background-color: transparent;
    /* Fundal transparent */
}

.add-location-btn:hover {
    background-color: #4caf50;
    color: white;
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
        /* Ajustăm padding-ul pentru ecrane mici */
        min-height: 200px;
        /* Setăm o înălțime minimă adecvată pentru ecrane mici */
    }

    .toolbar-content {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        height: auto;
        /* Asigurăm că se ajustează corect înălțimea */
    }

    .input-field {
        width: 100%;
        max-width: none;
    }

    .add-location-btn {
        padding: 8px 16px;
        background-color: transparent;
        /* Fundal transparent */
    }
  /* Adăugăm margine de jos pentru a separa bara de restul conținutului */
.v-main {
    padding-top: 16px;
    margin-top: -350px;
}

}


</style>
