<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card class="elevation-5" outlined>
                    <v-row no-gutters>
                        <v-col cols="12" md="8" v-if="locatie">
                            <v-card-text>
                                <div class="d-flex justify-space-between align-center flex-wrap-on-mobile">
                                    <div class="location-details">
                                        <v-card-title class="headline blue--text">{{ locatie.Nume }}</v-card-title>
                                        <v-card-subtitle>{{ locatie.Adresa }}</v-card-subtitle>
                                    </div>
                                    <div class="location-buttons">
                                        <v-btn v-if="isLoggedIn && !isOwner && !isFavorite" @click="toggleFavoriteLocation(locatie.Id)"
                                            color="grey" icon>
                                            <v-icon>mdi-star-outline</v-icon>
                                        </v-btn>
                                        <v-btn v-if="isLoggedIn && !isOwner && isFavorite" @click="toggleFavoriteLocation(locatie.Id)"
                                            color="yellow" icon>
                                            <v-icon>mdi-star</v-icon>
                                        </v-btn>
                                        <v-btn v-if="isLoggedIn && !isOwner" @click="openReportDialog('location', locatie)"
                                            :disabled="hasReportedLocation(locatie)"
                                            :color="isLocationReported(locatie) ? 'red' : 'grey'" icon>
                                            <v-icon>{{ isLocationReported(locatie) ? 'mdi-alert-circle' : 'mdi-alert-circle-outline' }}</v-icon>
                                        </v-btn>
                                        <v-btn v-if="isOwner" @click="openEditLocationDialog(locatie)" color="blue" icon>
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn v-if="isOwner || isAdmin" @click="openDeleteLocationDialog(locatie)" color="red" icon>
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </div>
                                </div>

                                <v-divider class="my-4"></v-divider>


                                <div class="subtitle-1 mb-2">Tip locație:</div>
                                <v-card-subtitle>{{ locatie.Tip }}</v-card-subtitle> <!-- Secțiune separată pentru tipul locației -->

                                <div class="subtitle-1 mb-2 mt-4">Produse și Servicii:</div>
                                <v-responsive class="overflow-y-auto" max-height="200px">
                                    <v-chip-group column>
                                        <v-chip v-for="item in produseServicii" :key="item" color="light-blue"
                                            text-color="white" class="ma-1">
                                            {{ item }}
                                        </v-chip>
                                    </v-chip-group>
                                </v-responsive>

                                <div class="subtitle-1 mb-2 mt-4">Categorii:</div>
                                <v-responsive class="overflow-y-auto" max-height="200px">
                                    <v-chip-group column>
                                        <v-chip v-for="cat in categoriiDenumire" :key="cat" color="green"
                                            text-color="white" class="ma-1">
                                            {{ cat }}
                                        </v-chip>
                                    </v-chip-group>
                                </v-responsive>

                                <v-img v-if="showQRCode && locatie.CodQR" :src="locatie.CodQR" height="200"
                                    class="my-3 mx-auto" />
                                <v-btn v-if="showQRCode" color="primary" @click="downloadQRCode">Descarcă QR</v-btn>
                            </v-card-text>
                        </v-col>
                        <v-col cols="12" md="4" v-if="locatie">
                        <map-component ref="mapRef" :address="locatie?.Adresa" :showSearch="false" :name="locatie?.Nume" :key="locatie?.Nume + locatie?.Adresa" class="map-full-height" />
                            <v-btn class="localize-button" @click="requestRouteCalculation">Localizare</v-btn>
                        </v-col>
                    </v-row>
                </v-card>
                <v-row class="my-4" v-if="locatie && locatie.Imagini.length">
                    <v-col cols="12">
                        <v-carousel cycle height="400" hide-delimiters>
                            <v-carousel-item v-for="image in locatie.Imagini" :key="image">
                                <v-img :src="formatImageUrl(image)" aspect-ratio="1.7" @click="openImageZoom(image)"></v-img>
                            </v-carousel-item>
                        </v-carousel>
                    </v-col>
                </v-row>
                <v-row class="mt-4 reviews-section">
                    <v-col cols="12">
                        <v-card flat>
                            <v-tabs v-model="tabIndex" align-tabs="center" color="yellow">
                                <v-tab>All</v-tab>
                                <v-tab>Bad</v-tab>
                                <v-tab>Good</v-tab>
                            </v-tabs>
                            <v-list class="review-list">
