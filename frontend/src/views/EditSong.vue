<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/apiStore/authStore";
import { useApiStore } from "@/apiStore/guestApi";

const apiGuest = useApiStore();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const songId = route.params.id;

// Camps del formulari
const name = ref("");
const artist = ref("");
const topic = ref("");
const authors = ref([]);
const authorsString = ref("");

const fileAudio = ref(null);
const cover = ref(null);
const previewCover = ref(null);

const fileAudioInput = ref(null);
const coverInput = ref(null);

const loading = ref(false);
const error = ref(null);

// Obrir selectors de fitxers
function triggerAudioInput() { fileAudioInput.value.click(); }
function triggerCoverInput() { coverInput.value.click(); }

function onAudioSelected(event) { fileAudio.value = event.target.files[0]; }
function onCoverSelected(event) {
  cover.value = event.target.files[0];
  if (cover.value) previewCover.value = URL.createObjectURL(cover.value);
}

// Carregar la cançó
onMounted(async () => {
  try {
    const s = await apiGuest.getSongById(songId);
    name.value = s.name;
    artist.value = s.artist;
    topic.value = s.topic;
    authors.value = s.authors ?? [];
    authorsString.value = authors.value.join(",");
    previewCover.value = s.cover;
  } catch (err) {
    console.error(err);
    error.value = "No s'ha pogut carregar la cançó.";
  }
});

// Guardar canvis
async function updateSong() {
  loading.value = true;
  error.value = null;

    const songData = {
      name: name.value,
      artist: artist.value,
      topic: topic.value,
      authors: authors.value,
      fileAudio: fileAudio.value,
      cover: cover.value
    };
    auth.patchSong(songId, songData).then((response) => {
      if (response.status === 200) {
        alert("Cançó actualitzada correctament!");
        router.push({ name: 'profile', params: { id: auth.user.id }});
      } else {
        error.value = "Error en actualitzar la cançó.";
      }
    }).catch((error) => {
      console.error("Error updating song:", error);
      error.value = "Error en actualitzar la cançó.";
    }).finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <div class="edit-song-form">
    <h1>Editar Cançó</h1>

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
        @input="authors = $event.target.value.split(',').map(a => parseInt(a.trim())).filter(n => !isNaN(n))"
      />
    </label>

    <!-- Àudio opcional -->
    <div class="file-input">
      <button type="button" @click="triggerAudioInput">Canviar àudio (opcional)</button>
      <input ref="fileAudioInput" type="file" @change="onAudioSelected" style="display:none" />
      <span v-if="fileAudio">{{ fileAudio.name }}</span>
    </div>

    <!-- Portada -->
    <div class="file-input">
      <button type="button" @click="triggerCoverInput">Canviar portada</button>
      <input ref="coverInput" type="file" @change="onCoverSelected" style="display:none" />
      <img v-if="previewCover" :src="previewCover" class="cover-preview" />
    </div>

    <button @click="updateSong" :disabled="loading">
      {{ loading ? "Desant..." : "Desar canvis" }}
    </button>
  </div>
</template>

<style scoped>
.edit-song-form {
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
  width: 120px;
  height: 120px;
  object-fit: cover;
  margin-top: 8px;
  border-radius: 6px;
}
</style>
