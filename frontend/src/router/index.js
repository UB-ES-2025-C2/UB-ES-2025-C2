import { createRouter, createWebHistory } from "vue-router";
import LogIn from "../views/LogIn.vue";
import SignUp from "../views/SignUp.vue";
import Home from "../views/Home.vue";
import Search from "../views/Search.vue";
import User from "../views/User.vue";

import { useAuthStore } from "../store/authStore";

const routes = [
  {
    path: "/login",
    name: "logIn",
    component: LogIn,
  },
  {
    path: "/SignUp",
    name: "sign_up",
    component: SignUp,
  },
    {
    path: "/",
    name: "home",
    component: Home,
  },
  { path: '/search', 
    name: "search",
    component: Search },
  {
    path: "/user/:username",
    name: "user",
    component: User,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.initializeAuthStore(); // Ensure state is up-to-date

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "catalog" });
  } else {
    next();
  }
});

export default router;
