<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/apiStore/authStore'

const router = useRouter()
const auth = useAuthStore()

// Camps del formulari
const name = ref('')
const description = ref('')
const topic = ref('')
const owner = ref([]) // array d'IDs d'usuaris propietaris
const watched = ref([]) // array d'IDs d'usuaris que han vist la playlist
const cover = ref(null)
const previewCover = ref(null)

const coverInput = ref(null)

const loading = ref(false)
const error = ref(null)
const success = ref(null) // per missatge d’èxit

// Funcions per obrir selector de fitxer
function triggerCoverInput() {
  coverInput.value.click()
}

// Funció per seleccionar fitxer
function onCoverSelected(event) {
  cover.value = event.target.files[0]
  if (cover.value) {
    previewCover.value = URL.createObjectURL(cover.value)
  }
}

onMounted(async () => {
  auth.initializeAuthStore()
})

async function createPlaylist() {
  if (!name.value || !topic.value) {
    error.value = "El nom i el tema són obligatoris."
    return
  }

  loading.value = true
  error.value = null

  // Creem objecte playlist similar a la cançó
  const playlist = {
    name: name.value,
    description: description.value,
    topic: topic.value,
    owner: owner.value,
    cover: cover.value || null
  }

  auth.postPlaylist(playlist)
    .then((response) => {
      console.log('Playlist creada:', response.data)
      success.value = 'Playlist creada correctament!'
      success.value = null
      router.push({ name: 'home' })
    })
    .catch((err) => {
      console.error(err)
      error.value = 'Error en crear la playlist.'
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div class="create-playlist-form">
    <h1>Crear Playlist</h1>

    <div v-if="error" class="error">{{ error }}</div>

    <label>
      Nom:
      <input type="text" v-model="name" />
    </label>

    <label>
      Descripció:
      <input type="text" v-model="description" />
    </label>

    <label>
      Tema:
      <input type="text" v-model="topic" />
    </label>

    <label>
      Owners (IDs separats per coma):
      <input type="text" @input="owner.value = $event.target.value.split(',').map(a => parseInt(a.trim()))" />
    </label>

    <!-- Cover opcional -->
    <div class="file-input">
      <button type="button" @click="triggerCoverInput">Pujar portada (opcional)</button>
      <input ref="coverInput" type="file" @change="onCoverSelected" style="display: none" />
      <img v-if="previewCover" :src="previewCover" alt="Preview Cover" class="cover-preview" />
    </div>

    <button @click="createPlaylist" :disabled="loading">
      {{ loading ? 'Creant...' : 'Crear Playlist' }}
    </button>
  </div>

  <div v-if="success" class="success">{{ success }}</div>
</template>

<style scoped>
/* Pots reutilitzar els estils de create-song-form adaptant-los si cal */
.create-playlist-form {
  padding: 30px;
  color: white;
  background-color: #121212;
  max-width: 500px;
  margin: 40px auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  font-family: 'Arial', sans-serif;
}
label {
  display: block;
  margin-bottom: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}
input[type='text'] {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  border-radius: 6px;
  border: none;
  background-color: #282828;
  color: #fff;
  font-size: 14px;
}
button {
  padding: 10px 20px;
  background-color: #ff3896;
  border: none;
  border-radius: 50px;
  color: white;
  cursor: pointer;
  font-weight: bold;
  margin-top: 15px;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.file-input {
  margin-bottom: 15px;
}
.cover-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  margin-top: 10px;
  border-radius: 8px;
}
.error {
  color: #ff4d4f;
  margin-bottom: 10px;
  font-weight: bold;
}
.success {
  background-color: #1db954;
  color: white;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 15px;
}
</style>
