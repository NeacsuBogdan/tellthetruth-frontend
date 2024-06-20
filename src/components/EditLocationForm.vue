<template>
  <v-container>
    <v-stepper v-model="step">
      <!-- Header Steper -->
      <v-stepper-header>
        <v-stepper-item :complete="step > 0" step="1">
          Informații locație
        </v-stepper-item>
        <v-stepper-item :complete="step > 1" step="2">
          Produse, Servicii și Categorii
        </v-stepper-item>
        <v-stepper-item :complete="step > 2" step="3">
          Imagini
        </v-stepper-item>
      </v-stepper-header>

      <!-- Step Content -->
      <v-stepper-window>
        <!-- Informații locație -->
        <v-stepper-window-item step="1">
          <v-card flat>
            <v-form ref="locationInfoForm">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="locationData.Nume"
                    :rules="nameRules"
                    label="Nume locație"
                    outlined
                    required
                    :disabled="!isFormActive"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="locationData.Adresa"
                    :rules="addressRules"
                    label="Adresa locației"
                    outlined
                    required
                    :disabled="!isFormActive"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="locationData.Tip"
                    :rules="typeRules"
                    label="Tip locație"
                    outlined
                    required
                    :disabled="!isFormActive"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="d-flex justify-end mt-4">
                  <v-btn
                    :disabled="!isValidStep1 || !isFormActive"
                    color="primary"
                    @click="nextStep"
                    >Următorul</v-btn
                  >
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-stepper-window-item>

        <!-- Produse, Servicii și Categorii -->
        <v-stepper-window-item step="2">
          <v-card flat>
            <v-form ref="tagsServicesForm">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="currentService"
                    label="Adaugă Serviciu/Produs"
                    append-icon="mdi-plus"
                    @click:append="addServiceTag"
                    @keydown.enter.prevent="addServiceTag"
                    outlined
                    dense
                    :disabled="!isFormActive"
                  ></v-text-field>
                  <div
                    class="tag-container"
                    style="max-height: 80px; overflow-y: auto;"
                  >
                    <v-chip
                      v-for="(tag, index) in locationData.Produse_Servicii"
                      :key="tag + index"
                      closable
                      @click:close="removeServiceTag(tag)"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="12">
                  <v-select
                    ref="categorySelect"
                    v-model="selectedCategories"
                    :items="allCategories"
                    item-title="Denumire"
                    item-value="Id"
                    label="Categorii"
                    multiple
                    solo-inverted
                    hide-details
                    prepend-icon="mdi-folder"
                    class="category-select"
                    :disabled="!isFormActive"
                  >
                    <template v-slot:selection="{ item, index }">
                      <v-chip v-if="index < 5" class="mr-2">
                        <span>{{ item.title }}</span>
                      </v-chip>
                      <span v-if="index === 5" class="grey--text text-caption">
                        (+{{ selectedCategories.length - 5 }} others)
                      </span>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" class="d-flex flex-column mt-4">
                  <v-btn color="grey" @click="previousStep">Înapoi</v-btn>
                  <v-btn
                    :disabled="!isValidStep2 || !isFormActive"
                    color="primary"
                    @click="nextStep"
                    >Următorul</v-btn
                  >
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-stepper-window-item>

        <!-- Imagini -->
        <v-stepper-window-item step="3">
          <v-card flat>
            <v-form>
              <v-row>
                <v-col cols="12" sm="12">
                  <div class="d-flex justify-center my-3">
                    <v-btn color="blue" @click="openImageSelector"
                      >Adaugă Imagini</v-btn
                    >
                  </div>
                  <v-carousel
                    cycle
                    height="200px"
                    :key="allImages.length"
                    v-model="currentCarouselIndex"
                    hide-delimiters
                  >
                    <v-carousel-item
                      v-for="(preview, index) in allImages"
                      :key="preview.url + index"
                    >
                      <div class="image-container">
                        <img
                          v-if="preview.url"
                          :src="preview.url"
                          class="responsive-image"
                        />
                        <v-btn
                          v-if="preview.url"
                          icon
                          class="delete-btn"
                          @click="removeImage(index)"
                        >
                          <v-icon>mdi-close-circle</v-icon>
                        </v-btn>
                      </div>
                    </v-carousel-item>
                  </v-carousel>
                </v-col>
                <v-col cols="12" class="d-flex flex-column mt-4">
                  <v-btn color="grey" @click="previousStep">Înapoi</v-btn>
                  <v-btn color="green" @click="submitEdit">Salvează</v-btn>
                  <v-btn color="red" @click="$emit('close-dialog')">Anulează</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </v-container>
</template>

<script>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useCategoriesStore, useLocationsStore, useBadWordsStore } from '@/store';
import { updateLocation } from '@/services/locationService.js';
import { geocodeAddress } from '@/services/generalService';
import { toast } from 'vue3-toastify';
import Filter from 'bad-words';
import { checkForProfanity } from '@/services/profanityFilter';

const customFilter = new Filter();

