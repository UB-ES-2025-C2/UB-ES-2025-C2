<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApiStore } from '../apiStore/guestApi.js'
import { usePlayerStore } from '@/piniaStore/playerStore'

const player = usePlayerStore()
const route = useRoute()
const api = useApiStore()

const playlist = ref(null)
const songs = ref([])
const loading = ref(true)
const error = ref('')

// Computed per saber quina cançó s'està reproduint
const isCurrentSong = (song) => {
  return player.current && song && player.current.id === song.id
}

function togglePlay(song) {
  if (!song) return
  if (isCurrentSong(song)) {
    player.toggle() // Pause/Play si és la mateixa cançó
  } else {
    player.playSong(song) // Reproduir nova cançó
  }
}

async function loadPlaylist() {
  try {
    playlist.value = await api.getPlaylistById(route.params.id)
    songs.value = await api.getSongFromPlayList(route.params.id)
  } catch (e) {
    error.value = e?.response?.data?.detail || e?.message || 'Error desconegut'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPlaylist()
})
function playPlaylist() {
  const trackList = songs.value.map((item) => item.song)
  if (!trackList.length) return
  player.setQueue(trackList) // Assignem la cua al reproductor
  player.playSong(trackList[0]) // Reproduim la primera cançó
}
</script>

<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner"></div>
    <p>Carregant playlist...</p>
  </div>

  <div v-else-if="error" class="error-state">
    <p>⚠️ {{ error }}</p>
  </div>

  <div v-else class="playlist-view">
    <!-- Hero -->
    <div class="playlist-hero">
      <div class="hero-gradient"></div>
      <div class="hero-content">
        <div class="cover-wrapper">
          <img :src="playlist.cover" alt="Cover playlist" class="playlist-cover" />
        </div>
        <div class="playlist-info">
          <span class="playlist-label">PLAYLIST</span>
          <h1 class="playlist-title">{{ playlist.name }}</h1>
          <p class="playlist-description">{{ playlist.description }}</p>
          <div class="playlist-meta">
            <span class="owner">{{ playlist.owner }}</span>
            <span class="separator">•</span>
            <span class="song-count">{{ songs.length }} cançons</span>
          </div>

          <!-- Botó Play de tota la playlist -->
          <button class="btn-playlist-play" @click="playPlaylist">▶</button>
        </div>
      </div>
    </div>

    <!-- Llista de cançons -->
    <div class="songs-section">
      <div class="songs-header">
        <span class="col-number">#</span>
        <span class="col-title">Títol</span>
        <span class="col-artist">Artista</span>
        <span class="col-topic">Gènere</span>
        <span class="col-actions">Reproduir</span>
      </div>

      <div class="songs-list">
        <div v-for="(songItem, index) in songs" :key="songItem.id" class="song-row">
          <span class="col-number">{{ index + 1 }}</span>

          <div class="col-title">
            <img
              v-if="songItem.song.cover"
              :src="songItem.song.cover"
              alt="Cover"
              class="song-thumbnail"
            />
            <div v-else class="song-thumbnail-placeholder"></div>
            <div class="song-info">
              <strong class="song-name">{{ songItem.song.name }}</strong>
            </div>
          </div>

          <span class="col-artist">{{ songItem.song.artist }}</span>
          <span class="col-topic">{{ songItem.song.topic }}</span>

          <div class="col-actions">
            <button @click="togglePlay(songItem.song)" class="btn-play">
              <span v-if="!(isCurrentSong(songItem.song) && player.isPlaying)">▶</span>
              <span v-else>⏸</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Botó Play de tota la playlist */
.btn-playlist-play {
  margin-top: 12px;
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  background: #ff3896; /* verd Spotify */
  color: white;
  font-weight: 900; 
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-playlist-play:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}
playlist-view {
  background-color: #121212;
  color: white;
  min-height: 100vh;
}

/* Hero Section */
.playlist-hero {
  position: relative;
  padding: 40px 40px 30px;
  background: linear-gradient(180deg, #1e3a5f 0%, #121212 100%);
  overflow: hidden;
}

.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(180deg, rgba(255, 45, 141, 0.3) 0%, transparent 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  display: flex;
  gap: 30px;
  align-items: flex-end;
  z-index: 1;
}
.cover-wrapper {
  flex-shrink: 0;
}

.playlist-cover {
  width: 220px;
  height: 220px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.playlist-info {
  flex: 1;
  padding-bottom: 10px;
}

.playlist-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;
}

.playlist-title {
  margin: 8px 0 12px;
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.1;
}

.playlist-description {
  margin: 8px 0;
  color: #b3b3b3;
  font-size: 0.95rem;
}

.playlist-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.9rem;
  color: #b3b3b3;
}

.separator {
  color: #535353;
}

.owner {
  font-weight: 600;
  color: #fff;
}
.songs-section {
  padding: 20px 40px 40px;
}
.songs-header {
  display: grid;
  grid-template-columns: 50px 1fr 200px 150px 80px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #282828;
  font-size: 0.85rem;
  font-weight: 600;
  color: #b3b3b3;
  text-transform: uppercase;
}
.song-row {
  display: grid;
  grid-template-columns: 50px 1fr 200px 150px 80px;
  gap: 16px;
  padding: 12px 16px;
  align-items: center;
  border-radius: 8px;
  transition: background-color 0.2s;
}
.song-row:hover {
  background-color: #1a1a1a;
}
.song-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}
.song-info {
  min-width: 0;
}
.song-name {
  color: #fff;
}
.btn-play {
  background: #ff3896;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
}
.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  color: #fff;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #282828;
  border-top-color: #ff3896;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
