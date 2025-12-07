<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApiStore } from '../apiStore/guestApi.js'
import { useAuthStore } from '@/apiStore/authStore.js'
import { Trash2, Plus, Music } from 'lucide-vue-next'

const route = useRoute()
const playlistId = route.params.id
const api = useApiStore()
const auth = useAuthStore()

const playlist = ref(null)
const songs = ref([])
const selectedSongId = ref('')
const isAddingSong = ref(false)
const allSongs = ref([])

const availableSongs = computed(() => {
  if (!api.songs || songs.value.length === 0) return api.songs || []
  const playlistSongIds = songs.value.map(s => s.song.id)
  return api.songs.filter(song => !playlistSongIds.includes(song.id))
})

async function loadPlaylist() {
  playlist.value = await api.getPlaylistById(playlistId)
  songs.value = await api.getSongFromPlayList(playlistId)
  await api.fetchCatalog();
}

async function addSong() {
  if (!selectedSongId.value) return
  isAddingSong.value = true
  const payload = { song_id: selectedSongId.value }
  const added = await auth.postPlayListSong(playlistId, payload)
  if (added) {
    songs.value = await api.getSongFromPlayList(playlistId)
    selectedSongId.value = ''
  }
  isAddingSong.value = false
}

async function removeSong(songId) {
  if (!confirm('Estàs segur que vols eliminar aquesta cançó de la playlist?')) return
  const deleted = await auth.deletePlayListSong(playlistId, songId)

  if (deleted) {
    songs.value = await api.getSongFromPlayList(playlistId)
  }
}

onMounted(async () => {
  await loadPlaylist()
  await api.fetchCatalog()
})
</script>

<template>
  <div v-if="playlist" class="playlist-view">
    <!-- Hero Header amb gradient -->
    <div class="playlist-hero">
      <div class="hero-gradient"></div>
      <div class="hero-content">
        <div class="cover-wrapper">
          <img :src="playlist.cover" alt="Cover playlist" class="playlist-cover"/>
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
        </div>
      </div>
    </div>

    <!-- Barra d'accions -->
    <div class="actions-bar">
      <div class="add-song-container">
        <select
          v-model="selectedSongId"
          class="song-select"
        >
          <option value="" disabled>Selecciona una cançó</option>
          <option
            v-for="song in availableSongs"
            :key="song.id"
            :value="song.id"
          >
            {{ song.name }} - {{ song.artist }}
          </option>
        </select>
        <button
          @click="addSong"
          :disabled="isAddingSong || !selectedSongId"
          class="btn-add"
        >
          <Plus :size="20" />
          <span>Afegir cançó</span>
        </button>
      </div>
    </div>

    <!-- Llista de cançons estil taula -->
    <div class="songs-section">
      <div class="songs-header">
        <span class="col-number">#</span>
        <span class="col-title">Títol</span>
        <span class="col-artist">Artista</span>
        <span class="col-topic">Gènere</span>
        <span class="col-actions">Accions</span>
      </div>

      <div class="songs-list">
        <div
          v-for="(song, index) in songs"
          :key="song.id"
          class="song-row"
        >
          <span class="col-number">{{ index + 1 }}</span>

          <div class="col-title">
            <img
              v-if="song.song.cover"
              :src="song.song.cover"
              alt="Cover"
              class="song-thumbnail"
            />
            <div v-else class="song-thumbnail-placeholder">
              <Music :size="20" />
            </div>
            <div class="song-info">
              <strong class="song-name">{{ song.song.name }}</strong>
              <audio :src="song.song.file_audio" controls class="audio-player"></audio>
            </div>
          </div>

          <span class="col-artist">{{ song.song.artist }}</span>
          <span class="col-topic">{{ song.song.topic }}</span>

          <div class="col-actions">
            <button
              @click="removeSong(song.id)"
              class="btn-delete"
              title="Eliminar cançó"
            >
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading-state">
    <div class="spinner"></div>
    <p>Carregant playlist...</p>
  </div>
</template>

<style scoped>
.playlist-view {
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

/* Actions Bar */
.actions-bar {
  padding: 20px 40px;
  background: linear-gradient(180deg, rgba(18, 18, 18, 0.9) 0%, #121212 100%);
}

.add-song-container {
  display: flex;
  gap: 12px;
  max-width: 500px;
}

.song-select {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid #282828;
  background-color: #121212;
  color: white;
  font-size: 0.9rem;
  transition: all 0.2s;
  cursor: pointer;
}

.song-select:focus {
  outline: none;
  border-color: #ff2d8d;
  background-color: #1a1a1a;
}

.song-select option {
  background-color: #121212;
  color: white;
  padding: 10px;
}

.song-select option:hover {
  background-color: #282828;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #ff2d8d 0%, #ff6b9d 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 45, 141, 0.4);
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Songs Section */
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
  letter-spacing: 0.5px;
}

.songs-list {
  margin-top: 8px;
}

.song-row {
  display: grid;
  grid-template-columns: 50px 1fr 200px 150px 80px;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
  transition: background-color 0.2s;
}

.song-row:hover {
  background-color: #1a1a1a;
}

.col-number {
  text-align: center;
  color: #b3b3b3;
  font-weight: 500;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.song-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.song-thumbnail-placeholder {
  width: 50px;
  height: 50px;
  background: #282828;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b3b3b3;
  flex-shrink: 0;
}

.song-info {
  min-width: 0;
  flex: 1;
}

.song-name {
  display: block;
  margin-bottom: 6px;
  font-size: 0.95rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-player {
  width: 100%;
  max-width: 300px;
  height: 30px;
}

.col-artist {
  color: #b3b3b3;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-topic {
  color: #ff2d8d;
  font-size: 0.85rem;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-actions {
  display: flex;
  justify-content: center;
}

.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #b3b3b3;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background-color: #282828;
  color: #ff2d8d;
  transform: scale(1.1);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #121212;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #282828;
  border-top-color: #ff2d8d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .songs-header,
  .song-row {
    grid-template-columns: 40px 1fr 150px 100px 60px;
  }

  .playlist-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .playlist-cover {
    width: 180px;
    height: 180px;
  }

  .songs-header {
    display: none;
  }

  .song-row {
    grid-template-columns: 1fr auto;
    gap: 12px;
  }

  .col-number,
  .col-artist,
  .col-topic {
    display: none;
  }

  .col-title {
    grid-column: 1;
  }

  .col-actions {
    grid-column: 2;
  }

  .add-song-container {
    flex-direction: column;
  }
}
</style>
