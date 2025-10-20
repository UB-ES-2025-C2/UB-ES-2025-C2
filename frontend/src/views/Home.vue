<script setup>
import { ref, onMounted, computed  } from "vue";
import { useAuthStore } from "../store/authStore";
import {useApiStore } from "../store/guestApi.js";

const authStore = useAuthStore();
const apiStore = useApiStore();
const username = ref(""); 

const nusers = ref(""); 

const buscarUsuari = async () => {
  await apiStore.getUser(username.value);
};
const buscarNUsers = async () => {
  await apiStore.searchNUsers(nusers.value);
};

/*mock data para playlists de prueba*/
const mockPlaylists = ref([
  { 
    id: 1, 
    name: "Playlist 1", 
    description: "Playlist d'èxits mundials",
    topic: "Èxits mundials",
    cover: "https://marketplace.canva.com/EAEkDXCwwcE/1/0/1600w/canva-playlist-cover-tipogr%C3%A1fico-de-m%C3%BAsica-pop-rosa-rosa-y-t%C3%ADtulo-grande-tonos-arcoiris-NvXdCHt3cJc.jpg" 
  },
  { 
    id: 2, 
    name: "Playlist 2",
    description: "Playlist de pop",
    topic: "Pop",
    cover: "https://marketplace.canva.com/EAGGPj4-B4c/1/0/1600w/canva-portada-para-playlist-deep-house-moderno-violeta-y-rojo-GcfjW55ejVs.jpg"
  },
  { 
    id: 3,
    name: "Playlist3",
    description: "Playlist de rock",
    topic: "Rock",
    cover: "https://marketplace.canva.com/EAEgRCviBys/1/0/1600w/canva-morado-y-rojo-naranja-est%C3%A9tica-de-tumblr-relajante-ac%C3%BAstico-cl%C3%A1sico-lo-fi-portada-de-lista-de-reproducci%C3%B3n-jE51M26tg2g.jpg"
  }
]);

/* Agrupamos las playlists por topic */
const playlistsByTopic = computed(() => {
  const grouped = {};
  mockPlaylists.value.forEach(pl => {
    const topic = pl.topic || "Sense tema";
    if (!grouped[topic]) grouped[topic] = [];
    grouped[topic].push(pl);
  });
  return grouped;
});

onMounted(() => {
  authStore.initializeAuthStore();
  apiStore.fetchCatalog();
});

// Nombre para la cabecera
const headerUsername = computed(() => {
  if (authStore.username) return authStore.username; // si está logueado
  if (apiStore.nUsersResult.length) return apiStore.nUsersResult[0].username; // primer usuario de la API
  return "Usuari"; // por defecto
});

</script>

<template>
    <section class="home-header">
      <p class="made-for">Fet per a</p>
      <h1 class="username">{{ headerUsername }}</h1>
    </section>

    <!-- Canciones -->
    <h2>Cançons</h2>
    <ul class="cards-list">
      <li v-for="song in apiStore.songs" :key="song.id" class="card">
        <!-- Imagen de la canción -->
        <div class="card-image">
          <img :src="song.cover" alt="Foto de canción"/>
        </div>

        <!-- Info: nombre y artista -->
        <div class="card-info">
          <strong>{{ song.name }}</strong>
          <p>{{ song.artist }}</p>
        </div>

        <!-- Reproductor de audio -->
        <audio :src="song.file_audio" controls class="song-audio"></audio>

        
      </li>
    </ul>

    <!-- Playlists -->
      <h2>Playlists</h2>
      <div v-for="(pls, topic) in playlistsByTopic" :key="topic" class="topic-section">
        <h3>{{ topic }}</h3>
        <ul class="cards-list">
          <li v-for="playlist in pls" :key="playlist.id" class="card">
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

.song-audio {
  width: 100%; 
  border-radius: 4px;
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