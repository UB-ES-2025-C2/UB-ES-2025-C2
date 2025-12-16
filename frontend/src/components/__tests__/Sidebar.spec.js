import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'
import Sidebar from '../Sidebar.vue'
import { useAuthStore } from '@/apiStore/authStore'

// Mock correcto de router con default
vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}))

import router from '@/router'

describe('Sidebar.vue', () => {
  let wrapper, authStore

  beforeEach(() => {
    wrapper = mount(Sidebar, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            auth: { isAuthenticated: false }
          },
          stubActions: false
        })]
      }
    })

    authStore = useAuthStore()
  })

  it('renders library section and footer links', () => {
    expect(wrapper.find('.library').exists()).toBe(true)
    expect(wrapper.find('.lib-header .label').text()).toBe('La teva biblioteca')
    expect(wrapper.findAll('.footer .links li').length).toBe(wrapper.vm.footerLinks.length)
  })

  it('emits "new-playlist" when plus button is clicked', async () => {
    const btn = wrapper.find('button[aria-label="Nova llista"]')
    await btn.trigger('click')
    expect(wrapper.emitted('new-playlist')).toBeTruthy()
  })

  it('redirects to login if user not authenticated and clicks "Pujar Cançó"', async () => {
    authStore.isAuthenticated = false
    await wrapper.vm.$nextTick()

    // Llamamos al método directamente
    wrapper.vm.openCreateSongModal()
    expect(router.push).toHaveBeenCalledWith({ name: 'logIn' })
  })

  it('redirects to createSong if user is authenticated', async () => {
    authStore.isAuthenticated = true
    await wrapper.vm.$nextTick()

    const btn = wrapper.find('.create-song')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')

    expect(router.push).toHaveBeenCalledWith({ name: 'createSong' })
  })

  it('redirects to createSong if user is authenticated', async () => {
    authStore.isAuthenticated = true
    await wrapper.vm.$nextTick()
    const btn = wrapper.find('.create-song')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(router.push).toHaveBeenCalledWith({ name: 'createSong' })
  })

  it('redirects to createPlayList correctly based on authentication', async () => {
    // Caso no autenticado
    authStore.isAuthenticated = false
    await wrapper.vm.$nextTick()

    let btn = wrapper.find('.create-playlist-btn')
    expect(btn.exists()).toBe(false)
    expect(router.push).toHaveBeenCalledWith({ name: 'logIn' })

    // Caso autenticado
    authStore.isAuthenticated = true
    await wrapper.vm.$nextTick()

    btn = wrapper.find('.create-playlist-btn') // buscamos nuevamente
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(router.push).toHaveBeenCalledWith({ name: 'createPlayList' })
  })

})