export default {
  props: {
    location: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const step = ref(0);
    const currentCarouselIndex = ref(2);
    const isFormActive = ref(true);
    const categoriesStore = useCategoriesStore();
    const locationsStore = useLocationsStore();
    const locationData = ref({
      Id: props.location.Id,
      Nume: props.location.Nume,
      Adresa: props.location.Adresa,
      Tip: props.location.Tip,
      Produse_Servicii: props.location.Produse_Servicii
        ? JSON.parse(props.location.Produse_Servicii)
        : [],
      Categorii: props.location.Categorii || [],
      Imagini: props.location.Imagini || [],
      Propietar: props.location.Id_Proprietar
    });

    const allCategories = ref([]);
    const selectedCategories = ref([]);
    const currentService = ref('');
    const deletedImages = ref([]);
    const newImages = ref([]);
    const highlightedComment = ref('');
    const badWordsStore = useBadWordsStore();

    // Funcție pentru a formata URL-ul imaginii
    const formatImageUrl = (imagePath) =>
      `https://${window.location.hostname}:8080/${imagePath.replace(/\\/g, '/')}`;

    // Unificăm array-ul de imagini
    const allImages = ref(
      locationData.value.Imagini.map((img) => {
        const url = formatImageUrl(img);
        return {
          url: url,
          isNew: false,
        };
      })
    );

        const nameRules = [
        v => !!v || 'Denumirea locației este necesară',
        v => {
            const filter = new Filter();
            const { found, word } = checkForProfanity(v, badWordsStore.badWords, badWordsStore.leetMap);
            if (found || filter.isProfane(v)) {
            const profanityWord = found ? word : v.split(' ').find(w => filter.isProfane(w));
            return `Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${profanityWord}`;
            }
            return true;
        }
        ];
    const addressRules = [v => !!v || 'Adresa este obligatorie'];

        const typeRules = [
        v => {
            const filter = new Filter();
            const { found, word } = checkForProfanity(v, badWordsStore.badWords, badWordsStore.leetMap);
            if (found || filter.isProfane(v)) {
            const profanityWord = found ? word : v.split(' ').find(w => filter.isProfane(w));
            return `Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${profanityWord}`;
            }
            return true;
        }
        ];

    onMounted(() => {
      allCategories.value = categoriesStore.categories;
      if (allCategories.value.length > 0) {
        setInitialSelectedCategories();
      } else {
        watch(
          () => categoriesStore.categories,
          (newCategories) => {
            if (newCategories.length > 0) {
              allCategories.value = newCategories;
              setInitialSelectedCategories();
            }
          }
        );
      }
         if (!badWordsStore.badWords || badWordsStore.badWords.length === 0) {
        toast.error('Failed to load bad words list from store.');
      } else {
        customFilter.addWords(...badWordsStore.badWords);
      }
    });

    const setInitialSelectedCategories = () => {
      selectedCategories.value = locationData.value.Categorii.map((id) =>
        parseInt(id, 10)
      ).filter(Boolean);
    };

const addServiceTag = () => {
  if (currentService.value) {
    const { found, word } = checkForProfanity(currentService.value, badWordsStore.badWords, badWordsStore.leetMap);
    if (found) {
      toast.error(`Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${word}`, {
        position: "top-right",
        timeout: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        hideProgressBar: false,
      });
    } else if (customFilter.isProfane(currentService.value)) {
      const badWord = currentService.value;
      toast.error(`Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${badWord}`, {
        position: "top-right",
        timeout: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        hideProgressBar: false,
      });
    } else if (!locationData.value.Produse_Servicii.includes(currentService.value)) {
      locationData.value.Produse_Servicii.push(currentService.value);
      currentService.value = '';
    } else {
      toast.error("Serviciul sau produsul este deja în listă.", {
        position: "top-right",
        timeout: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        hideProgressBar: false,
      });
    }
  }
};


    const removeServiceTag = (tag) => {
      const index = locationData.value.Produse_Servicii.indexOf(tag);
      if (index !== -1) {
        locationData.value.Produse_Servicii.splice(index, 1);
      }
    };

    function openImageSelector() {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.onchange = (e) => {
        const files = Array.from(e.target.files);

        // Verifică dacă fișierele sunt valide și adaugă-le
        newImages.value.push(...files);

        // Creează URL-uri blob pentru fiecare fișier nou pentru afișare în galerie
        const newUrls = files.map((file) => ({
          url: URL.createObjectURL(file),
          isNew: true,
        }));

        // Adaugă noile URL-uri la previzualizări
        allImages.value.push(...newUrls);

        currentCarouselIndex.value = allImages.value.length - 1;
      };
      fileInput.click();
    }

const removeImage = (index) => {
  const image = allImages.value[index];
  if (image.isNew) {
    const urlIndex = newImages.value.findIndex(
      (file) => URL.createObjectURL(file) === image.url
    );
    if (urlIndex !== -1) {
      newImages.value.splice(urlIndex, 1);
    }
  } else {
    deletedImages.value.push(image.url); // Adăugăm URL-ul imaginii în lista temporară de imagini șterse
  }
  allImages.value.splice(index, 1);

  // Adjust the carousel index if it points to an out-of-bound index after removal
  nextTick(() => {
    if (currentCarouselIndex.value >= allImages.value.length) {
      currentCarouselIndex.value = Math.max(
        allImages.value.length - 1,
        0
      );
    }
  });
};


const submitEdit = async () => {
  try {
    // Blocu principal try-catch
    try {
        // Blocu mic try-catch pentru geocodeAddress
        const locationDataGeocode = await geocodeAddress(locationData.value.Adresa);
        if (!locationDataGeocode || !locationDataGeocode.lat || !locationDataGeocode.lng) {
            throw new Error('Adresa nu este validă');
        }
    } catch (error) {
        throw new Error('Adresa nu este validă');
    }
    // Procesăm imaginile
    const imagesToKeep = [];
    const newImages = [];

    const imageUploadPromises = allImages.value.map((image) => {
      if (image.url.includes('blob')) {
        // Dacă este un blob, convertim în fișier și adăugăm la newImages
        return fetch(image.url)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File(
              [blob],
              `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`,
              { type: blob.type }
            );
            newImages.push(file);
          });
      } else {
        // Dacă este o imagine existentă, eliminăm URL-ul complet și păstrăm doar calea relativă
        const relativePath = image.url.replace(
          `https://${window.location.hostname}:8080/`,
          ''
        );
        imagesToKeep.push(relativePath);
        return Promise.resolve(); // Returnăm o promisiune rezolvată pentru consistență
      }
    });

        // Așteptăm conversia tuturor imaginilor blob
        await Promise.all(imageUploadPromises);

        // Pregătim datele locației
        locationData.value.Imagini = imagesToKeep;
        locationData.value.Categorii = selectedCategories.value;

        // Creăm un FormData pentru a include atât datele locației cât și fișierele
        const formData = new FormData();
        formData.append('locationData', JSON.stringify(locationData.value));
        newImages.forEach((file, index) => {
          formData.append('newImages', file);
        });

        const response = await updateLocation(formData);
        // Ne asigurăm că Produse_Servicii este un JSON stringificat
        locationData.value.Produse_Servicii = JSON.stringify(
          locationData.value.Produse_Servicii
        );
        locationsStore.updateLocation({
          ...locationData.value,
          Imagini: response.updatedImages, // Actualizarea cu imaginile primite de la backend
          CodQR: response.qrCodeUrl
        });
        toast.success('Locația a fost actualizată cu succes!', {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          hideProgressBar: false,
        });
        emit('close-dialog');
      } catch (error) {
        toast.error('Eroare: ' + (error.response.data.message || 'Eroare necunoscută'), {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          hideProgressBar: false,
        });
        if (error.message === 'Adresa nu este validă') {
          step.value = 0; // Redirecționează utilizatorul la pasul cu adresa
        }
      }
    };

    const isValidStep1 = computed(() => {
      return (
        nameRules.every((rule) => rule(locationData.value.Nume) === true) &&
        addressRules.every((rule) => rule(locationData.value.Adresa) === true)
      );
    });

    const isValidStep2 = computed(() => {
      return locationData.value.Produse_Servicii.length > 0 && selectedCategories.value.length > 0;
    });

    const nextStep = () => {
      nextTick(() => {
        if (step.value === 0 && isValidStep1.value) {
          step.value = 1;
        } else if (step.value === 1 && isValidStep2.value) {
          step.value = 2;
        } else if (step.value === 2 ) {
          step.value = 3;
        }
      });
    };

    const previousStep = () => {
      nextTick(() => {
        if (step.value > 0) {
          step.value--;
        }
      });
    };

    return {
      step,
      locationData,
      allCategories,
      selectedCategories,
      currentService,
      nameRules,
      addressRules,
      typeRules,
      isValidStep1,
      isValidStep2,
      isFormActive,
      addServiceTag,
      removeServiceTag,
      currentCarouselIndex,
      openImageSelector,
      removeImage,
      submitEdit,
      nextStep,
      previousStep,
      allImages,
    };
  },
};
</script>


