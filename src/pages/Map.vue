<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div id="map" class="map-container"></div>
      </v-col>
      <v-col cols="12" v-if="showSearch">
        <v-card color="indigo lighten-5" class="pa-4 mt-4" outlined>
          <v-card-title class="justify-center">
            <v-text-field
              label="Adresa, Denumire ,Categorie si Produse sau servicii"
              v-model="searchQuery"
              clearable
              outlined
              class="mx-4"
            ></v-text-field>
          </v-card-title>
          <v-card-actions class="justify-center flex-wrap">
            <v-btn color="primary" dark @click="searchLocation(searchQuery)" class="mx-2 mb-2">
              Search
            </v-btn>
            <v-btn color="secondary" dark @click="calculateRoute(searchQuery)" class="mx-2 mb-2">
              Calculate Route
            </v-btn>
            <v-btn color="error" dark @click="resetMap" class="mx-2 mb-2">
              Reset Map
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>



<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeAddress, fetchRoute, getCurrentLocation } from '@/services/generalService';
import polyline from '@mapbox/polyline';
import { useLocationsStore } from '@/store/locations'; // Import locations store
import { useCategoriesStore } from '@/store/categories'; // Import categories store
import { toast } from 'vue3-toastify';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css'; // Importăm stilurile
import 'leaflet.awesome-markers';

const props = defineProps({
  address: String,
  name: String,
  showSearch: { type: Boolean, default: true }
});
const emits = defineEmits(['request-route']);

const map = ref(null);
const searchQuery = ref('');
const routingControl = ref(null);
const userMarker = ref(null);
const destinationMarker = ref(null);
const locationMarkers = ref([]);
const locationsStore = useLocationsStore();
const categoriesStore = useCategoriesStore();
const router = useRouter();

onMounted(async () => {
  map.value = L.map('map', {zoomControl: true,zoom:1,zoomAnimation:false,fadeAnimation:true,markerZoomAnimation:true}).setView([37.784173, -122.401557], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value);

  if (props.showSearch) {
    await addAllLocations();
    const defaultCoords = await geocodeAddress("Avram Iancu nr 11-13, Constanța");
    if (defaultCoords) {
      map.value.setView([defaultCoords.lat, defaultCoords.lng], 18);
    }
  } else if (props.address) {
    zoomToAddress(props.address);
  }
});

watch(() => props.address, (newAddress) => {
  if (newAddress && !props.showSearch) {
    zoomToAddress(newAddress);
  }
});

const addAllLocations = async () => {
  clearMarkers(); // curăță toate markerele existente înainte de a adăuga locațiile

  const locations = locationsStore.locations;
  for (const location of locations) {
    const { Latitudine, Longitudine, Nume, Id, Categorii } = location;
    const marker = L.marker([Latitudine, Longitudine], {
      title: Nume,
      icon: L.AwesomeMarkers.icon({
        icon: 'info-sign',
        markerColor: 'blue'
      })
    });

    const popup = marker.bindPopup(createPopupContent(Nume, Id, Categorii));

    marker.on('click', () => {
      searchQuery.value = Nume; // Adaugă denumirea în bara de căutare
    });

    marker.on('add', () => {
      map.value.on('zoomend', () => {
        if (marker.isPopupOpen()) {
          marker.openPopup();
        }
      });
    });

    marker.on('remove', () => {
      map.value.off('zoomend');
    });

    marker.addTo(map.value);
    locationMarkers.value.push(marker);
  }
};

const createPopupContent = (name, id, categoryIds) => {
  const container = document.createElement('div');
  container.innerHTML = `<strong>${name}</strong><br>`;

  // Obținem denumirile categoriilor
  const categoriesStore = useCategoriesStore();
  const categoryNames = categoryIds.map(catId => categoriesStore.getCategoryNameById(catId)).join(', ');

  // Adăugăm categoriile la popup
  container.innerHTML += `<strong><em>Categorii:<br></strong> ${categoryNames}</em><br>`;

  const button = document.createElement('button');
  button.innerText = 'Go to details';
  button.addEventListener('click', () => {
    router.push({ name: 'LocationDetails', params: { id } });
  });
  container.appendChild(button);
  return container;
};

