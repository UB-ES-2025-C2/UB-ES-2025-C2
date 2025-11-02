<!-- src/views/Signup.vue (or replace your current file) -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'

const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const password_conf = ref('')
const email = ref('')

const showPassword = ref(false)
const showPasswordConf = ref(false)
const formError = ref('')

onMounted(() => {
  authStore.initializeAuthStore()
})

const startSession = async () => {
  window.location.href = '/Catalog'
}

const goBackToLogin = () => {
  window.location.href = '/login'
}

const mismatch = computed(
  () => !!password.value && !!password_conf.value && password.value !== password_conf.value,
)

const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const authenticateUser = () => {
  formError.value = '' // clear old errors

  if (!username.value || !password.value || !password_conf.value || !email.value) {
    formError.value = "Has d'omplir tots els camps"
    return
  }

  if (!isValidEmail(email.value)) {
    formError.value = 'El correo elctrònic no és vàlid'
    return
  }

  if (password.value !== password_conf.value) {
    formError.value = 'Les contrasenyes no coincideixen'
    return
  }

  authStore.signUp({
    username: username.value,
    password: password.value,
    email: email.value,
    password_conf: password_conf.value,
  })
}

const logOut = () => authStore.logout()
</script>

<template>
  <div class="login-shell">
    <main class="login-card" role="main" aria-labelledby="signup-title">
      <!-- Logo -->
      <div class="logo-wrap">
        <img src="../assets/logo_musicSpace.png" alt="MusicSpace logo" class="logo" />
      </div>

      <h1 id="signup-title" class="title">
        Registra't i gaudeix de totes les funcionalitatss<br />
      </h1>

      <!-- If already authenticated -->
      <section v-if="authStore.isAuthenticated" class="signed-in">
        <p class="muted">You’re logged in.</p>
        <div class="actions">
          <button class="btn btn-primary" @click="startSession">Go to Catalog</button>
          <button class="btn btn-ghost" @click="logOut">Log Out</button>
        </div>
      </section>

      <!-- Sign up form -->
      <form v-else class="form" @submit.prevent="authenticateUser" autocomplete="on" novalidate>
        <label class="label" for="username">Nom d'usuari</label>
        <input
          id="username"
          class="input"
          type="text"
          v-model.trim="username"
          name="username"
          autocomplete="username"
          placeholder="Your username"
          required
        />

        <label class="label" for="email">Correu electrònic</label>
        <input
          id="email"
          class="input"
          type="email"
          v-model.trim="email"
          name="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />

        <label class="label" for="password">Contrasenya</label>
        <div class="password-wrapper">
          <input
            id="password"
            class="input"
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            name="new-password"
            autocomplete="new-password"
            placeholder="Create a password"
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
                d="M12 5C5 5 1 12 1 12s4 7 11 7s11-7 11-7s-4-7-11-7Zm0 11a4 4 0 1 1 0-8a4 4 0 0 1 0 8Z"
              />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="eye-icon">
              <path
                fill="currentColor"
                d="M2 5.27L3.28 4L20 20.72L18.73 22l-2.1-2.1A10.8 10.8 0 0 1 12 19C5 19 1 12 1 12a19 19 0 0 1 4.27-5.73L2 5.27Z"
              />
            </svg>
          </button>
        </div>

        <label class="label" for="password_conf">Confirmació contrasenya</label>
        <div class="password-wrapper">
          <input
            id="password_conf"
            class="input"
            :type="showPasswordConf ? 'text' : 'password'"
            v-model="password_conf"
            name="new-password-confirm"
            autocomplete="new-password"
            placeholder="Repeat your password"
            required
            :aria-invalid="mismatch ? 'true' : 'false'"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPasswordConf = !showPasswordConf"
            :aria-label="showPasswordConf ? 'Hide password' : 'Show password'"
          >
            <svg
              v-if="!showPasswordConf"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="eye-icon"
            >
              <path
                fill="currentColor"
                d="M12 5C5 5 1 12 1 12s4 7 11 7s11-7 11-7s-4-7-11-7Zm0 11a4 4 0 1 1 0-8a4 4 0 0 1 0 8Z"
              />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="eye-icon">
              <path
                fill="currentColor"
                d="M2 5.27L3.28 4L20 20.72L18.73 22l-2.1-2.1A10.8 10.8 0 0 1 12 19C5 19 1 12 1 12a19 19 0 0 1 4.27-5.73L2 5.27Z"
              />
            </svg>
          </button>
        </div>

        <p v-if="mismatch" class="error">Passwords do not match.</p>

        <p v-if="formError" class="form-error">{{ formError }}</p>

        <button class="btn btn-primary" :disabled="authStore.loading || mismatch">
          {{ authStore.loading ? 'Signing Up...' : 'Sign Up' }}
        </button>

        <p v-if="authStore.error" class="error">{{ authStore.error }}</p>

        <p class="register">
          Ja tens un compte?
          <button type="button" class="link" @click="goBackToLogin">Inicia sessió</button>
        </p>
      </form>
    </main>
  </div>
</template>

<style scoped>
/* Theme (same as login) */
:root {
  --bg: #000;
  --text: #ffffff;
  --muted: #b3b3b3;
  --input-bg: #121212;
  --input-border: #ffffff;
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

/* Centered vertical stack */
.login-card {
  width: min(92vw, 420px);
  display: grid;
  justify-items: center;
  gap: 1.1rem;
  text-align: center;
}

/* Logo */
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
  background-color: #121212;
  padding: 10px;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
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
  border-color: var(--input-border);
  box-shadow: none;
  background-color: var(--input-bg);
}
/* Password eye */
.password-wrapper {
  position: relative;
  width: 100%;
}
.password-wrapper .input {
  padding-right: 42px;
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
  filter: brightness(1.05);
}
.btn-primary:active {
  transform: translateY(1px) scale(0.995);
}
.btn-ghost {
  background: transparent;
  color: var(--text);
}
.btn-ghost:hover {
  border-color: #4a4a4a;
}
.btn-ghost.small {
  height: 38px;
  padding: 0 14px;
}

/* Login */
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

/* Inline errors */
.error {
  color: #ff9bbd;
  text-align: left;
}

/* Autofill fixes */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #121212 inset !important;
  -webkit-text-fill-color: #fff !important;
  caret-color: #fff;
  transition: background-color 5000s ease-in-out 0s;
}

/* Accessibility */
:focus-visible {
  outline: 3px solid rgba(255, 45, 141, 0.6);
  outline-offset: 3px;
}

.form-error {
  color: #ff9bbd;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
