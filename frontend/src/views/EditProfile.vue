<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiStore } from '../apiStore/guestApi.js'
import { useAuthStore } from '@/apiStore/authStore.js'

const route = useRoute()
const router = useRouter()
const user_id = route.params.id

const api = useApiStore()
const auth = useAuthStore()

const username = ref('')
const description = ref('')
const selectedFile = ref(null)
const previewImage = ref(null)
const fileInput = ref(null)

const loading = ref(false)
const error = ref(null)
const successMessage = ref(null)

onMounted(async () => {
  try {
    const user = await api.getUserById(user_id)
    if (user) {
      username.value = user.nickname
      description.value = user.description
      previewImage.value = user.profilePic
    }
  } catch (err) {
    console.error(err)
    error.value = "No s'ha pogut carregar l'usuari."
  }
})

function triggerFileInput() {
  fileInput.value.click()
}

function onFileSelected(event) {
  const file = event.target.files[0]
  if (!file) return

  selectedFile.value = file
  previewImage.value = URL.createObjectURL(file)
}

async function saveProfile() {
  loading.value = true
  error.value = null

  try {
    if (selectedFile.value) {
      await auth.changeProfilePicture(selectedFile.value)
      auth.refreshUserInfo()
    }

    await auth.updateUserProfile({
      nickname: username.value,
      description: description.value,
    })
    successMessage.value = 'Canvis desats correctament!'
    // Esperar 1.2 s abans de redirigir perquè es pugui veure el missatge
    setTimeout(() => {
      router.push({ name: 'profile', params: { id: user_id } })
    }, 1200)
  } catch (err) {
    console.error(err)
    error.value = 'Error al desar el perfil.'
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div class="edit-profile">
    <h1>Editar Perfil</h1>

    <div v-if="error" class="error">{{ error }}</div>
    <!--Missatge de confirmació -->
    <div v-if="successMessage" class="success">
      {{ successMessage }}
    </div>

    <!-- Avatar amb hover -->
    <div class="avatar-section">
      <div class="avatar-preview" @click="triggerFileInput">
        <input ref="fileInput" type="file" @change="onFileSelected" style="display: none" />

        <img :src="previewImage" alt="Avatar Preview" />

        <!-- Icona llapis -->
        <div class="avatar-hover">
          <span class="pencil-icon">✎</span>
        </div>
      </div>
    </div>

    <!-- Formulari -->
    <div class="form-section">
      <label>
        Nom d'usuari:
        <input type="text" v-model="username" />
      </label>

      <label>
        Descripció:
        <textarea name="description" v-model="description" rows="4"></textarea>
      </label>

      <button @click="saveProfile" :disabled="loading">
        {{ loading ? 'Desant...' : 'Desar canvis' }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.edit-profile {
  padding: 20px 40px;
  color: white;
  background-color: #121212;
  min-height: 100vh;
}

/* Avatar amb hover */
.avatar-section {
  margin-bottom: 30px;
}

.avatar-preview {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: none;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Hover negre + llapis blanc minimalista */
.avatar-hover {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: 0.25s ease;
}

.avatar-preview:hover .avatar-hover {
  opacity: 1;
}

.pencil-icon {
  font-size: 2.4rem;
  color: white;
  opacity: 0.9;
}

/* Formulari */
.form-section label {
  display: block;
  margin-bottom: 18px;
  font-weight: bold;
}

/* Inputs estil Spotify (gris fosc, no blanc) */
.form-section input,
.form-section textarea {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  border-radius: 6px;
  border: none;
  background-color: #1e1e1e; /* Gris fosc Spotify */
  color: white;
  resize: none;
}

/* Botó desar */
.form-section button {
  padding: 10px 18px;
  background-color: #ff2d8d;
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}

.form-section button:hover {
  background-color: #fc64a8;
  transform: scale(1.05);
}

.form-section button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #ff6b6b;
  margin-bottom: 10px;
}
/* Missatge d'èxit estil Spotify */
.success {
  background-color: #1db954;
  padding: 12px;
  color: white;
  border-radius: 6px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: bold;
  animation: fadeIn 0.3s ease;
}

/* Animació agradable */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
