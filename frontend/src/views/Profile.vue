<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApiStore } from "../apiStore/guestApi.js";
import { useAuthStore } from "@/apiStore/authStore.js";

const route = useRoute();
const user_id = route.params.id;
const api = useApiStore();
const auth = useAuthStore();
// Mockdata de seguidors y seguint
const mockFollowers = 123;
const mockFollowing = 45;

const selectedFile = ref(null);
const previewImage = ref(null);
const fileInput = ref(null);
const followers = ref([]);
const following = ref([]);

const userData = ref(null);
const userSongs = ref([]);
const userPlaylists = ref([]);

async function runUserSongs(id_user) {
  followers.value = await api.getFollowers(id_user);
  following.value = await api.getFollowing(id_user);
  userSongs.value = await api.getUserSongs(id_user);
  userPlaylists.value = await api.getUserPlaylists(id_user);
}


function triggerFileInput() {
  fileInput.value.click();
}

function onFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  selectedFile.value = file;
  //previewImage.value = URL.createObjectURL(file);
  // Aquí pots fer el POST a la teva API per pujar la imatge
  auth.changeProfilePicture(file).then((response) => {
    if (response.status === 200) {
      auth.refreshUserInfo();
      previewImage.value = URL.createObjectURL(file);
    }
  }).catch((error) => {
    console.error("Error uploading profile picture:", error);
  });

}

onMounted(async () => {
  // Primer obtenim les cançons i playlists
  await runUserSongs(user_id);

  // Ara obtenim l'usuari pel seu ID
  const found = await api.getUserById(user_id);

  if (found) {
    userData.value = {
      username: found.nickname,
      followers: followers.value.length,
      following: following.value.length,
      id_user: user_id,
      profile_picture: found.profilePic
    };
  }
});

</script>

<template>
  <div v-if="userData" class="user-profile">
    <!-- Foto i dades -->
    <div class="header">

      <div class="avatar" @click="triggerFileInput">
        <input
          ref="fileInput"
          name="profilePic"
          type="file"
          @change="onFileSelected"
          style="display: none"
        />
        <img
          v-if="previewImage || userData.profile_picture"
          :src="previewImage || userData.profile_picture"
          alt="Profile Picture"
        />
      </div>

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
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
