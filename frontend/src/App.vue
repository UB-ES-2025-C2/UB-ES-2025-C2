<script setup>
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
function onNewPlaylist(){ alert('Crear playlist (placeholder)') }

</script>

<template>
  <header>
    <Header />
  </header>
    <div class="app-shell">
    <div class="app-layout">
      <!-- Targeta que arrodoneix i separa el menú -->
      <aside class="sidebar-card">
        <Sidebar />
      </aside>

      <!-- Targeta per al cos de la pàgina -->
      <main class="main-card">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>/* fons general i padding exterior per crear l'“espai” */
.app-shell{
  min-height: 100dvh;
  background: #000000;          /* fons global fosc */
  padding: 12px;                /* separa el contingut de les vores */
}

/* disposició en 2 columnes amb “gap” (espai entre targetes) */
.app-layout{
  display: grid;
  grid-template-columns: 300px 1fr;  /* sidebar + contingut */
  gap: 12px;                         /* espai entre targetes */
  min-height: calc(100dvh - 24px);   /* resta el padding de .app-shell */
}

/* targeta del menú: arrodonida, amb contorn suau i sticky */
.sidebar-card{
  background: #121214;                         /* color de targeta */
  border: 1px solid #121214 ;                   /* contorn suau */
  border-radius: 12px;                          /* cantonades 👈 */
  overflow: hidden;                             /* retalla interiors */
  position: sticky; top: 12px;                  /* queda enganxat a dalt */
  height: calc(100dvh - 24px);                  /* tota l'alçada visible */
  box-shadow: 0 8px 24px rgba(0,0,0,.25);       /* ombra subtil */
}

/* targeta del cos: arrodonida i amb scroll intern */
.main-card{
  background: #121214;
  border: 1px solid #121214;
  border-radius: 12px;
  overflow: auto;                               /* scroll del contingut */
  padding: 16px;                                /* espai intern */
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
}

/* responsive: el sidebar passa a dalt en pantalles petites */
@media (max-width: 820px){
  .app-layout{
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .sidebar-card{
    position: relative; height: auto; top: 0;
  }
}
</style>


