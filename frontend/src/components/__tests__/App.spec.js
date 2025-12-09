// src/components/__tests__/App.spec.js
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../../App.vue'

// Definimos rutas dummy
const routes = [{ path: '/', component: { template: '<div>Home</div>' } }]

// Creamos router de prueba
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Forzamos la ruta para el test del layout minimal
router.push('/') // ruta inicial
router.isReady() // esperar a que el router esté listo

describe('App.vue', () => {
  it('mounts properly with default layout', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: ['Header', 'Sidebar', 'PlayerBar', 'router-view'],
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders minimal layout if route.meta.hideChrome is true', async () => {
    // Creamos un router con meta.hideChrome
    const routesWithMeta = [
      { path: '/', component: { template: '<div>Home</div>' }, meta: { hideChrome: true } },
    ]
    const routerMeta = createRouter({
      history: createWebHistory(),
      routes: routesWithMeta,
    })
    routerMeta.push('/')
    await routerMeta.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [routerMeta],
        stubs: ['Header', 'Sidebar', 'PlayerBar', 'router-view'],
      },
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.login-full').exists()).toBe(true)
  })
})
