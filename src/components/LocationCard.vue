<template>
    <v-card class="elevation-12 fixed-height-card">
        <v-carousel cycle :interval="2000" hide-delimiters height="180px">
            <template v-if="images.length > 0">
                <v-carousel-item v-for="image in images" :key="image">
                    <v-img :src="imageUrl(image)" height="180" cover></v-img>
                </v-carousel-item>
            </template>
            <template v-else>
                <v-carousel-item>
                    <v-img src="../assets/noimg.png" height="180" class="fill-placeholder" cover></v-img>
                </v-carousel-item>
            </template>
        </v-carousel>
        <v-card-text class="pt-1 pb-3 px-2">
            <div class="text-h6 text-center my-1">{{ nume }}</div>
            <div class="text-caption text-center my-0">{{ adresa }}</div>
            <div class="text-caption text-center my-1">{{ tip }}</div>
            <div class="produse-servicii-container text-caption text-center my-1">
                <div v-if="produseServicii.length">
                    Produse și Servicii:
                    <template v-if="remainingProduseServiciiCount > 0">
                        {{ displayedProduseServicii.join(', ') }} (+ {{ remainingProduseServiciiCount }} more)
                    </template>
                    <template v-else>
                        {{ displayedProduseServicii.join(', ') }}
                    </template>
                </div>
            </div>
            <v-btn color="primary" @click="showDetails" block dense class="mt-2">Detalii</v-btn>
            <div class="rating-container">
                <LottieAnimation animationTag="rating" class="rating-animation" />
                <span class="text-h6 rating-score">{{ averageRating }}</span>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
import LottieAnimation from '@/components/LottieAnimation.vue'; // Adjust the import based on your file structure
import { useReviewsStore } from '@/store/reviews'; // Adjust the import based on your file structure
import { computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
    components: {
        LottieAnimation
    },
    props: {
        nume: String,
        adresa: String,
        images: Array,
        id: Number,
        proprietarId: Number,
        codQR: String,
        categorii: Array,
        produseServicii: Array,
        tip: String,
    },
    setup(props) {
        const reviewsStore = useReviewsStore();
        const router = useRouter();

        const displayedProduseServicii = computed(() => {
            const maxVisibleServices = 3; // Adjust this number based on your design requirements
            return props.produseServicii.slice(0, maxVisibleServices);
        });

        const remainingProduseServiciiCount = computed(() => {
            const maxVisibleServices = 3; // Same as above
            return props.produseServicii.length - maxVisibleServices;
        });

        const reviews = computed(() => {
            return reviewsStore.getReviewsByLocationId(props.id);
        });

        const averageRating = computed(() => {
            if (!reviews.value || reviews.value.length === 0) {
                return 5; // Default rating if no reviews
            }
            const totalScore = reviews.value.reduce((acc, review) => acc + review.Scor, 0);
            return (totalScore / reviews.value.length).toFixed(1); // Calculate average rating
        });

        const showDetails = () => {
            router.push({
                name: 'LocationDetails',
                params: { id: Number(props.id) } // Use id for navigation
            });
        };

        const imageUrl = (image) => {
            const baseUrl = apiBaseUrl();
            const correctedImage = image.replace(/\\/g, '/');
            return `${baseUrl}/${correctedImage.startsWith('/') ? correctedImage.slice(1) : correctedImage}`;
        };

        const apiBaseUrl = () => {
            if (window.location.hostname === 'localhost') {
                return 'http://localhost:8080';
            } else {
                return `https://${window.location.hostname}:8080`;
            }
        };

        return {
            displayedProduseServicii,
            remainingProduseServiciiCount,
            averageRating,
            showDetails,
            imageUrl,
        };
    }
};
</script>

<style scoped>
.fill-placeholder {
    object-fit: contain; /* Ensures the entire image is visible */
    width: 100%; /* Makes sure the image scales properly within its container */
    height: 180px; /* Ensures the image fits the height of its container */
    background-color: #f0f0f0; /* Optional: Adds a background color to fill empty space */
}

.fixed-height-card {
    min-height: 350px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.v-card-text {
    padding-top: 4px;
    padding-bottom: 8px;
    padding-left: 8px;
    padding-right: 8px;
    overflow: hidden;
}

.text-h6 {
    min-height: 48px; /* Two lines of text */
    max-height: 48px; /* Ensure consistent layout */
    overflow: hidden; /* Prevents content overflow */
    white-space: normal; /* Allows text to wrap */
    line-height: 24px; /* Adjust based on your font size */
}

.text-caption {
    min-height: 40px; /* Two lines of text */
    max-height: 40px; /* Ensure consistent layout */
    overflow: hidden; /* Prevents content overflow */
    white-space: normal; /* Allows text to wrap */
    line-height: 20px; /* Adjust based on your font size */
}

.produse-servicii-container {
    min-height: 50px; /* Ensure consistent layout */
    max-height: 80px; /* Adjust this height as needed */
    overflow-y: auto; /* Allows scrolling if content exceeds max height */
    margin-bottom: 10px; /* Adds space below the container */
    white-space: normal; /* Allows text to wrap */
}

.rating-container {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px; /* Adjust the gap to control the space between the animation and the score */
    min-height: 50px; /* Ensures the container maintains its height even on smaller screens */

}

.rating-animation {
    margin-top: -20px;
    height: 50px; /* Ensuring the height of the animation is 50px */
    width: auto; /* Ensure the width is auto to fit the content */
    vertical-align: middle; /* Ensures alignment with text */
}

.rating-score {
    font-size: 1.25rem; /* Adjust the font size as needed */
    vertical-align: middle; /* Ensures alignment with animation */
}

</style>