const resetMap = async () => {

    const defaultCoords = await geocodeAddress("Avram Iancu nr 11-13, Constanța");
    map.value.setView([defaultCoords.lat, defaultCoords.lng], 18);
  if (routingControl.value) {
    routingControl.value.remove();
    routingControl.value = null;
  }
  if (destinationMarker.value) {
    destinationMarker.value.remove();
    destinationMarker.value = null;
  }
  await addAllLocations(); // re-adaugarea tuturor locațiilor
};

const calculateRoute = async (address) => {
  if (!address) {
    toast.error('Please enter a destination address, location name, or category.');
    return;
  }

  try {
    const { latitude, longitude } = await getCurrentLocation();
    let destinationCoords = null;

    // Verificăm mai întâi dacă address este denumirea unei locații
    const normalizedQuery = removeDiacritics(address.toLowerCase());
    const location = locationsStore.locations.find(loc => removeDiacritics(loc.Nume.toLowerCase()).includes(normalizedQuery));
    if (location) {
      destinationCoords = { lat: location.Latitudine, lng: location.Longitudine };
    } else {
      // Dacă nu este găsită o locație după nume, căutăm adresa
      destinationCoords = await geocodeAddress(address);
    }

    if (destinationCoords) {
      const routeData = await fetchRoute(latitude, longitude, `${destinationCoords.lat},${destinationCoords.lng}`);

      if (routeData && routeData.path) {
        const coordinates = polyline.decode(routeData.path);

        if (routingControl.value) {
          routingControl.value.remove();
        }
        routingControl.value = L.polyline(coordinates, { color: 'blue' }).addTo(map.value);
        map.value.fitBounds(routingControl.value.getBounds());

        // Add marker for the current location
        if (userMarker.value) {
          userMarker.value.remove();
        }
        userMarker.value = L.marker([latitude, longitude], {
          title: 'Current Location',
          icon: L.AwesomeMarkers.icon({
            icon: 'user',
            markerColor: 'blue'
          })
        }).addTo(map.value).bindPopup('Current Location').openPopup();

        // Add marker for the destination
        if (destinationMarker.value) {
          destinationMarker.value.remove();
        }
        destinationMarker.value = L.marker([destinationCoords.lat, destinationCoords.lng], {
          title: 'Destination',
          icon: L.AwesomeMarkers.icon({
            icon: 'flag',
            markerColor: 'red'
          })
        }).addTo(map.value).bindPopup('Destination').openPopup();

        // Afișează un toast pentru calcularea rutei cu succes
        toast.success('Route calculated successfully!');
      } else {
        console.error("No path data available in the route data.");
        toast.error("No path data available.");
      }
    } else {
      toast.error('Failed to find the destination.');
    }
  } catch (error) {
    toast.error("Error calculating route.");
  }
};

const zoomToAddress = async (address) => {
  if (!address) {
    toast.error('Please enter a destination address, location name, or category.');
    return;
  }

  const coords = await geocodeAddress(address);
  if (coords) {
    map.value.setView([coords.lat, coords.lng], 18);

    if (destinationMarker.value) {
      destinationMarker.value.remove();
    }
    destinationMarker.value = L.marker([coords.lat, coords.lng], {
      title: props.name,
      icon: L.AwesomeMarkers.icon({
        icon: 'map-marker',
        markerColor: 'red'
      })
    })
    .addTo(map.value)
    .bindPopup(`Location: ${props.name}`)
    .openPopup();
  } else {
    toast.error('Failed to find the address.');
  }
};

const clearMarkers = () => {
  locationMarkers.value.forEach(marker => marker.remove());
  locationMarkers.value = [];
};

