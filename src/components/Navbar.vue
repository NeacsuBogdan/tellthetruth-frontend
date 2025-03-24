<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click.stop="toggleDrawer"></v-app-bar-nav-icon>
    <v-toolbar-title class="app-bar-title">
      <div class="title-container">
        <div class="title-text">TellTheTruth</div>
        <div class="subtitle-text">
          <v-icon class="mr-2">mdi-account-circle</v-icon>
          Bun venit, <strong>{{ userName }}</strong>
        </div>
      </div>
    </v-toolbar-title>
    <v-btn v-if="authStore.isLoggedIn && authStore.userRole === 'admin'" icon @click="toggleReportsDrawer">
      <v-badge :content="totalReports" color="red" overlap>
        <v-icon>mdi-inbox</v-icon>
      </v-badge>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" app class="drawer">
    <v-list dense>
      <v-list-item v-if="!authStore.isLoggedIn" @click="navigateTo('/login')">
        <v-icon>mdi-login</v-icon>
        Login
      </v-list-item>
      <v-list-item v-if="authStore.isLoggedIn" @click="logout">
        <v-icon>mdi-logout</v-icon>
        Logout
      </v-list-item>
      <v-list-item @click="navigateTo('/')">
        <v-icon>mdi-home</v-icon>
        Acasă
      </v-list-item>
      <v-list-item v-if="authStore.isLoggedIn && userOwnedLocationsCount > 0" @click="navigateTo('/owned-locations')">
        <v-icon>mdi-office-building</v-icon>
        Locații Deținute
      </v-list-item>
      <v-list-item @click="navigateTo('/locations')">
        <v-icon>mdi-map-marker</v-icon>
        Locații
      </v-list-item>
      <v-list-item @click="navigateTo('/map')">
        <v-icon>mdi-map</v-icon>
        Hartă
      </v-list-item>
      <v-list-item v-if="authStore.isLoggedIn" @click="navigateTo('/recommendations')">
        <v-icon>mdi-lightbulb</v-icon>
        Recomandări
      </v-list-item>
      <v-list-item v-if="authStore.isLoggedIn" @click="navigateTo('/favorites')">
        <v-icon>mdi-star</v-icon>
        Favorite
      </v-list-item>
      <v-list-item v-if="authStore.isLoggedIn" @click="openQrReader">
        <v-icon>mdi-qrcode-scan</v-icon>
        Postează Recenzie
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-navigation-drawer v-model="reportsDrawer" app right class="drawer reports-drawer" v-if="authStore.userRole == 'admin'">
    <v-list dense>
      <v-list-item>
        <LottieAnimation animationTag="reportVerify" :loop="true" :scale="2" />
      </v-list-item>
      <template v-for="report in allReports" :key="`${report.id}-${report.isReview ? report.reviewId : report.locationId}-${report.date}`">
        <v-card class="mb-3" :color="report.isReview ? 'red lighten-4' : 'orange lighten-4'" @click="handleCardClick(report)">
          <v-card-title class="headline black-title">{{ report.userName }}</v-card-title>
          <v-card-subtitle class="d-flex align-center">
            <v-icon small class="mr-1">mdi-map-marker</v-icon>
            {{ report.locationName }}
          </v-card-subtitle>
          <v-card-subtitle class="d-flex align-center">
            <v-icon small class="mr-1">mdi-calendar</v-icon>
            {{ report.date }}
          </v-card-subtitle>
          <v-card-subtitle class="d-flex align-center">
            <v-icon small class="mr-1">mdi-alert</v-icon>
            {{ report.reason }}
          </v-card-subtitle>
          <v-card-subtitle v-if="report.isReview" class="d-flex align-center">
            <v-icon small class="mr-1">mdi-comment</v-icon>
            Review
          </v-card-subtitle>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon @click.stop="openConfirmDialog(report)">
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-list>
  </v-navigation-drawer>

  <v-dialog v-model="confirmDialog" max-width="500px">
    <v-card>
      <v-card-title class="headline">Confirmare Finalizare Raport</v-card-title>
      <v-card-text>
        <p>Ești sigur că vrei să finalizezi acest raport?</p>
        <v-card class="mb-3" :color="selectedReport?.isReview ? 'red lighten-4' : 'orange lighten-4'">
          <v-card-title class="headline black-title">{{ selectedReport?.userName }}</v-card-title>
          <v-card-subtitle class="d-flex align-center">
            <v-icon small class="mr-1">mdi-map-marker</v-icon>
            {{ selectedReport?.locationName }}
          </v-card-subtitle>
          <v-card-subtitle class="d-flex align-center">
            <v-icon small class="mr-1">mdi-calendar</v-icon>
            {{ selectedReport?.date }}
          </v-card-subtitle>
          <v-card-subtitle class="d-flex align-center">
            <v-icon small class="mr-1">mdi-alert</v-icon>
            {{ selectedReport?.reason }}
          </v-card-subtitle>
          <v-card-subtitle v-if="selectedReport?.isReview" class="d-flex align-center">
            <v-icon small class="mr-1">mdi-comment</v-icon>
            Review
          </v-card-subtitle>
        </v-card>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="confirmFinalization">Confirmă</v-btn>
        <v-btn color="red darken-1" text @click="confirmDialog = false">Anulează</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <qr-reader ref="qrReaderRef" />
