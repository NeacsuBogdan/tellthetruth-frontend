<template>
  <v-card class="review-form-container">
    <v-form v-if="isAnimationLoaded" @submit.prevent="submitReview">
      <div class="animation-background">
        <LottieAnimation animationTag="review" :scale="1.5" @animation-loaded="onAnimationLoaded" />
      </div>
      <div class="form-content">
        <v-row>
          <v-col cols="12">
            <div class="location-info">
              <v-list-item-title class="location-name">{{ location?.Nume || 'Locație necunoscută' }}</v-list-item-title>
              <v-list-item-subtitle class="location-address">{{ location?.Adresa || 'Adresă necunoscută' }}</v-list-item-subtitle>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-rating v-model="review.rating" dense size="auto" color="amber" background-color="grey lighten-1"
              empty-icon="mdi-star-outline" full-icon="mdi-star" class="custom-rating"></v-rating>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea 
              v-model="review.comment" 
              :rules="commentRules" 
              outlined 
              label="Comentariu" 
              rows="3" 
              no-resize
              :counter="600" 
              maxlength="600"
              class="form-input"
              :class="{ 'has-error': hasError }"
            >
              <template v-slot:counter="{ props }">
                <v-counter v-bind="props" :value="review.comment.length" class="custom-counter"></v-counter>
              </template>
            </v-textarea>
            <div class="char-counter">{{ review.comment.length }}/600</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-btn color="primary" class="submit-btn" type="submit">Trimite Recenzia</v-btn>
          </v-col>
        </v-row>
      </div>
    </v-form>
  </v-card>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useLocationsStore, useAuthStore, useReviewsStore, useBadWordsStore } from '@/store';
import { postReview } from '@/services/generalService';
import { toast } from 'vue3-toastify';
import LottieAnimation from '@/components/LottieAnimation.vue';
import Filter from 'bad-words';
import { checkForProfanity } from '@/services/profanityFilter';

const customFilter = new Filter();

export default {
  components: {
    LottieAnimation
  },
  props: ['idLocatie'],
  setup(props, { emit }) {
    const locationsStore = useLocationsStore();
    const authStore = useAuthStore();
    const reviewsStore = useReviewsStore();
    const badWordsStore = useBadWordsStore();
    const review = reactive({
      idLocatie: parseInt(props.idLocatie, 10),
      rating: 0,
      comment: ""
    });
    const highlightedComment = ref('');
    const hasError = ref(false);

    const location = computed(() => locationsStore.locations.find(loc => loc.Id === review.idLocatie));

    const isAnimationLoaded = reactive({ value: false });

    function onAnimationLoaded() {
      isAnimationLoaded.value = true;
    }

    function reloadAnimation() {
      const lottieAnimation = this.$refs.lottieAnimation;
      if (lottieAnimation) {
        lottieAnimation.reloadAnimation();
      }
    }

const commentRules = [
  v => !!v || 'Comentariul este necesar',
  v => v.length >= 50 || 'Comentariul trebuie să aibă cel puțin 50 de caractere.',
  v => {
    // Verificare caractere duplicate consecutive în interiorul cuvintelor (ex: foo, fo oo, foo o, fo o o)
    const charDuplicatePattern = /(.)\1{2,}/; // Ex: foo
    const spacedCharDuplicatePattern = /(\b\w*?)(\w)\s*\2{2,}\w*\b/; // Ex: fo o o
    
    // Verificare cuvinte duplicate (ex: foo foo, fo o, foo o o)
    const wordDuplicatePattern = /\b(\w+)\b\s*(?:\b\1\b\s*){2,}/; // Ex: foo foo foo

    // Verificare secvențe de caractere duplicate (ex: asasasas)
    const repeatingSequencePattern = /(\w{2,})\1+/; // Ex: fafa, asasasas

    if (charDuplicatePattern.test(v)) {
      const match = v.match(charDuplicatePattern);
      return `Comentariul nu poate conține mai mult de două caractere duplicate consecutiv: "${match[0]}"`;
    }
    if (spacedCharDuplicatePattern.test(v)) {
      const match = v.match(spacedCharDuplicatePattern);
      return `Comentariul nu poate conține caractere duplicate separate de spații: "${match[0]}"`;
    }
    if (wordDuplicatePattern.test(v)) {
      const match = v.match(wordDuplicatePattern);
      return `Comentariul nu poate conține cuvinte duplicate: "${match[1]}"`;
    }
    if (repeatingSequencePattern.test(v)) {
      const match = v.match(repeatingSequencePattern);
      return `Comentariul nu poate conține secvențe repetitive: "${match[0]}"`;
    }
    return true;
  },
  v => {
    const { found, word } = checkForProfanity(v, badWordsStore.badWords, badWordsStore.leetMap);
    if (found) {
      highlightedComment.value = v.replace(new RegExp(word, 'gi'), match => `<span class="highlight">${match}</span>`);
      return `Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${word}`;
    }
    return true;
  },
  v => {
    if (customFilter.isProfane(v)) {
      const words = v.split(/\s+/);
      const profaneWord = words.find(word => customFilter.isProfane(word));
      highlightedComment.value = v.replace(new RegExp(profaneWord, 'gi'), match => `<span class="highlight">${match}</span>`);
      return `Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${profaneWord}`;
    }
    const { found, word } = checkForProfanity(v, badWordsStore.badWords, badWordsStore.leetMap);
    if (found) {
      highlightedComment.value = v.replace(new RegExp(word, 'gi'), match => `<span class="highlight">${match}</span>`);
      return `Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${word}`;
    }
    return true;
  }
];





    watch(() => review.comment, (newVal) => {
      hasError.value = commentRules.some(rule => rule(newVal) !== true);
    });

    async function submitReview() {
      const validationResults = commentRules.map(rule => rule(review.comment));
      const hasValidationError = validationResults.some(result => result !== true);

      if (hasValidationError) {
        toast.error('Comentariul trebuie să respecte toate regulile de validare.', {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          hideProgressBar: false,
        });
        return;
      }

      if (review.rating < 1) {
        toast.error('Vă rugăm să acordați un scor de la 1 la 5 stele.', {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          hideProgressBar: false,
        });
        return;
      }

      try {
        const response = await postReview(review.idLocatie, review.comment, review.rating);

        toast.success('Recenzie trimisă cu succes!', {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          hideProgressBar: false,
        });

        reviewsStore.addReview(response.review);

        emit('review-submitted');
      } catch (error) {
        toast.error('Eroare la trimiterea recenziei: ' + (error.response?.data.message || 'Eroare necunoscută'), {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          hideProgressBar: false,
        });
      }
    }

    onMounted(() => {
      if (!badWordsStore.badWords || badWordsStore.badWords.length === 0) {
        toast.error('Failed to load bad words list from store.');
      } else {
        customFilter.addWords(...badWordsStore.badWords);
      }
    });

    return { review, location, isAnimationLoaded, onAnimationLoaded, reloadAnimation, submitReview, commentRules, hasError };
  },
  mounted() {
    this.reloadAnimation(); // Reîncarcă animația atunci când componenta este montată
  }
}
</script>

