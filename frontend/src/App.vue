<script setup>
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
</script>

<template>
  <!-- Minimal layout (no header, no sidebar) -->
  <div v-if="route.meta.hideChrome" class="login-full">
    <router-view />
  </div>

  <!-- Default app layout -->
  <template v-else>
    <header>
      <Header />
    </header>
    <div class="app-shell">
      <div class="app-layout">
        <aside class="sidebar-card">
          <Sidebar />
        </aside>

        <main class="main-card">
          <router-view />
        </main>
      </div>
    </div>
  </template>
</template>

<style scoped>
/* Minimal full-bleed container for auth pages */
.login-full {
  min-height: 100dvh;
  background: #121214; /* match your login page background */
  display: block; /* your Login.vue already centers its contents */
}

/* --- your existing styles (unchanged) --- */
.app-shell {
  min-height: 100dvh;
  background: #000000;
  padding: 12px;
}
.app-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 12px;
  min-height: calc(100dvh - 24px);
}
.sidebar-card {
  background: #121214;
  border: 1px solid #121214;
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 12px;
  height: calc(100dvh - 24px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.main-card {
  background: #121214;
  border: 1px solid #121214;
  border-radius: 12px;
  overflow: auto;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
@media (max-width: 820px) {
  .app-layout {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .sidebar-card {
    position: relative;
    height: auto;
    top: 0;
  }
}
</style>
