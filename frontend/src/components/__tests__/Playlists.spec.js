import { mount } from '@vue/test-utils'
import Playlists from '../../views/Playlists.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useApiStore } from '../../apiStore/guestApi.js'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock de vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 1 }  // aquí defines el id que quieres para el test
  })
}))

describe('Playlists.vue', () => {
  let wrapper, apiStore, pinia

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)

    // Mock store
    apiStore = useApiStore()
    apiStore.songs = [
      { id: 1, name: 'Song 1', artist: 'Artist 1', cover: '' },
      { id: 2, name: 'Song 2', artist: 'Artist 2', cover: '' }
    ]
    apiStore.getPlaylistById = vi.fn().mockResolvedValue({
      id: 1,
      name: 'Playlist1',
      description: 'playlist d’èxits mundials',
      cover: 'cover-url',
      owner: [{ nickname: 'Owner1' }]
    })
    apiStore.getSongFromPlayList = vi.fn().mockResolvedValue(undefined)
    apiStore.getUserById = vi.fn().mockResolvedValue({ nickname: 'Owner1' })

    wrapper = mount(Playlists, {
      global: {
        plugins: [pinia]
      }
    })

    // Esperamos que onMounted async se resuelva
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
  })

  it('muestra el nombre y descripción de la playlist', () => {
    expect(wrapper.find('.playlist-info h1').text()).toBe('Playlist1')
    expect(wrapper.find('.playlist-description').text()).toBe('playlist d’èxits mundials')
  })

  it('muestra las canciones de la playlist', () => {
    const songs = wrapper.findAll('.song-card')
    expect(songs.length).toBe(2)
    expect(songs[0].text()).toContain('Song 1')
    expect(songs[1].text()).toContain('Song 2')
  })

  it('muestra el propietario de la playlist', () => {
    expect(wrapper.text()).toContain('Creada per Owner1')
  })
})