<style scoped>
.v-container {
  max-width: 900px;
  padding: 0;
}

.v-stepper {
  max-height: 80vh;
  overflow-y: auto;
  max-width: 900px;
}

.v-card {
  padding: -20px;
  max-width: 900px;
}

.v-form{
  width: auto;
  max-height: 900px;
}

.v-text-field,
.v-select {
  margin-bottom: 10px;
}

.v-btn {
  margin-top: 10px;
  margin-bottom: 10px;
}

.d-flex.flex-column > .v-btn {
  margin-right: 0;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.v-chip {
  flex-grow: 0;
  flex-shrink: 0;
}

.image-container {
  position: relative;
  width: 100%;
  /* Take full width of the carousel item */
  height: 200px;
  /* Fixed height, or adjust as necessary */
  display: flex;
  justify-content: center;
  align-items: center;
}

.responsive-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* Ensures the image fits without distortion */
}

.delete-btn {
  position: absolute;
  bottom: 10px;
  /* Positioned at the bottom of the container */
  left: 50%;
  /* Center horizontally */
  transform: translateX(-50%);
  /* Offset by half of its own width */
  background-color: rgba(255, 255, 255, 0.7);
  /* Semi-transparent background */
  border-radius: 50%;
  /* Circular button */
}
</style>
