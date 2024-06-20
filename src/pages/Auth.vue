<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10">
        <v-card class="elevation-6 my-10 position-relative">
          <v-window v-model="step">
            <!-- Login Form -->
            <v-window-item :value="1">
              <v-row>
                <v-col cols="12" md="6" class="pa-8 position-relative">
                  <v-card-text>
                    <h3 class="text-center primary--text">Loghează-te în contul tău</h3>
                    <h5 class="text-center grey--text">Continuă să adaugi și să vezi experiențe reale despre locuri, și să încarci noi locații. Află adevărata poveste a fiecărui loc!</h5>
                    <v-form ref="loginForm" @submit.prevent="login" v-model="isLoginValid">
                      <v-row align="center" justify="center">
                        <v-col cols="12" sm="10">
                          <v-text-field
                            v-model="loginCredentials.Email"
                            :rules="emailRules"
                            label="Email"
                            outlined
                            dense
                            color="primary"
                            class="mt-16"
                          />
                          <v-text-field
                            v-model="loginCredentials.Parola"
                            :rules="passwordRules"
                            label="Parolă"
                            type="password"
                            outlined
                            dense
                            color="primary"
                          />
                          <v-btn color="primary" dark block tile type="submit" class="mb-4">Loghează-te</v-btn>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-col>
                <v-col cols="12" md="6" class="blue-gradient rounded-bl-xl d-flex flex-column justify-center pa-8 position-relative">
                  <v-card-text class="white--text text-center">
                    <div class="animation-container bottom-left">
                      <LottieAnimation animationTag="login"/>
                    </div>
                    <h3>Nu ești încă membru?</h3>
                    <h5>Înscrie-te și începe să adaugi și să vezi experiențe reale despre locuri, și să încarci noi locații. Descoperă adevărul și împărtășește experiențele tale!</h5>
                    <v-btn tile outlined color="white" class="white--text" @click="step = 2">Înscrie-te</v-btn>
                  </v-card-text>
                </v-col>
              </v-row>
            </v-window-item>
            <!-- Registration Form -->
            <v-window-item :value="2">
              <v-row>
                <v-col cols="12" md="6" class="blue-gradient rounded-br-xl d-flex flex-column justify-center pa-8 position-relative">
                  <v-card-text class="white--text text-center">
                    <div class="animation-container bottom-right">
                      <LottieAnimation animationTag="login" />
                    </div>
                    <h3>Deja ai cont?</h3>
                    <h5>Loghează-te în contul tău și continuă să adaugi și să vezi experiențe reale despre locuri, și să încarci noi locații. Alătură-te comunității noastre!</h5>
                    <v-btn tile outlined color="white" class="white--text" @click="step = 1">Loghează-te</v-btn>
                  </v-card-text>
                </v-col>
                <v-col cols="12" md="6" class="pa-8 position-relative">
                  <v-card-text>
                    <v-form ref="registrationForm" @submit.prevent="register" v-model="isRegisterValid">
                      <h3 class="text-center primary--text">Creează-ți un cont</h3>
                      <h5 class="text-center grey--text">Înscrie-te și începe să adaugi și să vezi experiențe reale despre locuri, și să încarci noi locații. Descoperă și împărtășește adevărata poveste a fiecărui loc!</h5>
                      <v-row align="center" justify="center">
                        <v-col cols="12" sm="10">
                          <v-text-field
                            v-model="registrationCredentials.firstName"
                            :rules="nameRules"
                            label="Prenume"
                            outlined
                            dense
                            color="primary"
                            class="mt-4"
                          />
                          <v-text-field
                            v-model="registrationCredentials.lastName"
                            :rules="nameRules"
                            label="Nume"
                            outlined
                            dense
                            color="primary"
                          />
                          <v-text-field
                            v-model="registrationCredentials.email"
                            :rules="emailRules"
                            label="Email"
                            outlined
                            dense
                            color="primary"
                          />
                          <v-text-field
                            v-model="registrationCredentials.password"
                            :rules="passwordRules"
                            label="Parolă"
                            type="password"
                            outlined
                            dense
                            color="primary"
                          />
                          <v-btn color="primary" dark block tile type="submit" class="mb-4">Înscrie-te</v-btn>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useBadWordsStore } from '@/store/badWords';
import Filter from 'bad-words';
import { checkForProfanity } from '@/services/profanityFilter'; // Importați funcția din profanityFilter.js
import authService from '../services/authService';
import { toast } from 'vue3-toastify';

const customFilter = new Filter();

