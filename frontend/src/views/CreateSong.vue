<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/apiStore/authStore'

const router = useRouter()
const auth = useAuthStore()

// Camps del formulari
const name = ref('')
const artist = ref('')
const topic = ref('')
const authors = ref([]) // Array d'IDs d'autors
const fileAudio = ref(null)
const cover = ref(null)
const previewCover = ref(null)

const fileAudioInput = ref(null)
const coverInput = ref(null)

const loading = ref(false)
const error = ref(null)
const success = ref(null) // ← nova ref per mostrar missatge d’èxit

// Funcions per obrir selector d'arxius
function triggerAudioInput() {
  fileAudioInput.value.click()
}

function triggerCoverInput() {
  coverInput.value.click()
}

// Funcions per seleccionar arxius
function onAudioSelected(event) {
  fileAudio.value = event.target.files[0]
}

function onCoverSelected(event) {
  cover.value = event.target.files[0]
  if (cover.value) {
    previewCover.value = URL.createObjectURL(cover.value)
  }
}

onMounted(async () => {
  auth.initializeAuthStore()
})

// Funció per enviar POST
async function createSong() {
  if (!fileAudio.value) {
    error.value = "Cal pujar un fitxer d'àudio."
    return
  }

  loading.value = true
  error.value = null

  const song = {
    name: name.value,
    artist: artist.value,
    topic: topic.value,
    authors: authors.value,
    file_audio: fileAudio.value,
    cover: cover.value || null,
  }

  const formData = new FormData()
  formData.append('name', name.value)
  formData.append('artist', artist.value)
  formData.append('topic', topic.value)
  authors.value.forEach((author) => {
    formData.append('authors', author)
  })
  // Fitxers
  formData.append('file_audio', fileAudio.value)
  if (cover.value) {
    formData.append('cover', cover.value)
  }

  auth
    .postSong(formData)
    .then((response) => {
      console.log('Cançó creada:', response.data)
      success.value = 'Cançó pujada correctament!'
      setTimeout(() => {
        success.value = null
        router.push({ name: 'home' })
      }, 3000) // desapareix després de 3 segons
    })
    .catch((err) => {
      console.error(err)
      error.value = 'Error en pujar la cançó.'
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div class="create-song-form">
    <h1>Pujar Cançó</h1>

    <div v-if="error" class="error">{{ error }}</div>

    <label>
      Nom:
      <input type="text" v-model="name" />
    </label>

    <label>
      Artista:
      <input type="text" v-model="artist" />
    </label>

    <label>
      Tema:
      <input type="text" v-model="topic" />
    </label>

    <label>
      Autors (IDs separats per coma):
      <input
        type="text"
        v-model="authorsString"
        @input="authors = $event.target.value.split(',').map((a) => parseInt(a.trim()))"
      />
    </label>

    <!-- Audio -->
    <div class="file-input">
      <button type="button" @click="triggerAudioInput">Pujar àudio</button>
      <input ref="fileAudioInput" type="file" @change="onAudioSelected" style="display: none" />
      <span v-if="fileAudio">{{ fileAudio.name }}</span>
    </div>

    <!-- Cover opcional -->
    <div class="file-input">
      <button type="button" @click="triggerCoverInput">Pujar portada (opcional)</button>
      <input ref="coverInput" type="file" @change="onCoverSelected" style="display: none" />
      <img v-if="previewCover" :src="previewCover" alt="Preview Cover" class="cover-preview" />
    </div>

    <button @click="createSong" :disabled="loading">
      {{ loading ? 'Pujant...' : 'Pujar Cançó' }}
    </button>
  </div>
  <div v-if="success" class="success">{{ success }}</div>
</template>

<style scoped>
.create-song-form {
  padding: 30px;
  color: white;
  background-color: #121212;
  max-width: 500px;
  margin: 40px auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  font-family: 'Arial', sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #fff;
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

input[type='text']::placeholder {
  color: rgba(255, 255, 255, 0.5);
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
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #ff3896;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #ff4d4f;
  margin-bottom: 10px;
  font-weight: bold;
}

.file-input {
  margin-bottom: 15px;
}

.file-name {
  display: block;
  margin-top: 6px;
  color: #b3b3b3;
  font-size: 13px;
}

.cover-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  margin-top: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
}
.success {
  background-color: #1db954;
  color: white;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 15px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
