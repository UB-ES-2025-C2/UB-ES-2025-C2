<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/apiStore/authStore";

const router = useRouter();
const auth = useAuthStore();

// Camps del formulari
const name = ref("");
const artist = ref("");
const topic = ref("");
const authors = ref([]); // Array d'IDs d'autors
const fileAudio = ref(null);
const cover = ref(null);
const previewCover = ref(null);

const fileAudioInput = ref(null);
const coverInput = ref(null);

const loading = ref(false);
const error = ref(null);

// Funcions per obrir selector d'arxius
function triggerAudioInput() {
  fileAudioInput.value.click();
}
function triggerCoverInput() {
  coverInput.value.click();
}

// Funcions per seleccionar arxius
function onAudioSelected(event) {
  fileAudio.value = event.target.files[0];
}
function onCoverSelected(event) {
  cover.value = event.target.files[0];
  if (cover.value) {
    previewCover.value = URL.createObjectURL(cover.value);
  }
}

onMounted(async () => {
  auth.initializeAuthStore();
});
// Funció per enviar POST
async function createSong() {
  if (!fileAudio.value) {
    error.value = "Cal pujar un fitxer d'àudio.";
    return;
  }

  loading.value = true;
  error.value = null;

  const song = {
    name: name.value,
    artist: artist.value,
    topic: topic.value,
    authors: authors.value,
    file_audio: fileAudio.value,
    cover: cover.value || null,
  };
  auth.postSong(song)
    .then(
      response => {
        console.log("Cançó creada:", response.data);
        alert("Cançó creada correctament!");
        router.push({ name: 'home' })
      }
    )
    .catch(err => {
      console.error(err);
      error.value = "Error en crear la cançó.";
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <div class="create-song-form">
    <h1>Crear Cançó</h1>

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
      <input type="text" v-model="authorsString" @input="authors = $event.target.value.split(',').map(a => parseInt(a.trim()))" />
    </label>

    <!-- Audio -->
    <div class="file-input">
      <button type="button" @click="triggerAudioInput">Pujar àudio</button>
      <input ref="fileAudioInput" type="file" @change="onAudioSelected" style="display:none" />
      <span v-if="fileAudio">{{ fileAudio.name }}</span>
    </div>

    <!-- Cover opcional -->
    <div class="file-input">
      <button type="button" @click="triggerCoverInput">Pujar portada (opcional)</button>
      <input ref="coverInput" type="file" @change="onCoverSelected" style="display:none" />
      <img v-if="previewCover" :src="previewCover" alt="Preview Cover" class="cover-preview"/>
    </div>

    <button @click="createSong" :disabled="loading">
      {{ loading ? "Creant..." : "Crear Cançó" }}
    </button>
  </div>
</template>

<style scoped>
.create-song-form {
  padding: 20px;
  color: white;
  background-color: #121212;
  max-width: 500px;
  margin: auto;
}

label {
  display: block;
  margin-bottom: 12px;
  font-weight: bold;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border-radius: 6px;
  border: none;
}

button {
  padding: 8px 16px;
  background-color: #1db954;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-weight: bold;
  margin-top: 12px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-bottom: 10px;
}

.cover-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-top: 8px;
  border-radius: 6px;
}
</style>
