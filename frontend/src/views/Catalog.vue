<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/authStore";
import "../assets/main.css";
import Header from "../components/Header.vue";
import {useApiStore } from "../store/index.js";

const authStore = useAuthStore();
const apiStore = useApiStore();
const username = ref(""); 

const nusers = ref(""); 
onMounted(() => {
  authStore.initializeAuthStore();
  apiStore.fetchCatalog();
});

const buscarUsuari = async () => {
  await apiStore.getUser(username.value);
};
const buscarNUsers = async () => {
  await apiStore.searchNUsers(nusers.value);
};

</script>

<template>
    <h1>Cançons disponibles</h1>
    <ul>
      <li v-for="song in apiStore.songs" :key="song.id">
        <strong>{{ song.name }}</strong> - {{ song.artist }}
        <audio :src="song.file_audio" controls></audio>
      </li>
    </ul>
    <h2>Buscar Usuari per Nom</h2>
      <input type="text" placeholder="Escriu un nom..." v-model="username" />
      <button @click="buscarUsuari">Buscar</button>
    <pre id="resultat">{{ apiStore.userResult }}</pre>
    
    <h2>Buscar N Usuari per Nom</h2>
      <input type="text" placeholder="Escriu un nom..." v-model="nusers" />
      <button @click="buscarNUsers">Buscar</button>
    <pre id="resultatNUsers">{{ apiStore.nUsersResult }}</pre>
</template>

<style scoped>
</style>
