<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApiStore } from "../store";

const route = useRoute();
const router = useRouter();
const api = useApiStore();

const activeTab = ref("users"); // pestanya seleccionada per defecte

/*mock data fins tenir backend*/
const mockSongs = ref([
  { id: 1, title: "Canción de prueba 1", artists: "Artista 1", image: "https://marketplace.canva.com/EAEl_zgUqNo/1/0/1600w/canva-portada-para-album-de-musica-tornasol-y-moderna-tptgzoFo0LQ.jpg" },
  { id: 2, title: "Canción de prueba 2", artists: "Artista 2", image: "https://www.udiscovermusica.com/wp-content/uploads/sites/7/2022/09/Pink-Floyd-Dark-Side-Of-The-Moon-1536x1536-1-1024x1024.jpeg" },
  { id: 3, title: "Canción de prueba 3", artists: "Artista 3", image: "https://marketplace.canva.com/EAGL6BH8Rhg/1/0/1600w/canva-portada-%C3%A1lbum-m%C3%BAsica-moderno-qMT-zlb07JY.jpg" },
]);

const mockPlaylists = ref([
  { id: 1, name: "Playlist de prueba 1", user: "usuarideprova", image: "https://marketplace.canva.com/EAEkDXCwwcE/1/0/1600w/canva-playlist-cover-tipogr%C3%A1fico-de-m%C3%BAsica-pop-rosa-rosa-y-t%C3%ADtulo-grande-tonos-arcoiris-NvXdCHt3cJc.jpg" },
  { id: 2, name: "Playlist de prueba 2", user: "usuarideprova", image: "https://marketplace.canva.com/EAGGPj4-B4c/1/0/1600w/canva-portada-para-playlist-deep-house-moderno-violeta-y-rojo-GcfjW55ejVs.jpg" },
  { id: 3, name: "Playlist de prueba 3", user: "usuarideprova", image: "https://marketplace.canva.com/EAEgRCviBys/1/0/1600w/canva-morado-y-rojo-naranja-est%C3%A9tica-de-tumblr-relajante-ac%C3%BAstico-cl%C3%A1sico-lo-fi-portada-de-lista-de-reproducci%C3%B3n-jE51M26tg2g.jpg" },
]);


async function runSearch() {
  const q = (route.query.q || "").toString().trim();
  if (!q) {
    api.nUsersResult = [];
    return;
  }
  if (activeTab.value === "users" || activeTab.value === "all") {
    await api.searchNUsers(q);
  }
}

function setTab(tab) {
  activeTab.value = tab;
  router.replace({ path: "/search", query: { q: route.query.q, tab } });
  runSearch();
}

onMounted(runSearch);
watch(() => route.query.q, runSearch);
</script>

<template>
  <section class="search-page">
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'all' }"
        @click="setTab('all')"
      >
        Tot
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'users' }"
        @click="setTab('users')"
      >
        Usuaris
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'songs' }"
        @click="setTab('songs')"
      >
        Cançons
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'playlists' }"
        @click="setTab('playlists')"
      >
        Playlists
      </button>
    </div>

    <div v-if="activeTab === 'users' || activeTab === 'all'">
      <ul v-if="api.nUsersResult?.length" class="results-list">
        <li
          v-for="user in api.nUsersResult"
          :key="user.id || user.username"
          class="user-card"
        >
          <div class="avatar"></div>
          <div class="user-info">
            <strong>{{ user.username }}</strong>
            <p>{{ user.email || 'Usuari registrat' }}</p>
          </div>
        </li>
      </ul>
      <p v-else>Sense resultats.</p>
    </div>

    <div v-if="activeTab === 'songs'">
      <ul v-if="mockSongs.length" class="results-list">
        <li v-for="song in mockSongs" :key="song.id" class="song-card">
          <div class="song-image">
            <img :src="song.image" alt="foto de canción" />
          </div>
          <div class="song-info">
            <strong>{{ song.title }}</strong>
            <p>{{ song.artists }}</p>
          </div>
        </li>
      </ul>
      <p v-else>No hi ha cançons.</p>
    </div>

    <div v-if="activeTab === 'playlists'">
      <ul v-if="mockPlaylists.length" class="results-list">
        <li v-for="playlist in mockPlaylists" :key="playlist.id" class="playlist-card">
          <div class="playlist-image">
            <img :src="playlist.image" alt="foto de playlist" />
          </div>
          <div class="playlist-info">
            <strong>{{ playlist.name }}</strong>
            <p>De {{ playlist.user }}</p>
          </div>
        </li>
      </ul>
      <p v-else>No hi ha playlists.</p>
    </div>

  </section>
</template>

<style scoped>
.search-page {
  padding: 20px 40px;  
  color: white;
  background-color: #121212;
  min-height: 100vh;
}

/* pestanyes (etiquetes) */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab {
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #1a1a1a;
  color: #aaa;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
}

.tab.active {
  background-color: #ff3896;
  color: #000;
}

/* resultats */
.results-list {
  list-style: none;
  padding-left: 0;   /* <- el que treu el “salt” a l'esquerra */
  margin-left: 0;
  margin-top: 0;
  width: 100%;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #1e1e1e;
  border-radius: 12px;
  padding: 10px 15px;
  margin-bottom: 10px;
  margin-left: 0;
}

.avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #aaa, #aaa);
  border-radius: 50%;
}

.user-info p {
  color: #aaa;
  font-size: 0.9rem;
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
  object-fit: cover; /* hace la foto cuadrada, no redonda */
  border-radius: 4px; /* puedes ajustar a 0 si quieres completamente cuadrado */
}

.song-info p {
  color: #aaa;
  font-size: 0.9rem;
  margin: 0;
}

.playlist-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #1e1e1e;
  border-radius: 12px;
  padding: 10px 15px;
  margin-bottom: 10px;
}

.playlist-image img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.playlist-info p {
  color: #aaa;
  font-size: 0.9rem;
  margin: 0;
}


</style>
