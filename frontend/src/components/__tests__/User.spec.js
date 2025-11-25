import { mount, flushPromises } from "@vue/test-utils";
import User from "../../views/User.vue";
import { createPinia, setActivePinia } from "pinia";
import { vi } from "vitest";

// Mock de vue-router
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { username: "testuser" } }),
}));

// Mock del store
const mockApiStore = {
  nUsersResult: [{ id: 1, username: "testuser" }],
  getFollowers: vi.fn().mockResolvedValue(Array(123).fill({})),
  getFollowing: vi.fn().mockResolvedValue(Array(45).fill({})),
  getUserSongs: vi.fn(),
  getUserPlaylists: vi.fn(),
};

// Mock del módulo Pinia store
vi.mock("../../apiStore/guestApi", () => ({
  useApiStore: () => mockApiStore,
}));

describe("User.vue", () => {
  const mockSongs = [
    { id: 1, name: "Canción 1", artist: "Artista A", cover: "cover1.jpg" },
    { id: 2, name: "Canción 2", artist: "Artista B", cover: "cover2.jpg" },
  ];

  const mockPlaylists = [
    { id: 1, name: "Playlist 1", cover: "playlist1.jpg" },
    { id: 2, name: "Playlist 2", cover: "playlist2.jpg" },
  ];

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    mockApiStore.getUserSongs.mockResolvedValue(mockSongs);
    mockApiStore.getUserPlaylists.mockResolvedValue(mockPlaylists);
    mockApiStore.getFollowers.mockResolvedValue(Array(123).fill({}));
    mockApiStore.getFollowing.mockResolvedValue(Array(45).fill({}));
    mockApiStore.nUsersResult = [{ id: 1, username: "testuser" }];
  });

  it("muestra datos del usuario si existe", async () => {
    const wrapper = mount(User, { global: { plugins: [createPinia()] } });
    await flushPromises();
    expect(wrapper.text()).toContain("testuser");
    expect(wrapper.text()).toContain("Seguidors: 123 · Seguint: 45");
  });

  it("muestra las canciones del usuario", async () => {
    const wrapper = mount(User, { global: { plugins: [createPinia()] } });
    await flushPromises();
    const songCards = wrapper.findAll(".song-card");
    expect(songCards.length).toBe(mockSongs.length);
    mockSongs.forEach((song, i) => {
      const card = songCards[i];
      expect(card.text()).toContain(song.name);
      expect(card.text()).toContain(song.artist);
      expect(card.find("img").attributes("src")).toBe(song.cover);
    });
  });

  it("muestra las playlists del usuario", async () => {
    const wrapper = mount(User, { global: { plugins: [createPinia()] } });
    await flushPromises();
    const playlistCards = wrapper.findAll(".playlist-card");
    expect(playlistCards.length).toBe(mockPlaylists.length);
    mockPlaylists.forEach((pl, i) => {
      const card = playlistCards[i];
      expect(card.text()).toContain(pl.name);
      expect(card.find("img").attributes("src")).toBe(pl.cover);
    });
  });

  it("muestra mensaje si el usuario no existe", async () => {
    // Evitar error de mounted hook
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Usuario inexistente
    mockApiStore.nUsersResult = [];

    // Mockear funciones que se llaman con foundUser.id
    const runUserSongs = vi.fn().mockResolvedValue([]);
    const runUserPlaylists = vi.fn().mockResolvedValue([]);

    const wrapper = mount(User, {
      global: { plugins: [createPinia()] },
      // Pasar estos mocks como props o provide si User los usa
      // o usar vi.mock en User.vue para esos métodos
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Usuari no trobat");

    // Restauramos
    mockApiStore.nUsersResult = [{ id: 1, username: "testuser" }];
    vi.restoreAllMocks();
  });

});
