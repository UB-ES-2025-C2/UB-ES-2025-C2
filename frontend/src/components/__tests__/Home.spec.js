import { mount } from '@vue/test-utils'
import Home from '../../views/Home.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../../apiStore/authStore.js'
import { useApiStore } from '../../apiStore/guestApi.js'
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Home.vue', () => {
  let authStore, apiStore, wrapper
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    // Mock del authStore
    authStore = useAuthStore()
    authStore.username = 'TestUser'
    authStore.initializeAuthStore = vi.fn()

    // Mock del apiStore
    apiStore = useApiStore()
    apiStore.songs = [
      { id: 1, name: 'Song 1', artist: 'Artist 1', cover: '', file_audio: '' }
    ]
    apiStore.playList = [{ topic: 'Topic 1', items: ['Playlist 1'] }]
    apiStore.fetchCatalog = vi.fn()
    apiStore.fetchPlaylists = vi.fn()
    apiStore.nUsersResult = []

    // Montamos el componente
    wrapper = mount(Home, {
      global: { plugins: [pinia] }
    })
  })

  it('renderiza el username en el header', () => {
    const usernameEl = wrapper.find('.username')
    expect(usernameEl.text()).toBe(authStore.username)
  })

  it('llama a fetchCatalog y fetchPlaylists al montar', () => {
    expect(apiStore.fetchCatalog).toHaveBeenCalled()
    expect(apiStore.fetchPlaylists).toHaveBeenCalled()
  })

  it('muestra canciones de apiStore', () => {
    // Limitar la búsqueda solo al ul de canciones
    const songList = wrapper.find('section + h2 + ul.cards-list') // apunta a la primera lista de cards tras <h2> "Cançons"
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
