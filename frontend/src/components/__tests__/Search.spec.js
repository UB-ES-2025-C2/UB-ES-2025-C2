import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Search from '../../views/Search.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useApiStore } from '../../apiStore/guestApi.js'

// MOCK de useRoute y useRouter
const mockRoute = { query: { q: 'prueba' } }
const mockRouter = { push: vi.fn(), replace: vi.fn() }

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

describe('Search.vue', () => {
  let wrapper, apiStore, pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    apiStore = useApiStore()
    // Mock resultados
    apiStore.nUsersResult = [{ id: 1, username: 'user1', email: 'user1@test.com' }]
    apiStore.songResults = [{ id: 1, name: 'Canción 1', artist: 'Artista 1', cover: '' }]
    apiStore.playlistResults = [{ id: 1, name: 'Playlist 1', owner: [1], cover: '' }]
    apiStore.getUserById = vi.fn().mockResolvedValue({ nickname: 'Owner1' })

    wrapper = mount(Search, {
      global: {
        plugins: [pinia]
      }
    })
  })

  it('muestra los usuarios en la pestaña "all"', async () => {
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('user1')
    expect(wrapper.text()).toContain('user1@test.com')
  })

  it('muestra las canciones en la pestaña "all"', async () => {
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Canción 1')
    expect(wrapper.text()).toContain('Artista 1')
  })

  it('muestra las playlists y los propietarios', async () => {
    await wrapper.vm.loadUserNames?.()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Playlist 1')
    expect(wrapper.text()).toContain('Owner1')
  })
})
