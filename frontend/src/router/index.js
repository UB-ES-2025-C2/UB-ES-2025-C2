import { createRouter, createWebHistory } from "vue-router";
import LogIn from "../views/LogIn.vue";
import SignUp from "../views/SignUp.vue";
import Catalog from "../views/catalog.vue";

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
    name: "catalog",
    component: Catalog,
  }
];

const router = createRouter({
  history: createWebHistory(),
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
