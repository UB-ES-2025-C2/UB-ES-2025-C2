<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../apiStore/authStore'

const router = useRouter()
const authStore = useAuthStore()

// Initialize auth state
onMounted(() => authStore.initializeAuthStore())

// Search state and handler
const q = ref('')
function onSubmit() {
  const term = q.value.trim()
  if (!term) return
  router.push({ path: '/search', query: { q: term } })
}

// Avatar dropdown state and helpers
const menuOpen = ref(false)
const menuRef = ref(null)
const btnRef = ref(null)

const avatarUrl = computed(() => {
  return authStore.isAuthenticated && authStore.avatarUrl
    ? authStore.avatarUrl
    : '/default-avatar.png'
})

const toggleMenu = () => (menuOpen.value = !menuOpen.value)

const onClickOutside = (e) => {
  if (!menuOpen.value) return
  const inMenu = menuRef.value?.contains(e.target)
  const onBtn = btnRef.value?.contains(e.target)
  if (!inMenu && !onBtn) menuOpen.value = false
}

onMounted(() => window.addEventListener('click', onClickOutside))
onBeforeUnmount(() => window.removeEventListener('click', onClickOutside))

// Navigation helpers
const goHome = () => router.push({ name: 'home' })
const goLogin = () => router.push({ name: 'logIn' })
const goSignUp = () => router.push({ name: 'sign_up' })
const goProfile = () => {
  // si no hi ha sessió, porta a login
  if (!authStore?.isAuthenticated) {
    router.push({ name: 'logIn' })
    menuOpen.value = false
    return
  }

  // el teu store a vegades usa user_id; fem un fallback robust
  const id = authStore.user_id ?? authStore.user?.id ?? authStore.user?.username

  if (id == null) {
    // si per algun motiu no tenim id, com a darrer recurs: home
    router.push({ name: 'home' })
  } else {
    // la teva ruta és /profile/:id i props: true
    router.push({ name: 'profile', params: { id: String(id) } })
  }

  menuOpen.value = false
}

// state for modal visibility
const showConfirm = ref(false)

const requestLogout = () => {
  showConfirm.value = true
  menuOpen.value = false
}

const confirmLogout = async () => {
  showConfirm.value = false
  await authStore.logout()
  router.push({ name: 'home' })
}

const cancelLogout = () => {
  showConfirm.value = false
}
</script>

<template>
  <header class="header">
    <!-- Left block -->
    <div class="header-left">
      <img
        src="https://rqlzfndxwaxpiqycxfrg.storage.supabase.co/storage/v1/object/public/archivosmusicspace/logo_musicSpace.png"
        alt="Logo"
        class="logo"
      />

      <!-- Home icon -->
      <button class="home-btn" @click="goHome" aria-label="Go home">
        <img src="../assets/icons/home.svg" alt="Home" class="home-icon" />
      </button>

      <!-- Search bar -->
      <form class="search-bar" @submit.prevent="onSubmit" role="search">
        <i class="fas fa-search search-icon" aria-hidden="true"></i>
        <input
          v-model="q"
          type="search"
          placeholder="Què vols reproduir?"
          aria-label="Cercar"
          data-test="search-input"
        />
      </form>
    </div>

    <!-- Right navigation -->
    <nav class="header-right">
      <!-- Logged OUT -->
      <template v-if="!authStore.isAuthenticated">
        <a href="#" @click.prevent>Assistència</a>
        <span class="divider"></span>
        <a href="/signup" @click.prevent="goSignUp">Registrar-se</a>
        <button class="login-btn" @click="goLogin">Iniciar sessió</button>
      </template>

      <!-- Logged IN -->
      <template v-else>
        <a href="#" @click.prevent>Assistència</a>
        <span class="divider"></span>

        <div class="avatar-wrap">
          <button
            ref="btnRef"
            class="avatar-btn"
            @click="toggleMenu"
            :aria-expanded="menuOpen ? 'true' : 'false'"
            aria-haspopup="menu"
            aria-label="User menu"
          >
            <img :src="avatarUrl" alt="Profile" class="avatar" />
          </button>

          <div v-show="menuOpen" ref="menuRef" class="menu" role="menu" aria-label="User menu">
            <button role="menuitem" class="menu-item" @click="goProfile">El teu perfil</button>
            <hr class="sep" />
            <button role="menuitem" class="menu-item danger" @click="requestLogout">
              Tancar sessió
            </button>
          </div>
        </div>
      </template>
    </nav>
    <!-- Custom confirmation modal -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="cancelLogout">
      <div class="modal">
        <h2>Vols tancar la sessió?</h2>
        <p>Si surts ara, hauràs d'iniciar sessió de nou per accedir al teu compte.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="cancelLogout">Cancel·lar</button>
          <button class="btn-confirm" @click="confirmLogout">Tancar sessió</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  background-color: #000000;
  color: #fff;
  padding: 10px 24px;
  height: 64px;
  font-family: 'Open Sans', sans-serif;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
  height: 64px;
}

.logo {
  width: 54px;
  height: 50px;
}

.home-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #1a1a1a;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.home-icon {
  width: 22px;
  height: 22px;
  color: #ffffff;
  transition: color 0.3s ease;
}
.home-btn:hover {
  background-color: #2a2a2a;
}
.home-btn:hover .home-icon {
  color: #fff;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #1e1e1e;
  border-radius: 30px;
  padding: 6px 14px;
  width: 40%;
  height: 60%;
  max-width: 500px;
}
.search-bar input {
  background: transparent;
  border: none;
  color: #ffffff;
  width: 100%;
  outline: none;
  font-size: 15px;
}
.search-icon {
  color: #aaa;
  margin-right: 10px;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  font-weight: 600;
}
.header-right a {
  text-decoration: none;
  color: #c3c2c2;
  transition: color 0.2s ease;
  font-size: 14px;
}
.header-right a:hover {
  color: #fff;
}
.divider {
  width: 1px;
  height: 20px;
  background-color: #444;
}

.login-btn {
  background-color: #ffffff;
  color: #000;
  border: none;
  border-radius: 30px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s;
}
.login-btn:hover {
  background-color: #e0e0e0;
}

/* avatar + dropdown */
.avatar-wrap {
  position: relative;
}
.avatar-btn {
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  border-radius: 999px;
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: block;
  object-fit: cover;
  background: #121212;
}
.menu {
  position: absolute;
  right: 0;
  margin-top: 8px;
  min-width: 180px;
  background: #0f0f0f;
  border: 1px solid #2e2e2e;
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  z-index: 1000;
}
.menu-item {
  width: 100%;
  text-align: left;
  background: transparent;
  color: #f3f3f3;
  border: 0;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.menu-item:hover {
  background: #1b1b1b;
}
.menu-item.danger {
  color: #ff9bbd;
}
.sep {
  border: 0;
  border-top: 1px solid #2a2a2a;
  margin: 6px 0;
}
/* custom confirmation modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: #111;
  color: #fff;
  border: 1px solid #2e2e2e;
  border-radius: 12px;
  padding: 24px;
  width: 320px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.modal h2 {
  font-size: 1.15rem;
  margin-bottom: 8px;
}

.modal p {
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #333;
  color: #fff;
}
.btn-cancel:hover {
  background: #444;
}

.btn-confirm {
  background: #ff3896;
  color: #fff;
}
.btn-confirm:hover {
  background: #ff5aa8;
}
</style>
