<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/authStore";
import "../assets/main.css";
import Header from "../components/Header.vue";
import {useApiStore } from "../store/index.js";

const authStore = useAuthStore();
const apiStore = useApiStore();
onMounted(() => {
  authStore.initializeAuthStore();
  apiStore.fetchCatalog();
});
</script>

<template>
    <h1>Cançons disponibles</h1>
    <ul>
      <li v-for="song in apiStore.songs" :key="song.id">
        <strong>{{ song.name }}</strong> - {{ song.artist }}
        <audio :src="song.file_audio" controls></audio>
      </li>
    </ul>
</template>

<style scoped>
</style>
