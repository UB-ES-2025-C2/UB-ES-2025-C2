<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApiStore } from '../apiStore/guestApi.js'
import { useAuthStore } from '@/apiStore/authStore.js'

const route = useRoute()
const playlistId = route.params.id
const api = useApiStore()
const auth = useAuthStore()

const playlist = ref(null)
const songs = ref([])
const newSongId = ref('')

// Carrega la playlist i les seves cançons
async function loadPlaylist() {
  playlist.value = await api.getPlaylistById(playlistId)
  songs.value = await api.getSongFromPlayList(playlistId)
}

// Afegir cançó per ID
async function addSong() {
  if (!newSongId.value) return
  const payload = { song_id: newSongId.value }
  const added = await auth.postPlayListSong(playlistId, payload)
  if (added) {
    songs.value = await api.getSongFromPlayList(playlistId)
    newSongId.value = ''
  }
}

onMounted(loadPlaylist)
</script>

<template>
  <div v-if="playlist" class="playlist-view">
    <!-- Encabezado de la playlist -->
    <div class="playlist-header">
      <img :src="playlist.cover" alt="Cover playlist" class="playlist-cover"/>
      <div class="playlist-info">
        <h1>{{ playlist.name }}</h1>
        <p>{{ playlist.description }}</p>
        <p>Propietari: {{ playlist.owner }}</p>
      </div>
    </div>

    <!-- Cançons -->
    <div class="songs-section">
      <h2>Cançons</h2>
      <ul class="song-list">
        <li v-for="song in songs" :key="song.id" class="song-card">
            <img
                v-if="song.song.cover"
                :src="song.song.cover"
                alt="Caràtula"
                class="cover"
                />
            <div class="song-details">
            <strong>{{ song.song.name }}</strong>
            <p>{{ song.song.artist }}</p>
            <p class="song-topic">{{ song.song.topic }}</p>
            <audio :src="song.song.file_audio" controls></audio>
          </div>
        </li>
      </ul>
    </div>
    <input v-model="newSongId" placeholder="ID de la cançó" />
    <button @click="addSong">Afegir cançó</button>
    
  </div>

  <p v-else>Carregant playlist...</p>
</template>

<style scoped>
.playlist-view {
  padding: 20px 40px;
  background-color: #121212;
  color: white;
  min-height: 100vh;
}

.playlist-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  align-items: center;
}

.playlist-cover {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
}

.playlist-info h1 {
  margin: 0;
  font-size: 2rem;
}

.playlist-info p {
  margin: 4px 0;
  color: #aaa;
}

.songs-section {
  margin-top: 20px;
}

.song-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  list-style: none;
  padding: 0;
}

.song-card {
  display: flex;
  flex-direction: column;
  background: #181818;
  border-radius: 12px;
  overflow: hidden;
  width: 180px;
  padding: 10px;
  transition: transform 0.2s;
}

.song-card:hover {
  transform: scale(1.05);
}

.song-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.song-card .cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: none;
  margin-bottom: 10px;
}


.song-details {
  margin-top: 10px;
}

.song-details strong {
  display: block;
  margin-bottom: 4px;
}

.song-details p {
  margin: 2px 0;
  color: #aaa;
  font-size: 0.9rem;
}

.song-topic {
  font-style: italic;
  color: #ff2d8d;
}

.add-song {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.add-song input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 8px;
  border: none;
}

.add-song button {
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background-color: #ff2d8d;
  color: white;
  cursor: pointer;
}
</style>
