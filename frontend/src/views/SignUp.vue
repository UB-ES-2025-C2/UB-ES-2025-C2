<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/authStore";

const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const password_conf = ref("");
const email = ref("");

onMounted(() => {
  authStore.initializeAuthStore();
});

const startSession = async () => {
  window.location.href = "/Catalog";
};

const goBackToLogin = () => {
  window.location.href = "/";
};

const authenticateUser = () => {
  if (!username.value || !password.value || !password_conf.value || !email.value) {
    alert("Please enter both username and password.");
    return;
  }
  else if(password.value !== password_conf.value) {
    alert("Passwords do not match");
    return;
  }
  authStore.signUp({
    username: username.value,
    password: password.value,
    email: email.value,
    password_conf: password_conf.value
  });
  //authStore.login({ username: username.value, password: password.value });
};

const logOut = () => {
  authStore.logout();
};

</script>

<template>
  <div class="home text-center mt-4">
    <h1>Sign up</h1>

    <div v-if="authStore.isAuthenticated" class="mt-5">
      <div class="mb-3" style="border: 1px solid black;">
  
      </div>
        <h3>You're logged in!</h3>
      <div class="mb-3">
        <!--Access Token: {{ authStore.accessToken.slice(0, 20) }}...-->
      </div>
      <button class="btn btn-primary mr-2" @click="startSession">
        Go to catalog
      </button>
      <button class="btn btn-secondary" @click="logOut">Log Out</button>
    </div>

    <div v-else>
      <h3>Please Sign up to enter</h3>
      <form
          @submit.prevent="authenticateUser"
          class="login-container"
          style="max-width: 300px"
      >
        <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="form-control mb-2"
        />
        <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="form-control mb-2"
        />
        <input
            v-model="password_conf"
            type="password"
            placeholder="password confirmation"
            class="form-control mb-2"
        />
        <input
            v-model="email"
            type="email"
            placeholder="email"
            class="form-control mb-2"
        />
        
        <button class="btn btn-primary w-100" :disabled="authStore.loading">
          {{ authStore.loading ? "Sigging Up..." : "Sign Up" }}
        </button>
        <div v-if="authStore.error" class="text-danger mt-2">
          {{ authStore.error }}
        </div>
        
      </form>
      <div style="text-align: center;">
        <button class="btn btn-primary" @click="goBackToLogin">Log In</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 300px;
  margin: 0 auto;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, #6b73ff, #000dff);
  border-radius: 15px;
  color: white;
  text-align: center;
}
.login-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.75rem;
}

.login-input {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: none;
  outline: none;
  font-size: 1rem;
}
.button-group {
  display: flex;
  gap: 0.5rem; 
}

</style>