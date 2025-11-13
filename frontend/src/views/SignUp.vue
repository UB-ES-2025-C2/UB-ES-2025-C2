<!-- src/views/Signup.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../apiStore/authStore'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const password_conf = ref('')

const showPassword = ref(false)
const showPasswordConf = ref(false)

const formError = ref('')
const success = ref(false)
const successMessage = ref('')

onMounted(() => {
  authStore.initializeAuthStore?.()
})

const mismatch = computed(
  () => !!password.value && !!password_conf.value && password.value !== password_conf.value,
)

const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

const authenticateUser = async () => {
  formError.value = ''

  if (!username.value || !password.value || !password_conf.value || !email.value) {
    formError.value = "Has d'omplir tots els camps"
    return
  }
  if (!isValidEmail(email.value)) {
    formError.value = 'El correu electrònic no és vàlid'
    return
  }
  if (mismatch.value) {
    formError.value = 'Les contrasenyes no coincideixen'
    return
  }

  await authStore.signUp({
    username: username.value,
    email: email.value,
    password: password.value,
    password_conf: password_conf.value,
  })

  // Xarxa de seguretat per garantir que NO quedem loguejats si el backend envia token:
  if (authStore.isAuthenticated) {
    await (authStore.logout?.() ?? Promise.resolve())
  }

  success.value = true
  successMessage.value = 'El teu usuari s’ha creat correctament. Ara podràs iniciar sessió.'

  // Redirecció suau a la pantalla d'inici de sessió
  setTimeout(() => {
    router.push('/login')
  }, 2000)

}

// Robust error normalizer for signup
function humanizeSignupError(e) {
  // 0) No response (network/CORS)
  if (!e?.response) {
    return 'No es pot connectar amb el servidor. Revisa la connexió o la configuració de CORS.'
  }

  const { status, data } = e.response

  // Utility: collect all strings inside an object/array to search
  const collectStrings = (x, out = []) => {
    if (typeof x === 'string') out.push(x)
    else if (Array.isArray(x)) x.forEach((i) => collectStrings(i, out))
    else if (x && typeof x === 'object') Object.values(x).forEach((v) => collectStrings(v, out))
    return out
  }

  // 1) Common simple shapes
  // string payload
  if (typeof data === 'string') {
    return classifyByContent(data)
  }
  // { detail: "..." }
  if (typeof data?.detail === 'string') {
    return classifyByContent(data.detail)
  }
  // { message: "..." } (Express, Nest…)
  if (typeof data?.message === 'string') {
    return classifyByContent(data.message)
  }

  // 2) Field-based errors
  // DRF style: { email: ["..."], username: ["..."] }
  if (data?.email) {
    const msg = Array.isArray(data.email) ? data.email[0] : data.email
    return preferEmailMessage(msg)
  }
  if (data?.username) {
    const msg = Array.isArray(data.username) ? data.username[0] : data.username
    if (looksLikeExists(msg)) return "Aquest nom d'usuari ja existeix."
  }

  // FastAPI validation: { detail: [ { loc: [...,'email'], msg: "..." }, ... ] }
  if (Array.isArray(data?.detail)) {
    const emailItem = data.detail.find((it) =>
      JSON.stringify(it.loc || [])
        .toLowerCase()
        .includes('email'),
    )
    if (emailItem?.msg) return preferEmailMessage(emailItem.msg)
    if (data.detail[0]?.msg) return data.detail[0].msg
  }

  // 3) Nested error containers
  // { errors: { email: "..." } } or { error: { email: ["..."] } }
  if (data?.errors?.email) return preferEmailMessage(data.errors.email)
  if (data?.error?.email) return preferEmailMessage(data.error.email)

  // { errors: [ { field: 'email', message: '...' } ] }
  if (Array.isArray(data?.errors)) {
    const eItem = data.errors.find((it) => (it.field || '').toLowerCase() === 'email')
    if (eItem?.message) return preferEmailMessage(eItem.message)
  }

  // 4) Database-specific messages
  // Prisma P2002 unique constraint
  if (data?.code === 'P2002' || data?.errorCode === 'P2002') {
    const metaTarget = (data?.meta?.target || []).join(',').toLowerCase()
    if (metaTarget.includes('email')) return 'Aquest correu electrònic ja està registrat.'
    return 'Ja existeix un registre duplicat.'
  }

  // Mongo duplicate key (E11000)
  // e.g., { message: 'E11000 duplicate key error collection ... dup key: { email: "x@x.com" }' }
  const all = collectStrings(data).join(' ').toLowerCase()
  if (all.includes('e11000') || all.includes('duplicate key')) {
    if (all.includes('email')) return 'Aquest correu electrònic ja està registrat.'
    return 'Ja existeix un registre duplicat.'
  }

  // 5) Fallback by HTTP status
  if (status === 409) return 'Ja existeix un compte amb aquestes dades.'
  if (status === 400) return 'Dades invàlides en el formulari.'
  return 'Error en el registre.'

  // ---- helpers ----
  function looksLikeExists(s = '') {
    const t = String(s).toLowerCase()
    // multilingual/variants for "already used/taken/existing/registered"
    return /(exist|taken|used|in use|registered|duplicate|duplicat|ocupad|utilitzat|ya existe|registrad)/.test(
      t,
    )
  }
  function preferEmailMessage(msg) {
    return looksLikeExists(msg)
      ? 'Aquest correu electrònic ja està registrat.'
      : typeof msg === 'string'
        ? msg
        : 'Problema amb el correu electrònic.'
  }
  function classifyByContent(s) {
    const t = String(s).toLowerCase()
    if (t.includes('email')) {
      return looksLikeExists(t)
        ? 'Aquest correu electrònic ja està registrat.'
        : s || 'Problema amb el correu electrònic.'
    }
    if (t.includes('username') || t.includes('user name') || t.includes("nom d'usuari")) {
      return looksLikeExists(t)
        ? "Aquest nom d'usuari ja existeix."
        : s || "Problema amb el nom d'usuari."
    }
    if (looksLikeExists(t)) return 'Ja existeix un compte amb aquestes dades.'
    return s || 'Error en el registre.'
  }
}

