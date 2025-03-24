<template>
    <v-container>
        <v-stepper v-model="step">
            <v-stepper-header>
                <!-- Pasul 1 cu iconiță personalizată -->
                <v-stepper-item :complete="step > 0" step="1" :editable="true">
                    <template #icon>
                        <v-icon v-if="step > 0" color="green">mdi-check-circle</v-icon>
                        <v-icon v-else color="grey">mdi-information-outline</v-icon>
                    </template>
                    Business Information
                </v-stepper-item>
                <v-divider></v-divider>

                <!-- Pasul 2 cu iconiță personalizată -->
                <v-stepper-item :complete="step > 1" step="2" :editable="isValidStep1">
                    <template #icon>
                        <v-icon v-if="step > 1" color="green">mdi-check-circle</v-icon>
                        <v-icon v-else color="grey">mdi-tag-multiple</v-icon>
                    </template>
                    Products, Services and Categories 
                </v-stepper-item>
                <v-divider></v-divider>

                <!-- Pasul 3 cu iconiță personalizată -->
                <v-stepper-item step="3" :editable="isValidStep2">
                    <template #icon>
                        <v-icon v-if="step > 2" color="green">mdi-check-circle</v-icon>
                        <v-icon v-else color="grey">mdi-camera</v-icon>
                    </template>
                    Upload Images
                </v-stepper-item>
            </v-stepper-header>

            <v-stepper-window>
                <v-stepper-window-item value="1">
                    <v-card>
                        <v-form ref="businessInfoForm">
                            <v-text-field v-model="businessInfo.name" :rules="nameRules" label="Denumire Locatie"
                                outlined required :disabled="!isFormActive"></v-text-field>
                            <v-text-field v-model="businessInfo.address" :rules="addressRules" label="Adresa" outlined required :disabled="!isFormActive">
                                <template v-slot:append>
                                    <v-tooltip location="top">
                                        <template v-slot:activator="{ props }">
                                            <v-icon v-bind="props">mdi-information-outline</v-icon>
                                        </template>
                                        <span>
                                            Adresa trebuie să fie completă: stradă, număr, oraș, țară.
                                            <br><br>
                                            Exemple:
                                            <ul style="list-style-type: none; padding-left: 0;">
                                                <li>Str. Avram Iancu 11, Constanța, România</li>
                                                <li>123 Main St, Springfield, USA</li>
                                                <li>Rua das Flores 45, Lisboa, Portugal</li>
                                            </ul>
                                        </span>
                                    </v-tooltip>
                                </template>
                            </v-text-field>
                            <v-text-field v-model="businessInfo.companyName" :rules="companyNameRules"
                                label="Denumire Companie" outlined required :disabled="!isFormActive">
                                <template v-slot:append>
                                    <v-tooltip location="top">
                                        <template v-slot:activator="{ props }">
                                            <v-icon v-bind="props">mdi-information-outline</v-icon>
                                        </template>
                                        <span>
                                            Introduceți denumirea firmei de forma:
                                            <ul style="list-style-type: none; padding-left: 0;">
                                                <li>firmameasrl</li>
                                                <li>FirmaMea Srl</li>
                                                <li>firmamea SRL</li>
                                                <li>firmamea srl</li>
                                            </ul>
                                        </span>
                                    </v-tooltip>
                                </template>
                            </v-text-field>
                            <v-text-field v-model="businessInfo.type" :rules="typeRules" label="Tip" outlined :disabled="!isFormActive">
                                <template v-slot:append>
                                    <v-icon>mdi-information-outline</v-icon>
                                    <v-tooltip activator="parent" location="top">Introduceți informațiile suplimentare
                                        despre tipul locației aici. 
                                        <br></br>
                                        Exemple: bistro, cafenea, restaurant de
                                        lux.</v-tooltip>
                                </template>
                            </v-text-field>

                            <v-text-field v-model="businessInfo.cif" :rules="cifRules" label="CIF" outlined required
                                :disabled="!isFormActive"></v-text-field>
                            <v-btn :disabled="!isValidStep1 || !isFormActive" color="primary"
                                @click="nextStep">Next</v-btn>
                        </v-form>
                    </v-card>
                </v-stepper-window-item>

                <v-stepper-window-item value="2">
                    <v-card>
                        <v-form ref="tagsImagesForm">
                                <v-select
                                ref="categorySelect"
                                v-model="selectedCategoryIds"
                                :items="categories"
                                item-title="Denumire"
                                item-value="Id"
                                label="Select Categories"
                                multiple
                                solo-inverted
                                hide-details
                                prepend-icon="mdi-tag-multiple"
                                :disabled="!isFormActive"
                                class="category-select"
                                >
                                <template v-slot:selection="{ item, index }">
                                    <v-chip v-if="index < 5" class="mr-2">
                                    <span>{{ item.title }}</span>
                                    </v-chip>
                                    <span v-if="index === 5" class="grey--text text-caption">
                                    (+{{ selectedCategoryIds.length - 5 }} others)
                                    </span>
                                </template>
                                </v-select>
                            <v-text-field v-model="currentService" label="Add Service/Product" append-icon="mdi-plus"
                                @click:append="addServiceTag" @keydown.enter.prevent="addServiceTag" outlined dense
                                :disabled="!isFormActive"></v-text-field>
                            <div class="tag-container" style="max-height: 80px; overflow-y: auto;">
                                <v-chip v-for="tag in serviceTags" :key="tag" closable
                                    @click:close="removeServiceTag(tag)">
                                    {{ tag }}
                                </v-chip>
                            </div>
                            <v-btn color="primary" @click="previousStep">Back</v-btn>
                            <v-btn :disabled="!isValidStep2 || !isFormActive" color="primary"
                                @click="nextStep">Next</v-btn>
                        </v-form>
                    </v-card>
                </v-stepper-window-item>

                <v-stepper-window-item value="3">
                    <v-card>
                        <v-form >
                            <div class="d-flex justify-center my-3">
                                <v-btn color="blue" @click="openImageSelector">Add Images</v-btn>
                            </div>
                            <v-carousel cycle height="200px" :key="imagePreviews.length" v-model="currentCarouselIndex"
                                hide-delimiters>
                                <v-carousel-item v-for="(preview, index) in imagePreviews" :key="index">
                                    <div class="image-container">
                                        <img :src="preview" class="responsive-image" />
                                        <v-btn icon class="delete-btn" :disabled="!isFormActive"
                                            @click="removeImage(index)">
                                            <v-icon>mdi-close-circle</v-icon>
                                        </v-btn>
                                    </div>
                                </v-carousel-item>
                            </v-carousel>
                                <v-btn color="primary" :disabled="!isFormActive" @click="previousStep">Back</v-btn>
                                <v-btn color="green" :disabled="!isFormActive" @click="submitAll">Submit</v-btn>
                        </v-form>
                    </v-card>
                </v-stepper-window-item>
                <!-- Positioned close button within the stepper but outside individual steps -->
                <div class="d-flex justify-right">
                    <v-btn color="red" :disabled="!isFormActive" @click="closeForm">Close</v-btn>
                </div>
            </v-stepper-window>
        </v-stepper>
    </v-container>
