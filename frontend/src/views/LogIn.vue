<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
// keep your global CSS import if needed
// import "../assets/css/main.css";

const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

onMounted(() => {
  authStore.initializeAuthStore()
})

const startSession = async () => {
  window.location.href = '/'
}

const SignUp = () => {
  window.location.href = '/SignUp'
}

const authenticateUser = () => {
  if (!username.value || !password.value) {
    alert('Please enter both username and password.')
    return
  }
  authStore.login({ username: username.value, password: password.value })
}

const logOut = () => {
  authStore.logout()
}
</script>

<template>
  <div class="login-shell">
    <main class="login-card" role="main" aria-labelledby="login-title">
      <!-- Inside your <template> -->
      <div class="logo-wrap">
        <img src="../assets/logo_musicSpace.png" alt="MusicSpace logo" class="logo" />
      </div>

      <h1 id="login-title" class="title">Inicia sessió a<br />MusicSpace</h1>

      <!-- If already authenticated -->
      <section v-if="authStore.isAuthenticated" class="signed-in">
        <p class="muted">You’re logged in.</p>
        <div class="actions">
          <button class="btn btn-primary" @click="startSession">Go to Catalog</button>
          <button class="btn btn-ghost" @click="logOut">Log Out</button>
        </div>
      </section>

      <!-- Login form -->
      <form v-else class="form" @submit.prevent="authenticateUser" autocomplete="off">
        <label class="label" for="identifier">Correu electrònic o nom d'usuari</label>
        <input
          id="identifier"
          class="input"
          type="text"
          v-model.trim="username"
          placeholder="e.g. user@example.com"
          required
        />

        <label class="label" for="password">Password</label>
        <div class="password-wrapper">
          <input
            id="password"
            class="input"
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Your password"
            required
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="eye-icon"
            >
              <path
                fill="currentColor"
                d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 11a4 4 0 1 1 0-8a4 4 0 0 1 0 8Z"
              />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="eye-icon">
              <path
                fill="currentColor"
                d="M2 5.27L3.28 4L20 20.72L18.73 22l-2.1-2.1A10.8 10.8 0 0 1 12 19c-7 0-11-7-11-7a19 19 0 0 1 4.27-5.73L2 5.27ZM12 7a4 4 0 0 1 4 4a4 4 0 0 1-.4 1.73l-1.54-1.54A2 2 0 0 0 12 9a2 2 0 0 0-1.19.39L9.27 7.85A4 4 0 0 1 12 7Zm0 10a9 9 0 0 0 4.56-1.2L14 14.24a4 4 0 0 1-5.39-5.39L5.2 5.88A19 19 0 0 0 1 12s4 7 11 7Z"
              />
            </svg>
          </button>
        </div>

        <button class="btn btn-primary" :disabled="authStore.loading">
          {{ authStore.loading ? 'Logging in...' : 'Iniciar Sessió' }}
        </button>

        <p v-if="authStore.error" class="error">{{ authStore.error }}</p>

        <p class="register">
          No tens un compte?
          <button type="button" class="link" @click="SignUp">Registra’t</button>
        </p>
      </form>
    </main>
  </div>
</template>

<style scoped>
/* Theme */
:root {
  --bg: #000;
  --card-bg: transparent;
  --text: #ffffff;
  --muted: #b3b3b3;
  --input-bg: #121212;
  --input-border: #2a2a2a;
  --accent: #ff2d8d;
  --accent-shadow: rgba(255, 45, 141, 0.35);
}

/* Canvas */
.login-shell {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  background: var(--bg);
  color: var(--text);
  font-family:
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    'Apple Color Emoji',
    'Segoe UI Emoji';
}

/* Centered vertical stack (no visible card border) */
.login-card {
  width: min(92vw, 420px);
  display: grid;
  justify-items: center;
  gap: 1.1rem;
  text-align: center;
}
.logo-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
}

.logo {
  width: 102px;
  height: 100px;
  border-radius: 50%;
  background-color: #121212; /* optional pink background */
  padding: 10px; /* optional space around image */
}

/* Title */
.title {
  font-weight: 800;
  line-height: 1.15;
  margin: 0.25rem 0 0.5rem;
  letter-spacing: 0.2px;
  font-size: clamp(1.35rem, 1.15rem + 1vw, 1.8rem);
}

/* Signed-in state */
.signed-in {
  width: 100%;
}
.muted {
  color: var(--muted);
  margin-bottom: 0.75rem;
}

.actions {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.75rem;
  width: 100%;
  align-items: stretch;
}
.actions .btn {
  width: 100%;
}
/* Form */
.form {
  width: 100%;
  display: grid;
  gap: 0.75rem;
}
.label {
  text-align: left;
  font-size: 0.875rem;
  color: var(--muted);
  font-weight: 600;
}
.input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid white;
  background: var(--input-bg);
  color: var(--text);
  outline: none;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}
.input::placeholder {
  color: #8a8a8a;
}
.input:focus {
  border-color: #fff; /* keep the same white border */
  box-shadow: none; /* remove glow if you had one */
  background-color: #121212; /* fixed background */
}
.password-wrapper {
  position: relative;
  width: 100%;
}

.password-wrapper .input {
  padding-right: 42px; /* space for the eye icon */
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #fff;
}

.eye-icon {
  width: 20px;
  height: 20px;
}

/* Buttons */
.btn {
  display: inline-grid;
  place-items: center;
  border: 0;
  height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 80ms ease,
    filter 120ms ease,
    box-shadow 120ms ease;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-primary {
  margin-top: 22px;
  width: 100%;
  background: #ff3896;
  color: #fff;
  border: none;
  border-radius: 999px;
  font-weight: 700;
  transition:
    filter 0.2s ease,
    transform 0.1s ease;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:not(:disabled):hover {
  filter: brightness(1.05);
}
.btn-primary:not(:disabled):active {
  transform: translateY(1px) scale(0.995);
}
.btn-ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid #2e2e2e;
}
.btn-ghost:hover {
  border-color: #4a4a4a;
}

/* Register */
.register {
  margin-top: 0.4rem;
  font-size: 0.95rem;
  color: #bdbdbd;
}
.link {
  background: none;
  border: none;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  padding: 0 2px;
}
.link:hover {
  border-color: #fff;
}

/* Errors */
.error {
  color: #ff9bbd;
  text-align: left;
}

/* Accessibility */
:focus-visible {
  outline: 3px solid rgba(255, 45, 141, 0.6);
  outline-offset: 3px;
}

</style>
