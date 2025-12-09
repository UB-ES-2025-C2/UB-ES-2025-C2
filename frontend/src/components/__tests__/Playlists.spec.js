import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { vi } from "vitest"
import Playlists from "../../views/Playlists.vue"
import { useApiStore } from '../../apiStore/guestApi.js'

// Mock de Vue Router
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "1" } })
}))

// Mock router
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

  it("renderiza la playlist con información correcta", () => {
    const text = wrapper.text()

    expect(text).toContain("Playlist1")
    expect(text).toContain("playlist d’èxits mundials")
    expect(text).toContain("Owner1")
    expect(text).toContain("Guardada 123 veces")
    expect(text).toContain("canciones")
  })


  it("renderiza las canciones con sus covers", () => {
    const songImages = wrapper.findAll(".song-card img")
    expect(songImages.length).toBe(apiStore.songsFromPlaylist.length)
    expect(songImages[0].attributes("src")).toBe("cover1.jpg")
    expect(songImages[1].attributes("src")).toBe("cover2.jpg")
  })
})
