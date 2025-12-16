import { mount } from '@vue/test-utils'
import Home from '../../views/Home.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../../apiStore/authStore.js'
import { useApiStore } from '../../apiStore/guestApi.js'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock de Vue Router para tests
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/', meta: {} }),
}))

describe('Home.vue', () => {
  let authStore, apiStore, wrapper
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    authStore = useAuthStore()
    authStore.username = 'TestUser'
    authStore.initializeAuthStore = vi.fn()

    apiStore = useApiStore()
    apiStore.songs = [
      { id: 1, name: 'Song 1', artist: 'Artist 1', cover: '', file_audio: '' }
    ]
    apiStore.playList = [{ topic: 'Topic 1', items: ['Playlist 1'] }]
    apiStore.fetchCatalog = vi.fn()
    apiStore.fetchPlaylists = vi.fn()
    apiStore.nUsersResult = []

    // Montamos el componente mockeando router
    wrapper = mount(Home, {
      global: {
        plugins: [pinia],
        mocks: {
          $router: { push: vi.fn() },
          $route: {},
        },
      },
    })
  })

  it('inicializa authStore correctamente', () => {
    expect(authStore.username).toBe('TestUser')
    expect(authStore.initializeAuthStore).toHaveBeenCalledTimes(1) // se llama en onMounted
  })


  it('llama a fetchCatalog y fetchPlaylists al montar', () => {
    expect(apiStore.fetchCatalog).toHaveBeenCalled()
    expect(apiStore.fetchPlaylists).toHaveBeenCalled()
  })

  it('muestra canciones de apiStore', () => {
    const songList = wrapper.find('ul.cards-list')
    expect(songList.exists()).toBe(true)
    const songEls = songList.findAll('.card')
    expect(songEls.length).toBe(apiStore.songs.length)
    expect(songEls[0].text()).toContain('Song 1')
  })

  it('muestra playlists agrupadas por topic', () => {
    const playlistEls = wrapper.findAll('.topic-section')
    expect(playlistEls.length).toBe(1)
    expect(playlistEls[0].text()).toContain('Topic 1')
  })
})
