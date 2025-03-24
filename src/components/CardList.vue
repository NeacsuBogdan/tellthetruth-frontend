<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="4" v-for="(location, index) in locations" :key="location.Id">
                <location-card :nume="location.Nume" :adresa="location.Adresa" :images="location.Imagini"
                    :id="location.Id" :proprietarId="location.Id_Proprietar" :codQR="location.CodQR"
                    :categorii="location.Categorii" :produseServicii="location.ProduseServicii" :tip="location.Tip" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import LocationCard from './LocationCard.vue';

export default {
    components: {
        LocationCard
    },
    props: {
        locations: {
            type: Array,
            required: true
        }
    },
}
</script>
