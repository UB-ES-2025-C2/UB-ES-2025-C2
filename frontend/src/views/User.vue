<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApiStore } from "../store/guestApi.js";

const route = useRoute();
const username = route.params.username;
const api = useApiStore();

// Mockdata de seguidors y seguint
const mockFollowers = 123;
const mockFollowing = 45;

// Mockdata de cançons
const mockSongs = [
  { id: 1, title: "Canción 1", artists: "Artista A", image: "https://marketplace.canva.com/EAEl_zgUqNo/1/0/1600w/canva-portada-para-album-de-musica-tornasol-y-moderna-tptgzoFo0LQ.jpg" },
  { id: 2, title: "Canción 2", artists: "Artista B", image: "https://www.udiscovermusica.com/wp-content/uploads/sites/7/2022/09/Pink-Floyd-Dark-Side-Of-The-Moon-1536x1536-1-1024x1024.jpeg" }
];

// Mockdata de playlists
const mockPlaylists = [
  { id: 1, name: "Playlist 1", user: "usuarideprova", image: "https://marketplace.canva.com/EAEkDXCwwcE/1/0/1600w/canva-playlist-cover-tipogr%C3%A1fico-de-m%C3%BAsica-pop-rosa-rosa-y-t%C3%ADtulo-grande-tonos-arcoiris-NvXdCHt3cJc.jpg" },
  { id: 2, name: "Playlist 2", user: "usuarideprova", image: "https://marketplace.canva.com/EAGGPj4-B4c/1/0/1600w/canva-portada-para-playlist-deep-house-moderno-violeta-y-rojo-GcfjW55ejVs.jpg" }
];

const userData = ref(null);
const userSongs = ref([]);
const userPlaylists = ref([]);

async function runUserSongs(id_user) {
      userSongs.value = await api.getUserSongs(id_user);
}

onMounted(() => {
  /* Buscar usuari en la API/store per username */
  const foundUser = api.nUsersResult.find(u => u.username === username);

  if (foundUser) {
    userData.value = {
      username: foundUser.username,
      followers: mockFollowers,
      following: mockFollowing,
      id_user: foundUser.id
    };

    /* Assignem cançons y playlists amb mock */
    runUserSongs(userData.value.id_user);
    userPlaylists.value = mockPlaylists; 
  }
});
</script>

<template>
  <div v-if="userData" class="user-profile">
    <!-- Foto i dades -->
    <div class="header">
      <div class="avatar"></div>
      <div class="user-info">
        <h1>{{ userData.username }}</h1>
        <p class="followers">
          Seguidors: {{ userData.followers }} · Seguint: {{ userData.following }}
        </p>
      </div>
    </div>

    <!-- Cançons -->
    <div v-if="userSongs.length" class="section">
      <h2>Cançons</h2>
      <ul class="cards-list">
        <li v-for="song in userSongs" :key="song.id" class="song-card">
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
        <li v-for="playlist in userPlaylists" :key="playlist.id" class="playlist-card">
          <div class="playlist-image">
            <img :src="playlist.image" alt="foto de playlist" />
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

/* Encabezado */
.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.avatar {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #aaa, #aaa);
  border-radius: 50%;
}

.user-info h1 {
  margin: 0;
  font-size: 2rem;
}

.followers {
  color: #aaa;
  font-size: 0.95rem;
  margin-top: 5px;
}

/* Secciones */
.section {
  margin-top: 30px;
}

.section h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

/* Listas de cards */
.cards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.song-card, .playlist-card {
  display: flex;
  flex-direction: column;
  width: 150px;
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.song-card:hover, .playlist-card:hover {
  transform: scale(1.05);
}

.song-image img, .playlist-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.song-info, .playlist-info {
  padding: 10px;
}

.song-info p {
  color: #aaa;
  font-size: 0.85rem;
  margin: 0;
}

.playlist-info p {
  color: #aaa;
  font-size: 0.85rem;
  margin: 0;
}
</style>