</template>

<script>
import { ref, reactive,onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { checkLocation, submitLocation, generateQRCode } from '../services/locationService'; // Adjust the path as necessary
import { geocodeAddress } from '../services/generalService'; // Ajustează calea după nevoie
import { toast } from 'vue3-toastify';
import { useCategoriesStore, useLocationsStore, useBadWordsStore } from '@/store'; // Asigură-te că calea este corectă
import Filter from 'bad-words';
import { checkForProfanity } from '@/services/profanityFilter';

export default {
    setup(_, { emit }) {
        const router = useRouter();
        const customFilter = new Filter();
        const step = ref(0);
        const showOverlay = ref(false); // State for overlay visibility
        const currentCarouselIndex = ref(0);
        const isFormActive = ref(true); // Inițializează variabila reactive isFormActive cu true
        const addressError = ref(''); // State for address error message
        const businessInfo = reactive({
            name: '',
            address: '',
            type: '',
            cif: '',
            companyName: ''
        });
        const images = ref([]);
        const imagePreviews = ref([]); // Initialize imagePreviews as a reactive reference
        const serviceTags = ref([]);
        const currentService = ref('');
        const locationsStore = useLocationsStore();
        const categoriesStore = useCategoriesStore();
        const badWordsStore = useBadWordsStore();
        const categories = categoriesStore.categories;
        const selectedCategoryIds = ref([]);
         const highlightedComment = ref('');

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
        const addressRules = [
            v => !!v || 'Addresa este necesara',
            () => addressError.value || true // Custom rule to show address error message
        ];
        const cifRules = [
        v => !!v || 'CIF este necesar', 
        v => /^\d+$/.test(v) || 'CIF trebuie să conțină doar cifre'
        ];
        const companyNameRules = [v => !!v || 'Denumirea firmei este necesara'];
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

        const isValidStep1 = computed(() => {
            return nameRules.every(rule => rule(businessInfo.name) === true) &&
                addressRules.every(rule => rule(businessInfo.address) === true) &&
                cifRules.every(rule => rule(businessInfo.cif) === true) &&
                companyNameRules.every(rule => rule(businessInfo.companyName) === true);
        });

        const isValidStep2 = computed(() => {
            return serviceTags.value.length > 0 && selectedCategoryIds.value.length > 0;
        });

        function addServiceTag() {
        if (currentService.value) {
            const filter = new Filter();
            const { found, word } = checkForProfanity(currentService.value, badWordsStore.badWords, badWordsStore.leetMap);
            if (found || filter.isProfane(currentService.value)) {
            const profanityWord = found ? word : currentService.value.split(' ').find(w => filter.isProfane(w));
            toast.error(`Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${profanityWord}`, {
                position: "top-right",
                timeout: 5000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                hideProgressBar: false,
            });
            } else if (!serviceTags.value.includes(currentService.value)) {
            serviceTags.value.push(currentService.value);
            currentService.value = '';
            } else {
            toast.error("Produsul sau serviciul a fost deja introdus.");
            }
        }
        }



        function removeServiceTag(tag) {
            const index = serviceTags.value.indexOf(tag);
            if (index !== -1) {
                serviceTags.value.splice(index, 1);
            }
        }
        async function submitAll() {
            isFormActive.value = false; // Setează isFormActive la false înainte de începerea verificării companiei

            if (isValidStep1.value && isValidStep2.value) {
                toast.info("Verificarea adresei...");

                try {
                    const locationData = await geocodeAddress(businessInfo.address);
                    if (!locationData || !locationData.lat || !locationData.lng) {
                        toast.error("A apărut o eroare la geocodificarea adresei. Te rugăm să verifici adresa din nou.");
                        nextTick(() => {
                            step.value = 0; // Trimite utilizatorul înapoi la pasul 0
                            isFormActive.value = true;
                        });
                        return;
                    }
                    addressError.value = ''; // Clear address error if successful

                } catch (error) {
                    toast.error("A apărut o eroare la geocodificarea adresei. Te rugăm să verifici adresa din nou.");
                    nextTick(() => {
                        step.value = 0;
                        isFormActive.value = true;
                    });
                    return;
                }

                toast.info("Începe verificarea companiei...");

                try {
                    const locationCheck = await checkLocation(businessInfo.cif, new Date().toISOString().split('T')[0]);
                    if (!locationCheck || !locationCheck.found || locationCheck.found.length === 0) {
                        toast.error("Nu s-au găsit date pentru verificare. Te rugăm să încerci din nou sau să verifici datele introduse.");
                        isFormActive.value = true;
                        return;
                    }

                    const companyNameFromAPI = locationCheck.found[0].date_generale.denumire.replace(/[\s.]+/g, '').toLowerCase();
                    const companyNameFromForm = businessInfo.companyName.replace(/[\s.]+/g, '').toLowerCase();


                    if (companyNameFromAPI !== companyNameFromForm) {
                        toast.error("Numele companiei nu corespunde detaliilor înregistrate. Te rugăm să verifici și să încerci din nou.");
                        nextTick(() => {
                            step.value = 0; // Trimite utilizatorul înapoi la pasul 0
                            isFormActive.value = true;
                        });
                        return;
                    }
                } catch (error) {
                    toast.error("A apărut o eroare la verificarea companiei. Te rugăm să încerci din nou.");
                    nextTick(() => {
                        step.value = 0;
                        isFormActive.value = true;
                    });
                    return;
                }

                try {
                    toast.success("Verificarea companiei finalizată cu succes!");

                    toast.info("Generare cod QR...");
                    const qrCodeResult = await generateQRCode(businessInfo.name, businessInfo.address);
                    const qrCodeUrl = qrCodeResult.qrCodeUrl;
                    toast.success("Cod QR generat cu succes!");

                    const formData = {
                        Nume: businessInfo.name,
                        Adresa: businessInfo.address,
                        Tip: businessInfo.type,
                        CUI: businessInfo.cif,
                        Produse_Servicii: JSON.stringify(serviceTags.value),
                        CodQR: qrCodeUrl,
                        selectedCategories: selectedCategoryIds.value,
                        Denumire_Companie: businessInfo.companyName,
                    };

                    toast.info("Adăugare locație în baza de date...");

                    const submissionResult = await submitLocation(formData, images.value);

                    if (submissionResult && submissionResult.message.includes("succes")) {
                        toast.success("Locație adăugată cu succes în baza de date!");
                        const locationData = submissionResult.location;
                        locationsStore.addLocation(locationData); // Adaugă locația în store-ul local
                        closeForm();
                    } else {
                        toast.error("Eroare la adăugarea locației în baza de date. Te rugăm să încerci din nou mai târziu.");
                    }
                } catch (error) {
                    toast.error(error.response.data.message);
                    nextTick(() => {
                        step.value = 0;
                        isFormActive.value = true;
                    });
                    return;
                }

                isFormActive.value = true; // Activează din nou formularul
            } else {
                toast.error("Validarea formularului a eșuat. Te rugăm să verifici intrările și să încerci din nou.");
                isFormActive.value = true; // Activează din nou formularul în caz de eroare de validare
            }
        }

        function nextStep() {
            nextTick(() => {
                if (step.value === 0 && isValidStep1.value) {
                    step.value = 1;
                } else if (step.value === 1 && isValidStep2.value) {
                    step.value = 2;
                }
            });
        }

        function previousStep() {
            nextTick(() => {
                if (step.value > 0) {
                    step.value--;
                }
            });
        }

        function openImageSelector() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.onchange = e => {
                const files = Array.from(e.target.files);

                // Append new files to the existing array
                images.value.push(...files);

                // Create blob URLs for each new file for gallery display
                const newUrls = files.map(file => URL.createObjectURL(file));

                // Append new URLs to the existing preview URLs
                imagePreviews.value.push(...newUrls);

                // Update carousel index to the last new image
                currentCarouselIndex.value = imagePreviews.value.length - 1;
            };
            fileInput.click();
        }

        function removeImage(index) {
            images.value.splice(index, 1); // Remove the file object
            imagePreviews.value.splice(index, 1); // Remove the preview URL

            // Update the carousel index appropriately
            if (currentCarouselIndex.value >= images.value.length) {
                currentCarouselIndex.value = images.value.length - 1;
            }
        }

        function closeForm() {
            emit('close-dialog');
        }
            onMounted(() => {
         if (!badWordsStore.badWords || badWordsStore.badWords.length === 0) {
        toast.error('Failed to load bad words list from store.');
      } else {
        customFilter.addWords(...badWordsStore.badWords);
      }
    });


        return {
            step,
            businessInfo,
            images,
            imagePreviews,
            serviceTags,
            currentService,
            categories,
            selectedCategoryIds,
            isValidStep1,
            isValidStep2,
            nameRules,
            addressRules,
            cifRules,
            companyNameRules,
            typeRules,
            addServiceTag,
            removeServiceTag,
            submitAll,
            nextStep,
            previousStep,
            openImageSelector,
            removeImage,
            currentCarouselIndex,
            closeForm,
            isFormActive,
            showOverlay,
        };
    }
}
</script>