const removeDiacritics = (text) => {
  if (!text) return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const searchLocation = async (query) => {
  if (!query) {
    toast.error('Please enter a search query.');
    return;
  }

  clearMarkers();

  // Elimină ruta existentă, dacă există
  if (routingControl.value) {
    routingControl.value.remove();
    routingControl.value = null;
  }

  const normalizedQuery = removeDiacritics(query.toLowerCase());

  // Listă pentru a acumula toate locațiile relevante
  let allMatchingLocations = [];

  // Căutăm locațiile după nume
  const locationsByName = locationsStore.locations.filter(loc => removeDiacritics(loc.Nume.toLowerCase()).includes(normalizedQuery));
  allMatchingLocations = allMatchingLocations.concat(locationsByName);

  // Căutăm locațiile după categorie
  const category = categoriesStore.categories.find(cat => removeDiacritics(cat.Denumire.toLowerCase()).includes(normalizedQuery));
  if (category) {
    const locationsInCategory = locationsStore.locations.filter(loc => loc.Categorii.includes(category.Id));
    allMatchingLocations = allMatchingLocations.concat(locationsInCategory);
  }

  // Căutăm locațiile după produse și servicii
  const locationsWithServices = locationsStore.locations.filter(loc => loc.ProduseServicii.some(service => removeDiacritics(service.toLowerCase()).includes(normalizedQuery)));
  allMatchingLocations = allMatchingLocations.concat(locationsWithServices);

  // Eliminăm locațiile duplicate
  const uniqueLocations = Array.from(new Set(allMatchingLocations.map(loc => loc.Id))).map(id => {
    return allMatchingLocations.find(loc => loc.Id === id);
  });

  if (uniqueLocations.length > 0) {
    uniqueLocations.forEach(location => {
      const marker = L.marker([location.Latitudine, location.Longitudine], {
        title: location.Nume,
        icon: L.AwesomeMarkers.icon({
          icon: 'info-sign',
          markerColor: 'blue'
        })
      })
      .addTo(map.value)
      .bindPopup(createPopupContent(location.Nume, location.Id, location.Categorii))
      .on('click', () => {
        searchQuery.value = location.Nume; // Adaugă denumirea în bara de căutare
      });
      locationMarkers.value.push(marker);
    });
    const firstLocation = uniqueLocations[0];
    map.value.setView([firstLocation.Latitudine, firstLocation.Longitudine], 18);
    toast.success(`Locations found: ${uniqueLocations.map(loc => loc.Nume).join(', ')}`);
    return;
  }

  try {
    // Căutăm locația după adresă
    const coords = await geocodeAddress(query);
    if (coords) {
      if (destinationMarker.value) {
        destinationMarker.value.remove();
      }
      destinationMarker.value = L.marker([coords.lat, coords.lng], {
        title: query,
        Nume: query.value,
        icon: L.AwesomeMarkers.icon({
          icon: 'map-marker',
          markerColor: 'red'
        })
      })
      .addTo(map.value)
      .bindPopup(`${query}`)
      .on('click', () => {
        searchQuery.value = query; // Adaugă adresa în bara de căutare
      })
      .openPopup();
      map.value.setView([coords.lat, coords.lng], 18);
      locationMarkers.value.push(destinationMarker.value);
      toast.success(`Address found: ${query}`);
    } else {
      toast.error("Failed to find the location.");
      console.error("Failed to find the location.");
    }
  } catch (error) {
    toast.error("Failed to find the location.");
    console.error("Error during geocoding:", error);
  }
};



defineExpose({
  calculateRoute,
  searchLocation,
  resetMap // Expose the resetMap function
});
</script>

<style scoped>
.v-container{
  margin-top: 64px;
}

.map-container {
  height: 500px;
  width: 100%;
}

.mx-4 {
  margin-left: 1rem;
  margin-right: 1rem;
}

.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.pa-4 {
  padding: 1rem;
}

.v-card {
  background-color: #e8eaf6; /* Indigo lighten-5 */
}

.v-btn {
  font-weight: bold;
  color: white !important;
}

.v-btn.primary {
  background-color: #1e88e5 !important; /* Blue */
}

.v-btn.secondary {
  background-color: #43a047 !important; /* Green */
}

.v-btn.error {
  background-color: #e53935 !important; /* Red */
}

.v-card-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