<v-list-item
    v-for="review in reviews"
    :key="review.Id"
    :class="{ highlighted: review.Id === highlightedReviewId }"
    :data-review-id="review.Id"
>
                                    <div class="review-container">
                                        <div class="review-content">
                                            <div class="review-header">
                                                <div class="text-subtitle-1">{{ review.Nume_Utilizator }}</div>
                                                <div class="data">{{ review.Data }} {{ review.Ora }}</div>
                                            </div>
                                            <v-rating v-model="review.Scor" small readonly empty-icon="mdi-star-outline"
                                                full-icon="mdi-star" color="amber"></v-rating>
                                            <div class="text-caption">{{ review.Text }}</div>
                                        </div>
                                        <div class="d-flex align-center review-buttons" v-if="isLoggedIn">
                                            <v-btn @click="openReportDialog('review', review)"
                                                :disabled="hasReported(review)"
                                                :color="isReported(review) ? 'red' : 'grey'" icon v-if="review.Id_Utilizator !== authStore.userId">
                                                <v-icon>{{ isReported(review) ? 'mdi-alert-circle' : 'mdi-alert-circle-outline' }}</v-icon>
                                            </v-btn>
                                            <v-btn v-if="isAdmin" @click="openDeleteDialog(review)" color="red" icon>
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </div>
                                    </div>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-dialog v-model="dialogReport" max-width="600px">
            <report-review-form :review="selectedReview" :location="selectedLocation"
                @report-submitted="handleReportSubmitted"></report-review-form>
        </v-dialog>

        <v-dialog v-model="dialogDelete" max-width="600px">
            <v-card>
                <v-card-title class="headline">Confirmare ștergere</v-card-title>
                <v-card-text>
                    <p>Sunteți sigur că doriți să ștergeți această recenzie?</p>
                    <p><strong>Utilizator:</strong> {{ selectedReview.Nume_Utilizator }}</p>
                    <p><strong>Data și ora:</strong> {{ selectedReview.Data }} <br> {{ selectedReview.Ora }}</p>
                    <p><strong>Text:</strong> {{ selectedReview.Text }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-btn class="dialog-button confirm" @click="confirmDeleteReview">Da</v-btn>
                    <v-btn class="dialog-button cancel" @click="dialogDelete = false">Nu</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogDeleteLocation" max-width="600px">
            <v-card>
                <v-card-title class="headline">Confirmare ștergere locație</v-card-title>
                <v-card-text>
                    <p>Sunteți sigur că doriți să ștergeți această locație?</p>
                    <p><strong>Denumire:</strong> {{ selectedLocation.Nume }}</p>
                    <p><strong>Adresă:</strong> {{ selectedLocation.Adresa }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-btn class="dialog-button confirm" @click="confirmDeleteLocation">Da</v-btn>
                    <v-btn class="dialog-button cancel" @click="dialogDeleteLocation = false">Nu</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogEditLocation" max-width="600px">
            <edit-location-form :location="selectedLocation" @close-dialog="handleEditClose"></edit-location-form>
        </v-dialog>

        <v-dialog v-model="dialogImageZoom" max-width="90%" class="dialogzoomimg">
            <v-card>
                <v-card-text>
                    <v-img :src="formatImageUrl(selectedImage)" max-height="80vh"></v-img>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" @click="dialogImageZoom = false">Închide</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MapComponent from '../pages/Map.vue';
import ReportReviewForm from '../components/ReportReviewForm.vue';
import EditLocationForm from '../components/EditLocationForm.vue';
import { useLocationsStore, useAuthStore, useCategoriesStore, useReviewsStore , useReportsStore } from '@/store';
import { deleteReview as deleteReviewAPI, deleteLocation as deleteLocationAPI ,addFavoriteLocation , removeFavoriteLocation } from '@/services/generalService';
import { toast } from 'vue3-toastify';

export default {
    components: {
        MapComponent,
        ReportReviewForm,
        EditLocationForm
    },
    props: {
        id: {
            type: Number,
            required: true
        },
        highlightReview: {
            type: Number,
            default: null
        }
    },
    setup(props) {
        const locationsStore = useLocationsStore();
        const authStore = useAuthStore();
        const categoriesStore = useCategoriesStore();
        const reviewsStore = useReviewsStore();
        const reportsStore = useReportsStore();
        const router = useRouter();
        const route = useRoute(); // Adaugă această linie

        const mapRef = ref(null);
        const tabIndex = ref(0);
        const locatie = computed(() => locationsStore.locations.find(location => location.Id === Number(props.id)) || null);

        const selectedReview = ref(null);
        const selectedLocation = ref(null);
        const dialogReport = ref(false);
        const dialogDelete = ref(false);
        const dialogDeleteLocation = ref(false);
        const dialogEditLocation = ref(false);
        const dialogImageZoom = ref(false);
        const selectedImage = ref(null);
        const highlightedReviewId = ref(props.highlightReview);

        const isAdmin = computed(() => authStore.userRole === 'admin');
        const isOwner = computed(() => locatie.value && locatie.value.Id_Proprietar === authStore.userId);

        const deleteLoading = ref(false);

        const reviews = computed(() => {
            if (!locatie.value) return [];
            const filter = {
                locationId: locatie.value.Id,
            };
            if (tabIndex.value === 1) {
                filter.score = 2;
                filter.scoreCondition = 'upTo';
            } else if (tabIndex.value === 2) {
                filter.score = 3;
                filter.scoreCondition = 'above';
            }
            return reviewsStore.getFilteredReviews(filter);
        });

        const getFilteredReviews = () => {
            if (!locatie.value) return [];
            const filter = {
                locationId: locatie.value.Id,
            };
            if (tabIndex.value === 1) {
                filter.score = 2;
                filter.scoreCondition = 'upTo';
            } else if (tabIndex.value === 2) {
                filter.score = 3;
                filter.scoreCondition = 'above';
            }
            return reviewsStore.getFilteredReviews(filter);
        };

        const filteredReviews = computed(() => getFilteredReviews());

        const produseServicii = computed(() => locatie.value ? JSON.parse(locatie.value.Produse_Servicii) : []);
        const categoriiDenumire = computed(() => locatie.value && locatie.value.Categorii ? locatie.value.Categorii.map(id => categoriesStore.getCategoryNameById(id)) : []);
        const showQRCode = computed(() => authStore.userId && locatie.value && locatie.value.Id_Proprietar === authStore.userId);

        const formatImageUrl = (imagePath) => `https://${window.location.hostname}:8080/${imagePath.replace(/\\/g, '/')}`;

        const downloadQRCode = () => {
            if (locatie.value && locatie.value.CodQR) {
                const link = document.createElement('a');
                link.href = locatie.value.CodQR;
                link.download = 'QRCode.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        const requestRouteCalculation = () => {
            if (mapRef.value && locatie.value) {
                mapRef.value.calculateRoute(locatie.value.Adresa);
            }
        };

        const openReportDialog = (type, item) => {
            if (type === 'review') {
                selectedReview.value = item;
                selectedLocation.value = null;
            } else {
                selectedLocation.value = item;
                selectedReview.value = null;
            }
            dialogReport.value = true;
        };

        const openDeleteDialog = (review) => {
            selectedReview.value = review;
            dialogDelete.value = true;
        };

        const openDeleteLocationDialog = (location) => {
            selectedLocation.value = location;
            dialogDeleteLocation.value = true;
        };

        const openEditLocationDialog = (location) => {
            selectedLocation.value = location;
            dialogEditLocation.value = true;
        };

        const handleReportSubmitted = () => {
            dialogReport.value = false;
            if (selectedReview.value) {
                reviewsStore.markReviewAsReported(selectedReview.value.Id, authStore.userId);
            } else {
                locationsStore.markLocationAsReported(selectedLocation.value.Id, authStore.userId);
            }
        };

        const confirmDeleteReview = async () => {
            dialogDelete.value = false;
            if (deleteLoading.value) return;
            deleteLoading.value = true;
             const reviewId = selectedReview.value.Id;
            try {
                await deleteReviewAPI(selectedReview.value.Id);
                reviewsStore.removeReview(selectedReview.value.Id);
    selectedReview.value.ReportedBy.forEach(userId => {
        reportsStore.removeReviewReport(userId, reviewId);
        });
                toast.success('Recenzia a fost ștearsă cu succes!', {
                    position: "top-right",
                    timeout: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    hideProgressBar: false,
                });
            } catch (error) {
                toast.error('Eroare la ștergerea recenziei: ' + (error.response?.data.message || 'Eroare necunoscută'), {
                    position: "top-right",
                    timeout: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    hideProgressBar: false,
                });
            } finally {
                deleteLoading.value = false;
            }
        };

        const confirmDeleteLocation = async () => {
            dialogDeleteLocation.value = false;
            if (deleteLoading.value) return;
            deleteLoading.value = true;
            try {
                await deleteLocationAPI(selectedLocation.value.Id);
                locationsStore.removeLocation(selectedLocation.value.Id);
                toast.success('Locația a fost ștearsă cu succes!', {
                    position: "top-right",
                    timeout: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    hideProgressBar: false,
                });
                router.push('/locations');
            } catch (error) {
                toast.error('Eroare la ștergerea locației: ' + (error.response?.data.message || 'Eroare necunoscută'), {
                    position: "top-right",
                    timeout: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    hideProgressBar: false,
                });
            } finally {
                deleteLoading.value = false;
            }
        };

        const deleteLocation = async (locationId) => {
            if (deleteLoading.value) return;
            deleteLoading.value = true;
            try {
                await deleteLocationAPI(locationId);
                locationsStore.removeLocation(locationId);
                toast.success('Locația a fost ștearsă cu succes!', {
                    position: "top-right",
                    timeout: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    hideProgressBar: false,
                });
                router.push('/locations');
            } catch (error) {
                toast.error('Eroare la ștergerea locației: ' + (error.response?.data.message || 'Eroare necunoscută'), {
                    position: "top-right",
                    timeout: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    hideProgressBar: false,
                });
            } finally {
                deleteLoading.value = false;
            }
        };

        const isFavorite = computed(() => {
            return authStore.favoriteLocations.includes(Number(props.id));
        });

        const isReported = (review) => {
            return review.ReportedBy && review.ReportedBy.includes(authStore.userId);
        };

        const hasReported = (review) => {
            return review.ReportedBy && review.ReportedBy.includes(authStore.userId);
        };

        const isLocationReported = (location) => {
            return location.ReportedBy && location.ReportedBy.includes(authStore.userId);
        };

        const hasReportedLocation = (location) => {
            return location.ReportedBy && location.ReportedBy.includes(authStore.userId);
        };

        const isLoggedIn = computed(() => !!authStore.userId); // Verifică dacă utilizatorul este logat

        const toggleFavoriteLocation = async (locationId) => {
            try {
                if (isFavorite.value) {
                    await removeFavoriteLocation(locationId);
                    authStore.removeFavoriteLocation(locationId);
                    toast.success('Locația a fost eliminată din favorite!');
                } else {
                    await addFavoriteLocation(locationId);
                    authStore.addFavoriteLocation(locationId);
                    toast.success('Locația a fost adăugată la favorite!');
                }
            } catch (error) {
                toast.error('Eroare la actualizarea stării de favorite: ' + (error.response?.data.message || 'Eroare necunoscută'));
            }
        };

        const openImageZoom = (image) => {
            selectedImage.value = image;
            dialogImageZoom.value = true;
        };

        const handleEditClose = (updatedLocation) => {
            if (updatedLocation) {
                locationsStore.updateLocation(updatedLocation);
                const locationIndex = locationsStore.locations.findIndex(loc => loc.Id === updatedLocation.Id);
                if (locationIndex !== -1) {
                    locationsStore.locations[locationIndex] = updatedLocation;
                }
                toast.success('Locația a fost actualizată cu succes!');
            }
            dialogEditLocation.value = false;
        };

const scrollToHighlightedReview = () => {
  nextTick(() => {
    if (highlightedReviewId.value) {
      const highlightedReviewElement = document.querySelector(`[data-review-id="${highlightedReviewId.value}"]`);
      if (highlightedReviewElement) {
        highlightedReviewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightedReviewElement.classList.add('highlighted');
        setTimeout(() => {
          highlightedReviewElement.classList.remove('highlighted');
        }, 3000);
      }
    } else {
      highlightedReviewId.value = null;
      const mainContent = document.querySelector('.v-main');
      if (mainContent) {
        mainContent.scrollTop = 0; // Set scroll position to 0 for main content
      }
    }
  });
};




onMounted(() => {
    if (route.query.R) {
        highlightedReviewId.value = Number(route.query.R);
        scrollToHighlightedReview();
    }else{
        scrollToHighlightedReview();
    }
});




        watch(() => route.query.R, (newVal) => {
        if (newVal !== NaN) {
            highlightedReviewId.value = Number(newVal);
            scrollToHighlightedReview();
        }
        });


        return {
            locatie,
            filteredReviews,
            produseServicii,
            categoriiDenumire,
            showQRCode,
            downloadQRCode,
            formatImageUrl,
            tabIndex,
            requestRouteCalculation,
            mapRef,
            openReportDialog,
            openDeleteDialog,
            openDeleteLocationDialog,
            openEditLocationDialog,
            selectedReview,
            dialogReport,
            dialogDelete,
            dialogDeleteLocation,
            dialogEditLocation,
            selectedLocation,
            isReported,
            hasReported,
            isLocationReported,
            hasReportedLocation,
            handleReportSubmitted,
            isAdmin,
            isOwner,
            confirmDeleteReview,
            confirmDeleteLocation,
            deleteLocation,
            deleteLoading,
            dialogImageZoom,
            selectedImage,
            openImageZoom,
            handleEditClose,
            isLoggedIn,
            toggleFavoriteLocation,
            isFavorite,
            highlightedReviewId,
            reviews,
            authStore
        };
    }
};
</script>

<style scoped>
.v-container{
    margin-top: 64px;
}
.map-full-height {
    height: 100%;
    position: relative;
}

.my-4 {
    margin-top: 16px;
    margin-bottom: 16px;
}

.reviews-section {
    margin-top: 20px;
}

.review-section {
    background-color: transparent;
    overflow-y: auto;
}

.review-list {
    background-color: transparent;
    max-height: 400px;
}

.review-container {
    display: flex;
    flex-direction: column;
    padding: 15px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: box-shadow 0.3s ease;
}

.review-container:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.review-content {
    flex: 1;
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    color: #757575;
}

.text-subtitle-1 {
    font-size: 1.2rem;
    color: #424242;
}

.data {
    font-size: 0.9rem;
    color: #757575;
}

.text-caption {
    font-size: 1rem !important;
    color: #424242;
    max-width: 1200px;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.v-rating {
    margin-bottom: 10px;
}

.review-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
}

.v-tab {
    background-color: black;
    color: red;
}

.localize-button {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background-color: black;
    color: white;
}

.flex-wrap-on-mobile {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.location-details {
    flex: 1;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.headline {
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.location-buttons {
    display: flex;
    gap: 10px;
}

.v-card-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.v-card-subtitle {
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.dialogzoomimg {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.v-btn.dialog-button {
    min-width: 120px;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: bold;
    text-transform: uppercase;
    transition: background-color 0.3s;
}

.v-btn.dialog-button.confirm {
    background-color: #4caf50;
    color: white;
}

.v-btn.dialog-button.confirm:hover {
    background-color: #45a049;
}

.v-btn.dialog-button.cancel {
    background-color: #f44336;
    color: white;
}

.v-btn.dialog-button.cancel:hover {
    background-color: #e53935;
}

@media (max-width: 600px) {
    .v-container{
        margin-top: 80px;
    }
    .review-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .data {
        margin-top: 5px;
    }

    .review-buttons {
        justify-content: center;
    }

    .flex-wrap-on-mobile {
        flex-direction: column;
    }

    .location-details {
        margin-bottom: 10px;
    }
}

.highlighted {
    background-color: red; /* Highlight color */
}
</style>