<style scoped>
.v-container {
  max-width: 900px;
  padding: 0;
}

.v-stepper {
  overflow-y: auto;
  max-width: 900px;
}

.v-card {
  padding: 0;
  max-width: 900px;
  margin-bottom: 0;
}

.v-text-field,
.v-select,
.v-textarea,
.v-file-input {
  margin-bottom: 10px;
  /* Spațiu între câmpuri pentru a nu fi prea înghesuite */
}

.v-btn {
  margin-top: 10px;
  /* Spațiu deasupra butoanelor pentru a separa de câmpurile de input */
  margin-right: 10px;
  /* Spațiu între butoane când sunt multiple pe aceeași linie */
  margin-bottom: 10px;
}

.d-flex.justify-right {
  position: fixed;
  right: 10px;
  bottom: 10px;
  /* Fixează poziția în colțul din dreapta jos al ecranului */
}

.v-window {
  transition: none;
  /* Dezactivează animațiile de tranziție între ferestre pentru o schimbare instantanee */
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

.v-img {
  display: none;
  /* Hide if not used, or adjust as per your existing usage */
}

.v-carousel-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Butonul de submit să fie mai vizibil */
.v-btn[type="submit"] {
  color: white;
  background-color: #4CAF50;
  /* Verde, culoare standard pentru succes în Material Design */
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  /* Space between tags */
}

.v-chip {
  flex-grow: 0;
  flex-shrink: 0;
}

.category-select .v-select__selections {
  max-height: calc(3 * 48px);
  /* Aproximativ 3 rânduri, fiecare rând fiind 48px */
  overflow-y: auto;
  /* Permite derularea pe axa Y */
}

.v-text-field.v-text-field--solo .v-input__control {
  max-height: 100px;
}

</style>