<style scoped>
.review-form-container {
  background-color: #ff4943;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  width: 100%;
  max-width: 600px; /* Fixat pentru ecrane mai mari */
  margin: 0 auto; /* Centrează cardul */
  position: relative;
}

.animation-background {
  position: absolute;
  top: -80px;
  left: 0;
  width: 100%;
  height: 50%; /* Ajustează înălțimea animației pentru a nu ocupa tot cardul */
  z-index: -1;
  overflow: hidden;
}

.form-content {
  position: relative;
  margin-top: 80px; /* Ajustează această valoare pentru a controla cât de jos începe formularul */
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 18px; /* Mărit font-size */
  background-color: #f8d65c !important;
  color: #000 !important;
}

.location-info .location-name,
.location-info .location-address {
  display: block;
  margin-bottom: 8px;
}

.location-name {
  font-size: 26px; /* Mărit font-size */
  color: #f8d65c;
}

.location-address {
  font-size: 18px; /* Mărit font-size */
  color: #fff;
}

.char-counter {
  margin-top: 8px;
  font-size: 16px; /* Mărit font-size */
  color: #fff;
  text-align: right; /* Text aliniat la dreapta */
}

.v-textarea {
  background-color: transparent; /* Făcut transparent */
  color: white;
}

.v-textarea .v-input__control .v-input__slot {
  border: 2px solid #f8d65c;
}

/* Stil personalizat pentru counter */
.custom-counter {
  color: #fff !important;
  position: absolute;
  bottom: -20px; /* Ajustează poziția verticală */
  right: 10px; /* Ajustează poziția orizontală */
  font-size: 12px; /* Ajustează font-size pentru a fi mic */
}

.has-error :deep(.v-field-label) {
  color: yellow !important; /* Etichetă galbenă când câmpul este invalid */
}

.form-input :deep(.v-messages__message) {
  color: yellow !important; /* Mesaj de eroare galben */
}

/* Stiluri personalizate pentru componenta de rating */
.custom-rating {
  font-size: 35px; /* Ajustează dimensiunea pentru a face stelele mai mari */
}

</style>