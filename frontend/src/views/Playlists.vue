<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const playlistId = route.params.id;

// Mock data para otros campos
const mockOwner = "usuarideprova";
const mockSavedTimes = 123;
const mockSongsCount = 5;
const mockSongs = ref([
  { id: 1, name: "Canción 1", artist: "Artista A", cover: "https://marketplace.canva.com/EAEl_zgUqNo/1/0/1600w/canva-portada-para-album-de-musica-tornasol-y-moderna-tptgzoFo0LQ.jpg" },
  { id: 2, name: "Canción 2", artist: "Artista B", cover: "https://www.udiscovermusica.com/wp-content/uploads/sites/7/2022/09/Pink-Floyd-Dark-Side-Of-The-Moon-1536x1536-1-1024x1024.jpeg" },
  { id: 3, name: "Canción 3", artist: "Artista C", cover: "https://marketplace.canva.com/EAGL6BH8Rhg/1/0/1600w/canva-portada-%C3%A1lbum-m%C3%BAsica-moderno-qMT-zlb07JY.jpg" },
]);

// Mock playlists para simular búsqueda por id
const mockPlaylists = [
  {
    id: 1,
    name: "Playlist1",
    description: "playlist d'èxits mundials",
    topic: "Èxits mundials",
    cover: "http://127.0.0.1:8000/covers/default.png",
  },
  {
    id: 2,
    name: "Playlist2",
    description: "playlist d'èxits indie",
    topic: "Indie",
    cover: "http://127.0.0.1:8000/covers/default.png",
  },
];

const playlistData = ref(null);

onMounted(() => {
  playlistData.value = mockPlaylists.find(p => p.id == playlistId);
});
</script>

<template>
  <section v-if="playlistData" class="playlist-page">
    <!-- Header tipo Spotify -->
    <div class="playlist-header">
      <div class="playlist-cover">
        <img :src="playlistData.cover" alt="cover playlist" />
      </div>
      <div class="playlist-info">
        <h1>{{ playlistData.name }}</h1>
        <p class="playlist-description">{{ playlistData.description }}</p>
        <p></p>
        <p>Creada per {{ mockOwner }} • Guardada {{ mockSavedTimes }} veces • {{ mockSongsCount }} canciones</p>
      </div>
    </div>

    <!-- Canciones -->
    <div class="playlist-songs">
      <ul>
        <li v-for="song in mockSongs" :key="song.id" class="song-card">
          <div class="song-image">
            <img :src="song.cover" alt="cover canción" />
          </div>
          <div class="song-info">
            <strong>{{ song.name }}</strong>
            <p>{{ song.artist }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>

  <p v-else>Playlist no encontrada</p>
</template>

<style scoped>
.playlist-page {
  padding: 20px 40px;
  color: white;
  background-color: #121212;
  min-height: 100vh;
}

/* Header estilo Spotify */
.playlist-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.playlist-cover img {
  width: 200px;
  height: 200px;
  object-fit: cover; /* cuadrado, no redondo */
  border-radius: 8px;
}

.playlist-info h1 {
  font-size: 2rem;
  margin: 0 0 10px 0;
}

.playlist-info p {
  margin: 5px 0;
  color: #aaa;
}

/* Canciones */
.playlist-songs ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.song-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #1e1e1e;
  border-radius: 12px;
  padding: 10px 15px;
  margin-bottom: 10px;
}

.song-image img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.song-info p {
  color: #aaa;
  font-size: 0.9rem;
  margin: 0;
}
</style>
