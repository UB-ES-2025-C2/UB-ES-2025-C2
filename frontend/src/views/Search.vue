<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApiStore } from "../store";

const route = useRoute();
const router = useRouter();
const api = useApiStore();

const activeTab = ref("users"); // pestanya seleccionada per defecte

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
      <p>(Cerca de cançons encara no implementada)</p>
    </div>

    <div v-if="activeTab === 'playlists'">
      <p>(Cerca de playlists encara no implementada)</p>
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
</style>
