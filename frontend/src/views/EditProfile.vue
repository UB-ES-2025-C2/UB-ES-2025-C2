<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApiStore } from "../apiStore/guestApi.js";
import { useAuthStore } from "@/apiStore/authStore.js";

const route = useRoute();
const router = useRouter();
const user_id = route.params.id;

const api = useApiStore();
const auth = useAuthStore();

const username = ref("");
const description = ref("");
const selectedFile = ref(null);
const previewImage = ref(null);
const fileInput = ref(null);

const loading = ref(false);
const error = ref(null);

// Obtenir informació de l'usuari per inicialitzar el formulari
onMounted(async () => {
  try {
    const user = await api.getUserById(user_id);
    if (user) {
      username.value = user.nickname;
      description.value = user.description;
      previewImage.value = user.profilePic;
    }
  } catch (err) {
    console.error(err);
    error.value = "No s'ha pogut carregar l'usuari.";
  }
});

// Funció per obrir selector d'arxius
function triggerFileInput() {
  fileInput.value.click();
}

// Funció per seleccionar imatge
function onFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  selectedFile.value = file;
  previewImage.value = URL.createObjectURL(file);
}

// Funció per desar canvis
async function saveProfile() {
  loading.value = true;
  error.value = null;
  try {
    // Pujar avatar si n'hi ha un de nou
    if (selectedFile.value) {
      await auth.changeProfilePicture(selectedFile.value);
      auth.refreshUserInfo();
    }

    // Actualitzar altres dades (nickname, descripció)
    await auth.updateUserProfile({
      nickname: username.value,
      description: description.value,
    });

    // Redirigir de nou al perfil
    router.push({ name: "profile", params: { id: user_id } });
  } catch (err) {
    console.error(err);
    error.value = "Error al desar el perfil.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="edit-profile">
    <h1>Editar Perfil</h1>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Avatar -->
    <div class="avatar-section">
      <div class="avatar-preview" @click="triggerFileInput">
        <input
          ref="fileInput"
          type="file"
          @change="onFileSelected"
          style="display: none"
        />
        <img :src="previewImage" alt="Avatar Preview" />
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
        <textarea v-model="description" rows="4"></textarea>
      </label>

      <button @click="saveProfile" :disabled="loading">
        {{ loading ? "Desant..." : "Desar canvis" }}
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

.avatar-section {
  margin-bottom: 20px;
}
.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #1db954;
}
.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-section label {
  display: block;
  margin-bottom: 15px;
  font-weight: bold;
}

.form-section input,
.form-section textarea {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 6px;
  border: none;
}

.form-section button {
  padding: 8px 16px;
  background-color: #1db954;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.form-section button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-bottom: 10px;
}
</style>
