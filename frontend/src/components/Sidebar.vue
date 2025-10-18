<template>
  <aside class="sidebar">
    
    <!-- Biblioteca -->
    <section class="library">
    <header class="lib-header">
        <div class="left">
        <span class="ico" v-html="icons.library"></span>
        <span class="label">La teva biblioteca</span>
        </div>
        <button class="icon-btn" aria-label="Nova llista" @click="$emit('new-playlist')">
        <span class="ico" v-html="icons.plus"></span>
        </button>
    </header>

     <!-- ▲ NOU contenidor més clar -->
    <div class="library-panel">
        <div class="cta">
        <h3>Crea la teva primera llista</h3>
        <button class="pill" @click="$emit('new-playlist')">Crear llista</button>
        </div>
    </div>
    </section>


    <!-- Peu amb enllaços -->
    <footer class="footer">
      <ul class="links">
        <li v-for="l in footerLinks" :key="l.text">
          <a :href="l.href" target="_blank" rel="noopener">{{ l.text }}</a>
        </li>
      </ul>
    </footer>
  </aside>
</template>

<script setup>
import { useRoute, RouterLink } from 'vue-router'
const route = useRoute()

/* SVGs inline (sense dependències) */
const icons = {
  home: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9.75 12 3l9 6.75V21a.75.75 0 0 1-.75.75h-5.25V14.25h-6V21.75H3.75A.75.75 0 0 1 3 21V9.75z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/></svg>`,
  library: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h2v16H6zM10 4h2v16h-2zM14 4h6v2h-4v14h-2z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>`,
  globe:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-1 17.93A8.001 8.001 0 0 1 4.07 13H7c.55 0 1 .45 1 1v3c0 .74 1 1 1 1h2v1.93Zm0-3.93H9s-1 0-1-1v-2c0-.55-.45-1-1-1H4.07A8.001 8.001 0 0 1 11 4.07V7c0 .55.45 1 1 1h2s1 0 1 1v1c0 .55-.45 1-1 1h-2c-.55 0-1 .45-1 1v3Zm3 3.58V17c0-.55.45-1 1-1h2c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1V9c0-.55-.45-1-1-1h-1V4.07A8.001 8.001 0 0 1 19.93 11H19c-.55 0-1 .45-1 1v3c0 .55-.45 1-1 1h-1c-.55 0-1 .45-1 1v1.58Z"/></svg>`
}

/* Links de dalt (Home / Cercar) */
const topLinks = [
  { to: '/',        label: 'Inici',       svg: icons.home },
  { to: '/buscar',  label: 'Cercar',      svg: icons.search }
]

/* Links del footer */
const footerLinks = [
  { text: 'Legal', href: '#' },
  { text: 'Centre de seguretat i privacitat', href: '#' },
  { text: 'Política de privacitat', href: '#' },
  { text: 'Configuració de cookies', href: '#' },
  { text: 'Informació sobre els anuncis', href: '#' },
  { text: 'Accessibilitat', href: '#' },
  { text: 'Cookies', href: '#' },
]
</script>

<style scoped>
:root{
  --accent: #fc5dba;
  --panel: #ff3896;
  --panel-2: #ff3896;
  --text:  #ff3896;
  --muted: #b9b8bf;
  --border:#2a2a31;
}

/* Layout columna */
.sidebar{
  display:flex; flex-direction:column;
  width: 300px; min-width: 260px; max-width: 340px;
  min-height: 100dvh;
  padding: 12px;
  background: #121214   ;
  border-right: 1px solid var(--border);
  color: var(--text);
}

/* Nav superior */
.top{
  display:flex; flex-direction:column; gap: 6px;
  padding: 8px; background: var(--panel); border-radius: 12px;
}
.navlink{
  display:flex; align-items:center; gap:12px;
  padding: 10px 12px; border-radius: 8px;
  color: var(--muted); text-decoration:none; font-weight: 700;
}
.navlink .ico{ width:22px; height:22px; color: var(--muted); }
.navlink:hover{ background: var(--panel-2); color: var(--text); }
.navlink.active{ background: var(--panel-2); color: var(--text); }
.navlink.active .ico{ color: var(--accent); }

/* Biblioteca */
.library{
  margin-top: 10px; padding: 10px; background: var(--panel); border-radius: 12px;
  display:flex; flex-direction:column; gap: 10px; 
}
.lib-header{ display:flex; align-items:center; justify-content:space-between; }
.lib-header .left{ display:flex; align-items:center; gap:10px; color: var(--muted); font-weight:800; }
.lib-header .ico{ width:22px; height:22px; color: var(--muted); }
.icon-btn{ background: transparent; border: none; padding: 6px; border-radius: 8px; cursor: pointer; color: var(--muted); }
.icon-btn:hover{ background: var(--panel-2); color: var(--text); }
/* el contenidor intern amb fons més clar */
.library .library-panel{
  background: linear-gradient(180deg, #1f1f21 0%, #19191b 100%);
  border: 1px solid #19191b;
  border-radius: 10px;
  padding: 12px;
}

/* IMPORTANT: el .cta ja no ha de pintar el seu propi “card” fosc */
.library .library-panel .cta{
  background: transparent;
  border: 0;
  padding: 0;
}
/* Targeta CTA */
.cta{
  margin-top: 4px;
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: 12px; padding: 16px;
}
.cta h3{ margin:0 0 6px; font-size: 15px; color: var(--text); }
.cta p { margin:0 0 12px; color: var(--muted); }
.pill{
  padding: 8px 14px; border-radius:999px; border:none; cursor:pointer;
  font-weight:800; background: #ffffff; color:#121214;
}
.pill:hover{ opacity:.92; }

/* Footer */
.footer{
  margin-top: auto;
  padding: 8px; background: var(--panel); border-radius: 12px;
}
.links{
  display:flex; flex-wrap:wrap; gap:10px 16px; list-style:none; padding:0; margin:0 0 12px;
}
.links a{ color: var(--muted); font-size: 12px; text-decoration:none; }
.links a:hover{ color: var(--text); }

.lang{
  display:inline-flex; align-items:center; gap:8px;
  padding: 8px 14px; border-radius:999px;
  background: transparent; color: var(--text);
  border: 1px solid var(--border); cursor:pointer;
}
.lang:hover{ border-color: var(--text); }
.lang .globe{ width:18px; height:18px; color: var(--text); }

/* Accents */
.navlink.active .label{ color: var(--text); }
.navlink.active .ico{ color: var(--accent); }

</style>
