import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Header from '../Header.vue'
import { useAuthStore } from '../../apiStore/authStore'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

describe('Header.vue', () => {
  let pinia, store, router

  beforeEach(() => {
    // Creamos Pinia y la activamos
    pinia = createPinia()
    setActivePinia(pinia)

    // Creamos store de autenticación
    store = useAuthStore()

    const Dummy = { template: '<div></div>' } // Component dummy per rutas
    // Configuramos router simulado
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: Dummy },
        { path: '/login', name: 'login', component: Dummy },
      ],
    })
  })

  it('renders correctly', () => {
    const wrapper = mount(Header, {
      global: {
        plugins: [pinia, router],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('shows login button when not authenticated', () => {
    store.isAuthenticated = false // Usuario no logueado

    const wrapper = mount(Header, {
      global: {
        plugins: [pinia, router],
      },
    })

    const loginBtn = wrapper.find('.login-btn')
    expect(loginBtn.exists()).toBe(true)
    expect(loginBtn.text()).toBe('Iniciar sessió')
  })

  it('calls router.push when clicking home button', async () => {
    store.isAuthenticated = false

    const wrapper = mount(Header, {
      global: {
        plugins: [pinia, router],
      },
    })

    const homeBtn = wrapper.find('.home-btn')
    await homeBtn.trigger('click')

    expect(wrapper.vm.$router.currentRoute.value.path).toBe('/')
  })

  it('toggles avatar menu when clicking avatar button (when authenticated)', async () => {
    store.isAuthenticated = true

    const wrapper = mount(Header, {
      global: {
        plugins: [pinia, router],
      },
    })

    const avatarBtn = wrapper.find('.avatar-btn')

    // Inicialmente cerrado
    expect(wrapper.vm.menuOpen).toBe(false)

    // Abrimos menú
    await avatarBtn.trigger('click')
    await nextTick()
    expect(wrapper.vm.menuOpen).toBe(true)

    // Cerramos menú
    await avatarBtn.trigger('click')
    await nextTick()
    expect(wrapper.vm.menuOpen).toBe(false)
  })
})