export default {
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const badWordsStore = useBadWordsStore();
    const step = ref(1);
    const isLoginValid = ref(true);
    const isRegisterValid = ref(true);
    const highlightedComment = ref('');
    const loginForm = ref(null);
    const registrationForm = ref(null);
    const loginCredentials = reactive({
      Email: '',
      Parola: ''
    });
    const registrationCredentials = reactive({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });

    const emailRules = [
      v => !!v || 'Emailul este necesar',
      v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Emailul trebuie să fie valid'
    ];
    const passwordRules = [
      v => !!v || 'Parola este necesară',
      v => v.length >= 8 || 'Parola trebuie să aibă cel puțin 8 caractere'
    ];
    const nameRules = [
      v => !!v || 'Numele este necesar',
      v => v.length >= 2 || 'Numele trebuie să aibă cel puțin 2 caractere',
      v => {
        const { found, word } = checkForProfanity(v, badWordsStore.badWords, badWordsStore.leetMap);
        if (found) {
          highlightedComment.value = v.replace(new RegExp(word, 'gi'), match => `<span class="highlight">${match}</span>`);
          return `Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${word}`;
        }
        if (customFilter.isProfane(v)) {
          const words = v.split(/\s+/);
          const profaneWord = words.find(word => customFilter.isProfane(word));
          highlightedComment.value = v.replace(new RegExp(profaneWord, 'gi'), match => `<span class="highlight">${match}</span>`);
          return `Vă rugăm să evitați folosirea cuvintelor ofensatoare: ${profaneWord}`;
        }
        return true;
      }
    ];


const login = async () => {
  const valid = await loginForm.value.validate();
  if (valid.valid == false) {
    toast.error('Va rugam sa completati corespunzator toate câmpurile necesare.');
    return;
  }
  try {
    const response = await authService.login({
      Email: loginCredentials.Email,
      Parola: loginCredentials.Parola
    });
    toast.success('Logare reușită!');
    router.push('/');
  } catch (error) {
    toast.error('Logare eșuată: ' + (error.response.data || 'Campuri necompletate'));
  }
};

const register = async () => {
  const valid = await registrationForm.value.validate();
  if (valid.valid == false) {
    toast.error('Va rugam sa completati corespunzator toate câmpurile necesare.');
    return;
  }
  try {
    const fullName = `${registrationCredentials.firstName} ${registrationCredentials.lastName}`;
    const userData = {
      Nume: fullName,
      Email: registrationCredentials.email,
      Parola: registrationCredentials.password
    };

    const response = await authService.register(userData);
    toast.success('Înregistrare reușită!');
    
    // Resetăm formularul fără a trige regulile de validare
    registrationCredentials.firstName = '';
    registrationCredentials.lastName = '';
    registrationCredentials.email = '';
    registrationCredentials.password = '';

    // Mergem la pasul de login
    step.value = 1;
  } catch (error) {
    toast.error('Înregistrare eșuată: ' + (error.response?.data || 'Eroare necunoscută'));
  }
};

    onMounted(() => {
      // Asigură-te că store-ul conține deja lista de cuvinte ofensatoare
      if (!badWordsStore.badWords || badWordsStore.badWords.length === 0) {
        toast.error('Failed to load bad words list from store.');
      } else {
        customFilter.addWords(...badWordsStore.badWords);
      }
    });

return {
  step,
  loginCredentials,
  registrationCredentials,
  emailRules,
  passwordRules,
  nameRules,
  login,
  register,
  isLoginValid,
  isRegisterValid,
  loginForm,
  registrationForm
};
  }
};
</script>

<style scoped>
.v-container{
margin-top: 64px;
}
.blue-gradient {
  background: linear-gradient(135deg, #1e88e5, #013161);
}

.white--text {
  color: #FFFFFF;
}

.v-application .blue--text {
  color: #1976D2;
}

.v-application .rounded-bl-xl {
  border-bottom-left-radius: 300px !important;
}

.v-application .rounded-br-xl {
  border-bottom-right-radius: 300px !important;
}

.v-card {
  max-width: 1300px; /* Ajustează lățimea cardului */
  margin: 0 auto; /* Centrează cardul */
}

.v-card-text {
  padding: 3rem; /* Ajustează padding-ul intern al card-text */
}

.v-card-text h3 {
  font-size: 1.2rem; /* Ajustează font size după preferință */
  margin-bottom: 0.5rem; /* Ajustează marginile pentru a reduce spațiul */
}

.v-card-text h5 {
  font-size: 0.9rem; /* Ajustează font size după preferință */
  margin-bottom: 0.5rem; /* Ajustează marginile pentru a reduce spațiul */
}

.v-text-field {
  margin-top: 0.5rem; /* Reduce spațiul de deasupra câmpurilor text */
  margin-bottom: 0.5rem; /* Reduce spațiul de dedesubtul câmpurilor text */
}

.v-btn {
  margin-top: 0.5rem; /* Ajustează marginile butonului pentru a reduce înălțimea */
}
</style>