</template>

<script>
import { ref, computed, nextTick } from 'vue';
import { useAuthStore, useLocationsStore, useReportsStore, useReviewsStore } from '@/store';
import { deleteLocationReport, deleteReviewReport } from '@/services/generalService';
import QrReader from '@/components/QrReader';
import LottieAnimation from '@/components/LottieAnimation.vue'; // Asigură-te că calea este corectă
import { useRouter } from 'vue-router';

export default {
  name: 'Navbar',
  components: {
    QrReader,
    LottieAnimation
  },
  setup() {
    const authStore = useAuthStore();
    const locationsStore = useLocationsStore();
    const reportsStore = useReportsStore();
    const reviewsStore = useReviewsStore();
    const router = useRouter();
    const drawer = ref(false);
    const reportsDrawer = ref(false);
    const confirmDialog = ref(false);
    const selectedReport = ref(null);
    const qrReaderRef = ref(null);
    const userName = computed(() => authStore.userName || "Utilizatorule");


    const toggleDrawer = () => {
      drawer.value = !drawer.value;
    };

    const toggleReportsDrawer = () => {
      reportsDrawer.value = !reportsDrawer.value;
    };

    const navigateTo = (path) => {
      router.push(path);
      drawer.value = false;
    };

    const openConfirmDialog = (report) => {
      selectedReport.value = report;
      confirmDialog.value = true;
    };

const confirmFinalization = async () => {
  const report = selectedReport.value;
  const payload = {
    userId: report.id,
  };

  try {
    if (report.isReview) {
      payload.reviewId = report.reviewId;
      await deleteReviewReport(payload.userId, payload.reviewId);
      reportsStore.removeReviewReport(payload.userId, payload.reviewId);
      reviewsStore.unmarkReviewAsReported(report.reviewId, report.id);
    } else {
      payload.locationId = report.locationId;
      await deleteLocationReport(payload.userId, payload.locationId);
      reportsStore.removeLocationReport(payload.userId, payload.locationId);
      locationsStore.unmarkLocationAsReported(payload.locationId, payload.userId); // Actualizează starea locației
    }
    confirmDialog.value = false;
    selectedReport.value = null;
    reportsDrawer.value = false;
    nextTick(() => {
      reportsDrawer.value = true;
    });
  } catch (error) {
    console.error("Error finalizing report:", error);
  }
};


    const handleCardClick = (report) => {
      const query = report.isReview ? { R: report.reviewId } : {};
      const path = `/location-details/${report.locationId}`;
      router.push({ path, query });
    };

    authStore.checkAuth();

    const logout = () => {
      authStore.logOut();
      navigateTo('/login');
    };

    const openQrReader = () => {
      if (qrReaderRef.value) {
        qrReaderRef.value.startScan();
        drawer.value = false;
      } else {
        console.error("QR Reader component not loaded");
      }
    };

    const userOwnedLocationsCount = computed(() => {
      return locationsStore.userOwnedLocationsCount(authStore.userId);
    });

    const totalReports = computed(() => {
      return reportsStore.totalReports;
    });

    const allReports = computed(() => {
      return reportsStore.getAllReports;
    });

    return {
      authStore,
      userName,
      drawer,
      reportsDrawer,
      confirmDialog,
      selectedReport,
      toggleDrawer,
      toggleReportsDrawer,
      navigateTo,
      openConfirmDialog,
      confirmFinalization,
      qrReaderRef,
      logout,
      openQrReader,
      userOwnedLocationsCount,
      totalReports,
      allReports,
      handleCardClick
    };
  }
};
</script>

<style scoped>
.drawer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 300px;
  z-index: 100;
}

.reports-drawer {
  position: absolute;
  top: 0;
  right: 0;
  height: 100vh;
  width: 400px; /* Mărim lățimea drawer-ului pentru rapoarte */
  z-index: 100;
  overflow-y: auto; /* Asigură că elementele depășite sunt vizibile */
}

.v-card {
  margin-bottom: 16px;
  background-color: #f5f5f5; /* Fundal pentru card */
}

.v-card-title {
  font-weight: bold;
  color: #fff; /* Text alb pentru contrast */
  text-align: center;
  background-color: #000; /* Fundal negru pentru titlu */
}

.v-card-subtitle {
  display: flex;
  align-items: center;
  margin: 4px 0;
  padding: 4px 8px;
  color: #000; /* Text negru pentru contrast */
}

.v-card-subtitle v-icon {
  margin-right: 8px;
}

.title-container {
  display: flex;
  flex-direction: column;
  text-align: left; /* Aliniere text */
}

.title-text,
.subtitle-text {
  font-size: 18px; /* Ajustează dimensiunea fontului */
}

.title-text {
  font-weight: bold;
}

@media (max-width: 600px) {
  .v-app-bar {
    min-height: auto;
    height: auto;
    padding: 8px;
  }

  .title-text,
  .subtitle-text {
    font-size: 16px; /* Diminuăm dimensiunea fontului pentru ecrane foarte mici */
  }
  .drawer{
margin-top: 15px;
  }
}
</style>