const goBackToLogin = () => router.push('/login')
</script>

<template>
  <div class="login-shell">
    <main class="login-card" role="main" aria-labelledby="signup-title">
      <!-- Logo -->
      <div class="logo-wrap">
        <img src="../assets/logo_musicSpace.png" alt="MusicSpace logo" class="logo" />
      </div>

      <h1 id="signup-title" class="title">Registra't i gaudeix de totes les funcionalitats</h1>

      <section v-if="success" class="signed-in" aria-live="polite">
        <p class="success">{{ successMessage }}</p>
      </section>

      <!-- Formulari de registre (sempre mostra; si ja està loguejat es redirigeix a onMounted) -->
      <form class="form" @submit.prevent="authenticateUser" autocomplete="on" novalidate>
        <label class="label" for="username">Nom d'usuari</label>
        <input
          id="username"
          class="input"
          type="text"
          v-model.trim="username"
          name="username"
          autocomplete="username"
          placeholder="El teu nom d'usuari"
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
          placeholder="tu@exemple.com"
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
            placeholder="Crea una contrasenya"
            required
            aria-describedby="passwordHelp"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Amaga la contrasenya' : 'Mostra la contrasenya'"
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

        <label class="label" for="password_conf">Confirmació de la contrasenya</label>
        <div class="password-wrapper">
          <input
            id="password_conf"
            class="input"
            :type="showPasswordConf ? 'text' : 'password'"
            v-model="password_conf"
            name="new-password-confirm"
            autocomplete="new-password"
            placeholder="Repeteix la contrasenya"
            required
            :aria-invalid="mismatch ? 'true' : 'false'"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPasswordConf = !showPasswordConf"
            :aria-label="showPasswordConf ? 'Amaga la confirmació' : 'Mostra la confirmació'"
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

        <p v-if="mismatch" class="error" role="alert">Les contrasenyes no coincideixen.</p>
        <p v-if="formError" class="form-error" role="alert" aria-live="assertive">
          {{ formError }}
        </p>

        <button class="btn btn-primary" :disabled="authStore.loading || mismatch">
          {{ authStore.loading ? 'Registrant...' : "Registra't" }}
        </button>

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

/* Signed-in state placeholder */
.signed-in {
  width: 100%;
}
.muted {
  color: var(--muted);
  margin-bottom: 0.5rem;
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

/* Login link */
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

/* Errors / success */
.error,
.form-error {
  color: #ff9bbd;
  text-align: left;
}
.form-error {
  text-align: center;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
.success {
  color: #6aff6a;
  font-weight: 600;
  text-align: center;
  margin-top: 0.75rem;
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
</style>
