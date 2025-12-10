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

const followers = ref([])
const following = ref([])

const userData = ref(null)
const userSongs = ref([])
const userPlaylists = ref([])

async function runUserSongs(id_user) {
  followers.value = await api.getFollowers(id_user)
  following.value = await api.getFollowing(id_user)
  userSongs.value = await api.getUserSongs(id_user)
  userPlaylists.value = await api.getUserPlaylists(id_user)
}

function editProfile() {
  router.push({ name: 'edit-profile', params: { id: user_id } })
}

function editarSong(song) {
  router.push({ name: 'editSong', params: { id: song.id } })
}

onMounted(async () => {
  await runUserSongs(user_id)

  const found = await api.getUserById(user_id)

  if (found) {
    userData.value = {
      username: found.nickname,
      followers: followers.value.length,
      following: following.value.length,
      id_user: user_id,
      profile_picture: found.profilePic,
      description: found.description,
    }
  }
})
</script>
<template>
  <div v-if="userData" class="user-profile">
    <!-- Header estil Spotify -->
    <div class="header">
      <!-- CONTENIDOR FOTO + BOTÓ -->
      <div class="avatar-container">
        <div class="avatar">
          <img :src="userData.profile_picture" />
        </div>

        <!-- BOTÓ SOTA LA FOTO -->
        <button v-if="auth.user_id === user_id" @click="editProfile" class="edit-profile-btn">
          Editar perfil
        </button>
      </div>

      <!-- INFO USUARI -->
      <div class="user-info">
        <h1>{{ userData.username }}</h1>
        <p class="followers">
          Seguidors: {{ userData.followers }} · Seguint: {{ userData.following }}
        </p>
        <p class="description">{{ userData.description }}</p>
      </div>
    </div>

    <!-- Cançons -->
    <div v-if="userSongs.length" class="section">
      <h2>Cançons</h2>
      <ul class="cards-list">
        <li v-for="song in userSongs" :key="song.id" class="song-card" @click="editarSong(song)">
          <div class="song-image">
            <img :src="song.cover" alt="foto de canción" />
          </div>
          <div class="song-info">
            <strong>{{ song.name }}</strong>
            <p>{{ song.artist }}</p>
          </div>
        </li>
      </ul>
    </div>

    <!-- Playlists -->
    <div v-if="userPlaylists.length" class="section">
      <h2>Playlists</h2>
      <ul class="cards-list">
        <li
          v-for="playlist in userPlaylists"
          :key="playlist.id"
          class="playlist-card"
          @click="router.push({ name: 'addSongPlayList', params: { id: playlist.id } })"
        >
          <div class="playlist-image">
            <img :src="playlist.cover" alt="foto de playlist" />
          </div>
          <div class="playlist-info">
            <strong>{{ playlist.name }}</strong>
          </div>
        </li>
      </ul>
    </div>
  </div>

  <p v-else>Usuari no trobat</p>
</template>
<style scoped>
.user-profile {
  padding: 20px 40px;
  color: white;
  background-color: #121212;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 35px;
  margin-bottom: 40px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.avatar {
  width: 160px;
  height: 160px;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Usuari estil Spotify */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-info h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.followers {
  color: #b3b3b3;
  font-size: 1rem;
}

/* Botó estil Spotify */
.edit-profile-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #ff2d8d;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition:
    transform 0.15s,
    background 0.2s;
}

.edit-profile-btn:hover {
  background-color: #fd59a3;
  transform: scale(1.05);
}

.section {
  margin-top: 30px;
}

.section h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.cards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  list-style: none;
  padding: 0;
}

.song-card,
.playlist-card {
  display: flex;
  flex-direction: column;
  width: 150px;
  background: #181818;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.song-card:hover,
.playlist-card:hover {
  transform: scale(1.05);
}

.song-image img,
.playlist-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.song-info,
.playlist-info {
  padding: 10px;
}

.song-info p,
.playlist-info p {
  color: #aaa;
  margin: 0;
}
</style>
