import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { vi } from "vitest"
import Playlists from "../../views/Playlists.vue"
import { useApiStore } from '../../apiStore/guestApi.js'

// Mock de Vue Router
vi.mock("vue-router", () => ({
  useRoute: () => ({
    params: { id: "1" } // aquí defines el id que tu componente espera
  })
}))

describe("Playlists.vue", () => {
  let pinia
  let apiStore
  let wrapper

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)

    apiStore = useApiStore()

    // Mockear funciones de la store
    apiStore.getPlaylistById = vi.fn().mockResolvedValue({
      id: 1,
      name: "Playlist1",
      description: "playlist d’èxits mundials",
      cover: "cover-url",
      owner: [{ nickname: "Owner1" }]
    })
    apiStore.getSongFromPlayList = vi.fn().mockResolvedValue(undefined)
    apiStore.getUserById = vi.fn().mockResolvedValue({ nickname: "Owner1" })

    // Mockear canciones
    apiStore.songs = [
      { song: { id: 1, name: "Song 1", artist: "Artist 1", cover: "cover1.jpg" } },
      { song: { id: 2, name: "Song 2", artist: "Artist 2", cover: "cover2.jpg" } }
    ]

    wrapper = mount(Playlists, {
      global: {
        plugins: [pinia],
        mocks: {
          mockSongsCount: apiStore.songs.length,
          mockOwner: apiStore.songs.length ? apiStore.songs[0].song.artist : "",
          mockSavedTimes: 5
        }
      }
    })

    await wrapper.vm.$nextTick()
  })

  it("renderiza la playlist con información correcta", () => {
    expect(wrapper.text()).toContain("Playlist1")
    expect(wrapper.text()).toContain("playlist d’èxits mundials")
    expect(wrapper.text()).toContain("Owner1")
    expect(wrapper.text()).toContain("2 canciones")
  })

  it("renderiza las canciones con sus covers", () => {
    const songImages = wrapper.findAll(".song-card img")

    expect(songImages.length).toBe(apiStore.songs.length)
    expect(songImages[0].attributes("src")).toBe("cover1.jpg")
    expect(songImages[1].attributes("src")).toBe("cover2.jpg")
  })

})
