import { defineStore } from 'pinia';

function removeDiacritics(text) {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const useLocationsStore = defineStore('locations', {
  state: () => ({
    locations: [],
    recommendedLocations: [],
    searchQuery: '',
    selectedCategoryIds: []
  }),
  actions: {
    setLocations(locations) {
      this.locations = locations.map(location => ({
        ...location,
        ProduseServicii: JSON.parse(location.Produse_Servicii || '[]'),
        Categorii: location.Categorii.map(Number) // Convertim categoriile locațiilor la numere
      }));
    },
    setRecommendedLocations(locations) {
      this.recommendedLocations = locations.map(location => ({
        ...location,
        ProduseServicii: JSON.parse(location.Produse_Servicii || '[]'),
        Categorii: location.Categorii.map(Number) // Convertim categoriile locațiilor la numere
      }));
    },
    setSearchQuery(query) {
      if (typeof query !== 'string') {
        this.searchQuery = '';
      } else {
        this.searchQuery = removeDiacritics(query.toLowerCase());
      }
    },
    setSelectedCategoryIds(ids) {
      this.selectedCategoryIds = ids; // Nu mai convertim la string
    },
    markLocationAsReported(locationId, userId) {
      const location = this.locations.find(loc => loc.Id === locationId);
      if (location) {
        if (!location.ReportedBy) {
          location.ReportedBy = [];
        }
        location.ReportedBy.push(userId);
      }
    },
    unmarkLocationAsReported(locationId, userId) {
      const location = this.locations.find(loc => loc.Id === locationId);
      if (location && location.ReportedBy) {
        location.ReportedBy = location.ReportedBy.filter(id => id !== userId);
      }
    },
    removeLocation(locationId) {
      this.locations = this.locations.filter(location => location.Id !== locationId);
    },
    addLocation(location) {
      this.locations.push({
        ...location,
        ProduseServicii: JSON.parse(location.Produse_Servicii || '[]'),
        Imagini: location.Imagini || [],
        Categorii: location.Categorii.map(Number) // Convertim categoriile locațiilor la numere
      });
    },
    updateLocation(location) {
      const index = this.locations.findIndex(loc => loc.Id === location.Id);
      if (index !== -1) {
        this.locations[index] = {
          ...this.locations[index],
          ...location,
          ProduseServicii: JSON.parse(location.Produse_Servicii || '[]'),
          Imagini: location.Imagini || [],
          Categorii: location.Categorii.map(Number), // Convertim categoriile locațiilor la numere
          CodQR: location.CodQR // Actualizăm linkul QR
        };
      }
    }
  },
  getters: {
    filteredLocations: (state) => {
      let filtered = state.locations;
      const query = removeDiacritics(state.searchQuery.trim());
      if (query) {
        filtered = filtered.filter(location => {
          const normalizedName = removeDiacritics(location.Nume.toLowerCase());
          const normalizedTip = removeDiacritics(location.Tip?.toLowerCase() || '');
          const normalizedServices = location.ProduseServicii.map(service => removeDiacritics(service.toLowerCase()));
          return (
            normalizedName.includes(query) ||
            normalizedServices.some(service => service.includes(query)) ||
            normalizedTip.includes(query)
          );
        });
      }
      if (state.selectedCategoryIds.length > 0) {
        filtered = filtered.filter(location => {
          return location.Categorii.some(catId => state.selectedCategoryIds.includes(catId));
        });
      }
      return filtered;
    },
    filteredRecommendedLocations: (state) => {
      let filtered = state.recommendedLocations;
      const query = removeDiacritics(state.searchQuery.trim());
      if (query) {
        filtered = filtered.filter(location => {
          const normalizedName = removeDiacritics(location.Nume.toLowerCase());
          const normalizedTip = removeDiacritics(location.Tip?.toLowerCase() || '');
          const normalizedServices = location.ProduseServicii.map(service => removeDiacritics(service.toLowerCase()));
          return (
            normalizedName.includes(query) ||
            normalizedServices.some(service => service.includes(query)) ||
            normalizedTip.includes(query)
          );
        });
      }
      if (state.selectedCategoryIds.length > 0) {
        filtered = filtered.filter(location => {
          return location.Categorii.some(catId => state.selectedCategoryIds.includes(catId));
        });
      }
      return filtered;
    },
    filteredOwnedLocations: (state) => {
      return (userId) => {
        let filtered = state.locations.filter(location => location.Id_Proprietar === userId);
        const query = removeDiacritics(state.searchQuery.trim());
        if (query) {
          filtered = filtered.filter(location => {
            const normalizedName = removeDiacritics(location.Nume.toLowerCase());
            const normalizedTip = removeDiacritics(location.Tip?.toLowerCase() || '');
            const normalizedServices = location.ProduseServicii.map(service => removeDiacritics(service.toLowerCase()));
            return (
              normalizedName.includes(query) ||
              normalizedServices.some(service => service.includes(query)) ||
              normalizedTip.includes(query)
            );
          });
        }
        if (state.selectedCategoryIds.length > 0) {
          filtered = filtered.filter(location => {
            return location.Categorii.some(catId => state.selectedCategoryIds.includes(catId));
          });
        }
        return filtered;
      };
    },
    userOwnedLocationsCount: (state) => (userId) => {
      return state.locations.filter(location => location.Id_Proprietar === userId).length;
    },
    getLocationById: (state) => (id) => {
      return state.locations.find(location => location.Id === id);
    }
  }
});
