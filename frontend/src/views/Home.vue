<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../apiStore/authStore'
import { useApiStore } from '../apiStore/guestApi.js'

const authStore = useAuthStore()
const apiStore = useApiStore()
const username = ref('')

const route = useRoute()
const router = useRouter()

const nusers = ref('')

const buscarUsuari = async () => {
  await apiStore.getUser(username.value)
}
const buscarNUsers = async () => {
  await apiStore.searchNUsers(nusers.value)
}

function viewprofile() {
  const myid = authStore.user_id
  router.push({ name: 'profile', params: { id: myid } })
}
function goToSongDetail(songId) {
  router.push({ name: 'song-by-id', params: { id: Number(songId) } })
}

function goToPlaylist(playlistId) {
  router.push({ name: 'playlist', params: { id: Number(playlistId) } })
}

/* Agrupamos las playlists por topic */
const playlistsByTopic = computed(() => {
  const grouped = {}
  apiStore.playList.forEach((pl) => {
    const topic = pl.topic || 'Sense tema'
    if (!grouped[topic]) grouped[topic] = []
    grouped[topic].push(pl)
  })
  return grouped
})

onMounted(() => {
  authStore.initializeAuthStore()
  apiStore.fetchCatalog()
  apiStore.fetchPlaylists()
})

// Nombre para la cabecera
const headerUsername = computed(() => {
  if (authStore.username) return authStore.username // si está logueado
  if (apiStore.nUsersResult.length) return apiStore.nUsersResult[0].username // primer usuario de la API
  return 'Usuari' // por defecto
})
</script>

<template>
  <!-- Canciones -->
  <h2>Cançons</h2>
  <ul class="cards-list">
    <li v-for="song in apiStore.songs" :key="song.id" class="card" @click="goToSongDetail(song.id)">
      <!-- Imagen de la canción -->
      <div class="card-image">
        <img :src="song.cover" alt="Foto de canción" />
      </div>

      <!-- Info: nombre y artista -->
      <div class="card-info">
        <strong>{{ song.name }}</strong>
        <p>{{ song.artist }}</p>
      </div>
      <!-- SENSE barra de reproducció -->
    </li>
  </ul>

  <!-- Playlists -->
  <h2>Playlists</h2>
  <div v-for="(pls, topic) in playlistsByTopic" :key="topic" class="topic-section">
    <h3>{{ topic }}</h3>
    <ul class="cards-list">
      <li
        v-for="playlist in pls"
        :key="playlist.id"
        class="card"
        @click="goToPlaylist(playlist.id)"
      >
        <div class="card-image">
          <img :src="playlist.cover" alt="Foto de playlist" />
        </div>
        <div class="card-info">
          <strong>{{ playlist.name }}</strong>
          <p class="description">{{ playlist.description }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.cards-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 0;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  padding: 10px;
  background: #1e1e1e;
  border-radius: 12px;
  color: white;
  gap: 8px;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

.card-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.card-info {
  text-align: center;
  margin-top: 8px;
}

.card-info p {
  color: #aaa;
  margin: 2px 0 0;
  font-size: 0.9rem;
}

.home-header {
  margin-bottom: 20px;
}
.made-for {
  font-size: 0.9rem;
  color: #aaa;
  margin: 0;
}
.username {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0;
}
</style>
