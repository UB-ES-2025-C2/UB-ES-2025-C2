import { createRouter, createWebHistory } from 'vue-router'
import LogIn from '../views/LogIn.vue'
import SignUp from '../views/SignUp.vue'
import Home from '../views/Home.vue'
import Search from '../views/Search.vue'
import User from '../views/User.vue'
import SongDetailById from '../views/SongDetailById.vue'
import Playlists from '../views/Playlists.vue'
import Profile from '../views/Profile.vue'
import EditProfile from '../views/EditProfile.vue'
import CreateSong from '../views/CreateSong.vue'
import editarSong from '../views/EditSong.vue'

import CreatePlayList from '../views/CreatePlaylist.vue'
import addSongPlayList from '../views/addSongPlayList.vue'

import { useAuthStore } from '../apiStore/authStore'

const routes = [
  {
    path: '/login',
    name: 'logIn',
    component: LogIn,
    meta: { hideChrome: true },
  },
  {
    path: '/SignUp',
    name: 'sign_up',
    component: SignUp,
    meta: { hideChrome: true },
  },
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  { path: '/search', name: 'search', component: Search },
  {
    path: '/user/:username',
    name: 'user',
    component: User,
  },
  {
    path: '/song/:id(\\d+)',
    name: 'song-by-id',
    component: SongDetailById,
    props: true,
  },
  {
    path: '/playlist/:id',
    name: 'playlist',
    component: Playlists,
    props: true,
  },
  {
    path: '/profile/:id',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/profile/edit/:id',
    name: 'edit-profile',
    component: EditProfile,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/createSong',
    name: 'createSong',
    component: CreateSong,
    meta: { requiresAuth: true }
  },
  {
    path: '/editSong/:id',
    name: 'editSong',
    component: editarSong,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/createPlayList',
    name: 'createPlayList',
    component: CreatePlayList,
    meta: { requiresAuth: true }
  },
  {
    path: '/addSongPlayList/:id',
    name: 'addSongPlayList',
    component: addSongPlayList,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initializeAuthStore() // Ensure state is up-to-date
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'catalog' })
  } else {
    next()
  }
})

export default router
