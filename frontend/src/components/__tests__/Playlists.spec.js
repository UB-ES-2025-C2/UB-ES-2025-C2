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
  let playerStore, playSongSpy, toggleSpy, setQueueSpy

  beforeAll(() => {
    // Mock HTMLMediaElement
    if (!globalThis.HTMLMediaElement) {
      globalThis.HTMLMediaElement = class {
        play() {}
        pause() {}
        load() {}
      }
    }
  })

  /*
  apiStore.getPlaylistById = vi.fn().mockResolvedValue({
      id: 1,
      name: "Playlist1",
      description: "playlist d’èxits mundials",
      cover: "cover-url",
      owner: [1],
      savedTimes: 123
    })

    apiStore.getUserById = vi.fn().mockResolvedValue({ nickname: "Owner1" })

    apiStore.getSongFromPlayList = vi.fn().mockImplementation(async () => {
      apiStore.songsFromPlaylist = [
        { song: { id: 1, name: "Song 1", artist: "Artist 1", cover: "cover1.jpg" } },
        { song: { id: 2, name: "Song 2", artist: "Artist 2", cover: "cover2.jpg" } }
      ]
    })

    wrapper = mount(Playlists, { global: { plugins: [pinia] } })

    // Esperamos a que se cargue la playlist
    await new Promise(r => setTimeout(r, 0))
    await wrapper.vm.$nextTick()
  })
  */
  it('renderiza la playlist con información correcta', () => {
    const text = wrapper.text()

    expect(text).toContain('Playlist1')
    expect(text).toContain('playlist d’èxits mundials')
    expect(text).toContain('Owner1')
    expect(text).toContain('Guardada 123 veces')
    expect(text).toContain('canciones')
  })

  it('renderiza las canciones con sus covers', () => {
    const songImages = wrapper.findAll('.song-card img')
    expect(songImages.length).toBe(apiStore.songsFromPlaylist.length)
    expect(songImages[0].attributes('src')).toBe('cover1.jpg')
    expect(songImages[1].attributes('src')).toBe('cover2.jpg')
  })
  beforeEach(() => {
    playSongSpy = vi.fn()
    toggleSpy = vi.fn()
    setQueueSpy = vi.fn()

    const usePlayerStore = defineStore('player', {
      state: () => ({
        current: null,
        isPlaying: false,
      }),
      actions: {
        playSong: (song) => playSongSpy(song),
        toggle: () => toggleSpy(),
        setQueue: (queue) => setQueueSpy(queue),
      },
    })

    setActivePinia(createPinia())
    playerStore = usePlayerStore()
  })

  it('carrega correctament la playlist i les cançons', async () => {
    const wrapper = mount(Playlists, { global: { provide: { player: playerStore } } })

    // Cridem directament el mètode de càrrega
    await wrapper.vm.loadPlaylist()
    await flushPromises()

    expect(wrapper.vm.playlist.name).toBe('Playlist1')
    expect(wrapper.vm.playlist.description).toBe('playlist d’èxits mundials')
    expect(wrapper.vm.playlist.owner).toBe('Owner1')
    expect(wrapper.vm.songs).toHaveLength(2)
    expect(wrapper.vm.loading).toBe(false)
  })

  it('togglePlay crida playSong o toggle segons la cançó', async () => {
    const wrapper = mount(Playlists, { global: { provide: { player: playerStore } } })
    await wrapper.vm.loadPlaylist()
    await flushPromises()

    // Primer toggle → playSong
    wrapper.vm.togglePlay({
      id: 1,
      name: 'Song1',
      artist: 'Artist1',
      cover: 'cover1.jpg',
      topic: 'Pop',
    })
    expect(playSongSpy).toHaveBeenCalled()

    // Marquem la cançó actual per cridar toggle
    playerStore.current = { id: 1 }
    playerStore.isPlaying = true

    wrapper.vm.togglePlay({ id: 1 })
    expect(toggleSpy).toHaveBeenCalled()
  })

  it('playPlaylist crida setQueue i playSong', async () => {
    const wrapper = mount(Playlists, { global: { provide: { player: playerStore } } })
    await wrapper.vm.loadPlaylist()
    await flushPromises()

    wrapper.vm.songs = [
      { id: 1, song: { id: 1, name: 'Song1' } },
      { id: 2, song: { id: 2, name: 'Song2' } },
    ]

    wrapper.vm.playPlaylist()
    expect(setQueueSpy).toHaveBeenCalledWith([
      { id: 1, name: 'Song1' },
      { id: 2, name: 'Song2' },
    ])
    expect(playSongSpy).toHaveBeenCalledWith({ id: 1, name: 'Song1' })
  })
})
