<template>
  <v-app>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12 card-centered" color="teal" dark>
          <v-card-title class="headline text-center">Bun venit la TellTheTruth!</v-card-title>
          <v-card-text class="text-center">
            Caută locuri uimitoare sau împărtășește-ți propriile experiențe. TellTheTruth îți oferă recenzii autentice, verificate prin coduri QR și locații. Vrei să știi care este cel mai bun loc pentru a petrece timpul liber? Sau poate ești un proprietar care dorește feedback real? Alătură-te comunității noastre și descoperă adevărul. Află și împărtășește adevărata poveste a fiecărei locații!
          </v-card-text>
          <LottieAnimation animationTag="main" />
          <v-card-actions class="justify-center">
            <v-btn color="pink" dark @click="goToLocations">
              Explorează locații
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  </v-app>
</template>

<script>
import LottieAnimation from '@/components/LottieAnimation.vue';

export default {
  name: 'Home',
  components: {
    LottieAnimation
  },
  methods: {
    goToLocations() {
      this.$router.push('/locations');
    }
  }
};
</script>

<style scoped>
.v-container{
  margin-top: 64px;
}
.headline {
  text-align: center;
}
.text-center {
  text-align: center;
}
.card-centered {
  max-width: 100%;
  max-height: 90vh; /* Set max height to viewport height */
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px; /* Add padding for the gap */
}

@media (max-width: 600px) {
  .v-container{
  margin-top: 80px;
}
.v-container{
  overflow: auto;
}
}
</style>
