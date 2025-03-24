<template>
  <v-container class="report-form-container">
    <v-form @submit.prevent="submitReport">
      <v-row>
        <!-- Review Info Column -->
        <v-col cols="12" md="6" class="review-info-section">
          <div class="review-info">
            <v-card-subtitle class="raport-title">
              {{ isReview ? review?.Nume_Utilizator : location?.Nume || 'Necunoscut' }}
            </v-card-subtitle>
            <v-card-subtitle v-if="isReview" class="review-date-time">
              Data: {{ review?.Data }}
            </v-card-subtitle>
            <v-card-subtitle v-if="isReview" class="review-date-time">
              Ora: {{ review?.Ora }}
            </v-card-subtitle>
            <v-card-subtitle class="review-text">
              {{ isReview ? review?.Text : location?.Adresa || 'Necunoscut' }}
            </v-card-subtitle>
          </div>
        </v-col>

        <!-- Animation Column -->
        <v-col cols="12" md="6" class="animation-container">
          <LottieAnimation animationTag="report" :loop="false" :scale="1.1" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-select v-model="report.selectedReason" :items="reasons" label="Motiv" outlined></v-select>
          <v-btn color="primary" class="submit-btn" type="submit">Trimite Raport</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { reactive, computed } from 'vue';
import { toast } from 'vue3-toastify';
import { reportReview, reportLocation } from '@/services/generalService';
import { useReviewsStore, useLocationsStore, useAuthStore, useReportsStore } from '@/store';
import LottieAnimation from '@/components/LottieAnimation.vue'; // Asigură-te că calea este corectă

export default {
  components: {
    LottieAnimation
  },
  props: ['review', 'location'],
  setup(props, { emit }) {
    const reviewsStore = useReviewsStore();
    const locationsStore = useLocationsStore();
    const authStore = useAuthStore();
    const reportsStore = useReportsStore();
    const isReview = computed(() => !!props.review);
    const report = reactive({
      id: isReview.value ? props.review.Id : props.location.Id,
      selectedReason: ''
    });

    const reviewReasons = [
      'Conținut inadecvat',
      'Spam',
      'Discurs de ură',
      'Hărțuire',
      'Recenzie falsă',
      'Informații personale dezvăluite',
      'Altul'
    ];

    const locationReasons = [
      'Date incorecte',
      'Locație inexistentă',
      'Descriere inadecvată',
      'Imagini inadecvate',
      'Locație duplicată',
      'Altul'
    ];

    const reasons = computed(() => isReview.value ? reviewReasons : locationReasons);

    async function submitReport() {
      if (report.selectedReason) {
        try {
          const userId = authStore.userId;
          const userName = authStore.userName;
          const todayDate = new Date().toISOString();

          let newReport;

          if (isReview.value) {
            await reportReview(report.id, report.selectedReason);
            reviewsStore.markReviewAsReported(report.id, userId);

            newReport = {
              id: userId,
              userName: userName,
              reviewId: report.id,
              locationId: props.review.Id_Locatie,
              locationName: locationsStore.getLocationById(props.review.Id_Locatie)?.Nume || 'Necunoscut',
              date: todayDate,
              reason: report.selectedReason,
              isReview: true
            };
          } else {
            await reportLocation(report.id, report.selectedReason);
            locationsStore.markLocationAsReported(report.id, userId);

            newReport = {
              id: userId,
              userName: userName,
              locationId: report.id,
              locationName: props.location.Nume,
              date: todayDate,
              reason: report.selectedReason,
              isReview: false
            };
          }

          reportsStore.addReport(newReport);

          toast.success('Raport trimis cu succes!', {
            position: "top-right",
            timeout: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            hideProgressBar: false,
          });
          emit('report-submitted');
        } catch (error) {
          toast.error('Eroare la trimiterea raportului: ' + (error.response?.data.message || 'Eroare necunoscută'), {
            position: "top-right",
            timeout: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            hideProgressBar: false,
          });
        }
      } else {
        toast.error('Va rugam sa selectati un motiv !', {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          hideProgressBar: false,
        });
      }
    }

    return { report, reasons, submitReport, isReview, authStore };
  }
}
</script>

<style scoped>
.report-form-container {
  background-color: #fff;
  padding: 15px; /* Reduced padding */
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-height: 600px; /* Limit the maximum height */
  overflow-y: auto; /* Add scrolling for overflow */
}

.review-info-section {
  border-right: 1px solid #ddd; /* Delimit the review info section */
  padding-right: 15px;
  margin-bottom: 15px; /* Add margin for spacing */
}

.submit-btn {
  margin-top: 16px; /* Reduced margin */
  width: 100%;
  height: 40px; /* Reduced height */
  font-size: 14px; /* Reduced font size */
}

.review-info .review-user,
.review-info .review-text,
.review-info .review-date-time {
  display: block;
  margin-bottom: 8px; /* Reduced margin */
}

.raport-title {
  font-size: 45px; /* Adjust font size as needed */
  font-weight: 500;
  color: #1976D2;
  word-wrap: break-word; /* Allow text to wrap */
  white-space: normal; /* Prevent text from staying on one line */
}


.review-text {
  font-size: 18px; /* Adjust font size as needed */
  color: #424242;
  max-height: 200px; /* Increased max height */
  overflow-y: auto;
  word-wrap: break-word;
  white-space: normal;
  padding: 10px; /* Add padding for spacing */
  border: 1px solid #ddd; /* Add border for better delimitation */
  border-radius: 8px; /* Add border radius for rounded corners */
  background-color: #f9f9f9; /* Slightly different background for better delimitation */
}

.review-date-time {
  font-size: 16px;
  font-weight: 400;
  color: #757575;
  text-align: right; /* Align date and time to the right */
}

.animation-container {
  display: flex;
  justify-content: flex-end; /* Align animation to the right */
  align-items: center;
  height: 100%;
}

@media (max-width: 960px) {
  .animation-container {
    justify-content: center;
  }

  .review-info-section {
    border-right: none;
    padding-right: 0;
  }
}
</style>
