import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import { vi } from "vitest"
import Playlists from "../../views/Playlists.vue"
import { useApiStore } from '../../apiStore/guestApi.js'

// Mock de Vue Router
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "1" } })
}))

// Mock del store
vi.mock('../../apiStore/guestApi.js', () => ({
  useApiStore: () => ({
    getPlaylistById: vi.fn().mockResolvedValue({
      id: 1,
      name: "Playlist1",
      description: "playlist d’èxits mundials",
      cover: "cover-url",
      owner: "Owner1",
      savedTimes: 123
    }),
    getUserById: vi.fn().mockResolvedValue({ nickname: "Owner1" }),
    getSongFromPlayList: vi.fn().mockResolvedValue([
      { song: { id: 1, name: "Song 1", artist: "Artist 1", cover: "cover1.jpg" } },
      { song: { id: 2, name: "Song 2", artist: "Artist 2", cover: "cover2.jpg" } }
    ])
  })
}))


describe('Playlists.vue', () => {
  let pinia
  let wrapper
  let apiStore
  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    apiStore = useApiStore()
    wrapper = mount(Playlists, { global: { plugins: [pinia] } })
    await new Promise(r => setTimeout(r, 0))
    await wrapper.vm.$nextTick()
  })

  it("renderiza la secció playlist-hero amb informació correcta", () => {
    const hero = wrapper.find(".playlist-hero")
    expect(hero.exists()).toBe(true)

    const cover = hero.find(".playlist-cover")
    expect(cover.exists()).toBe(true)
    expect(cover.attributes("src")).toBe("cover-url")

    expect(hero.text()).toContain("Playlist1")
    expect(hero.text()).toContain("playlist d’èxits mundials")

    expect(hero.text()).toContain("Owner1")
    expect(hero.text()).toContain("2 cançons")

    const playButton = hero.find(".btn-playlist-play")
    expect(playButton.exists()).toBe(true)
    expect(playButton.text()).toBe("▶")
  })

  it("renderiza las canciones con sus covers", () => {
    const songImages = wrapper.findAll(".song-thumbnail")
    //console.log(wrapper.findAll(".song-card img"))
    //console.log(wrapper.findAll(".song-card img"))
    expect(songImages.length).toBe(2)
    expect(songImages[0].attributes("src")).toBe("cover1.jpg")
    expect(songImages[1].attributes("src")).toBe("cover2.jpg")
  })
})
