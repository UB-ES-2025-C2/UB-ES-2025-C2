import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia, defineStore } from 'pinia'
import { vi, describe, it, beforeAll, beforeEach, expect } from 'vitest'
import Playlists from '../../views/Playlists.vue'

// Mock de Vue Router
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } }),
}))

// Mock API store
vi.mock('../../apiStore/guestApi.js', () => ({
  useApiStore: () => ({
    getPlaylistById: vi.fn(() =>
      Promise.resolve({
        id: 1,
        name: 'Playlist1',
        description: 'playlist d’èxits mundials',
        owner: 'Owner1',
        cover: 'cover_playlist.jpg',
      }),
    ),
    getSongFromPlayList: vi.fn(() =>
      Promise.resolve([
        {
          id: 1,
          song: { id: 1, name: 'Song1', artist: 'Artist1', cover: 'cover1.jpg', topic: 'Pop' },
        },
        {
          id: 2,
          song: { id: 2, name: 'Song2', artist: 'Artist2', cover: 'cover2.jpg', topic: 'Rock' },
        },
      ]),
    ),
  }),
}))

describe('Playlists.vue', () => {
  let playerStore, playSongSpy, toggleSpy, setQueueSpy, wrapper

  beforeAll(() => {
    // Mock HTMLMediaElement correctamente
    class HTMLMediaElementMock {
      play = vi.fn()
      pause = vi.fn()
      load = vi.fn()
    }
    globalThis.HTMLMediaElement = HTMLMediaElementMock
  })

  beforeEach(() => {
    // Spies
    playSongSpy = vi.fn()
    toggleSpy = vi.fn()
    setQueueSpy = vi.fn()

    // Pinia y store player con la misma instancia
    const pinia = createPinia()
    setActivePinia(pinia)

    const usePlayerStore = defineStore('player', {
      state: () => ({
        current: null,
        isPlaying: false,
        queue: [],
        index: 0,
      }),
      actions: {
        playSong: playSongSpy,
        toggle: toggleSpy,
        setQueue: (queue, index) => {
          setQueueSpy(queue)
          playerStore.queue = queue
          playerStore.index = index
        },
        loadCurrent: vi.fn(),
      },
    })

    playerStore = usePlayerStore()

    // Montar componente con el mismo Pinia
    wrapper = mount(Playlists, { global: { plugins: [pinia] } })
  })

  it('carrega correctament la playlist i les cançons', async () => {
    await wrapper.vm.loadPlaylist()
    await flushPromises()

    expect(wrapper.vm.playlist.name).toBe('Playlist1')
    expect(wrapper.vm.playlist.description).toBe('playlist d’èxits mundials')
    expect(wrapper.vm.playlist.owner).toBe('Owner1')
    expect(wrapper.vm.songs).toHaveLength(2)
    expect(wrapper.vm.loading).toBe(false)
  })

  it('renderiza la playlist amb informació correcta', async () => {
    await wrapper.vm.loadPlaylist()
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('Playlist1')
    expect(text).toContain('playlist d’èxits mundials')
    expect(text).toContain('Owner1')
    expect(text).toContain('2 cançons')
  })

  it('renderiza les cançons amb les seves covers', async () => {
    await wrapper.vm.loadPlaylist()
    await flushPromises()

    const songImages = wrapper.findAll('.song-thumbnail')
    expect(songImages.length).toBe(2)
    expect(songImages[0].attributes('src')).toBe('cover1.jpg')
    expect(songImages[1].attributes('src')).toBe('cover2.jpg')
  })

  it('togglePlay crida playSong o toggle segons la cançó', async () => {
    await wrapper.vm.loadPlaylist()
    await flushPromises()

    // Primera cançó → playSong
    wrapper.vm.togglePlay({
      id: 1,
      name: 'Song1',
      artist: 'Artist1',
      cover: 'cover1.jpg',
      topic: 'Pop',
    })
    expect(playSongSpy).toHaveBeenCalled()

    // Marquem la cançó actual → toggle
    playerStore.current = { id: 1 }
    playerStore.isPlaying = true

    wrapper.vm.togglePlay({ id: 1 })
    expect(toggleSpy).toHaveBeenCalled()
  })

  it('playPlaylist crida setQueue i playSong', async () => {
    await wrapper.vm.loadPlaylist()
    await flushPromises()

    // Forcem les cançons
    wrapper.vm.songs = [
      { id: 1, song: { id: 1, name: 'Song1' } },
      { id: 2, song: { id: 2, name: 'Song2' } },
    ]

    wrapper.vm.playPlaylist()
    expect(setQueueSpy).toHaveBeenCalledWith([
      { id: 1, name: 'Song1' },
      { id: 2, name: 'Song2' },
    ])
    expect(playSongSpy).toHaveBeenCalled()
  })
})
