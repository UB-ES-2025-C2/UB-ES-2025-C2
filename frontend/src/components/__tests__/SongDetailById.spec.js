import { mount, flushPromises } from "@vue/test-utils";
import SongDetailById from "../../views/SongDetailById.vue";
import { setActivePinia, createPinia, defineStore } from "pinia";
import { vi } from "vitest";

// Mock router
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "123" } }),
}));

// Mock API
vi.mock("../../services/api", () => ({
  default: { getSongById: vi.fn() },
}));

describe("SongDetailById.vue", () => {
  const mockSong = {
    id: 1,
    name: "Test Song",
    artist: "Test Artist",
    cover: "cover.jpg",
    file_audio: "audio.mp3",
    topic: "Pop",
  };

  let toggleSpy, playSongSpy;

  // Creamos un store fake con spies
  const usePlayerStore = defineStore("player", {
    state: () => ({
      current: null,
      isPlaying: false,
      duration: 125,
    }),
    actions: {
      playSong: (song) => playSongSpy(song),
      toggle: () => toggleSpy(),
    },
  });

  beforeAll(() => {
    // Mock global del audio
    global.HTMLMediaElement.prototype.play = vi.fn();
    global.HTMLMediaElement.prototype.pause = vi.fn();
    global.HTMLMediaElement.prototype.load = vi.fn();
  });

  beforeEach(() => {
    toggleSpy = vi.fn();
    playSongSpy = vi.fn();
    setActivePinia(createPinia());
  });

  it("muestra loading mientras carga", () => {
    const wrapper = mount(SongDetailById);
    expect(wrapper.text()).toContain("Carregant…");
  });

  it("muestra error si falla la carga", async () => {
    const { default: api } = await import("../../services/api");
    api.getSongById.mockRejectedValue(new Error("Error de test"));

    const wrapper = mount(SongDetailById);
    await flushPromises();

    expect(wrapper.text()).toContain("⚠️ Error de test");
  });

  it("muestra contenido de la canción correctamente", async () => {
    const { default: api } = await import("../../services/api");
    api.getSongById.mockResolvedValue({ data: mockSong });

    const wrapper = mount(SongDetailById);
    await flushPromises();

    expect(wrapper.text()).toContain(mockSong.name);
    expect(wrapper.text()).toContain(mockSong.artist);
    expect(wrapper.find("img.cover").attributes("src")).toBe(mockSong.cover);
  });

  it("togglePlay llama a playSong o toggle según la canción", async () => {
    const { default: api } = await import("../../services/api");
    api.getSongById.mockResolvedValue({ data: mockSong });

    const playerStore = usePlayerStore();

    const wrapper = mount(SongDetailById, {
      global: {
        provide: {
          playerStore,
        },
      },
    });

    await flushPromises();

    // Primer toggle → no es la canción actual → playSong
    wrapper.vm.togglePlay();
    expect(playSongSpy).toHaveBeenCalled();
    expect(playSongSpy.mock.calls[0][0]).toMatchObject(mockSong);

    // Simulamos que es la canción actual
    wrapper.vm.player.current = mockSong;

    // Segundo toggle → ya es la canción actual → toggle
    wrapper.vm.togglePlay();
    expect(toggleSpy).toHaveBeenCalled();
  });


  it("formatTime funciona correctamente", async () => {
    const { default: api } = await import("../../services/api");
    api.getSongById.mockResolvedValue({ data: mockSong });

    const wrapper = mount(SongDetailById);
    await flushPromises();

    expect(wrapper.vm.formatTime(125)).toBe("2:05");
    expect(wrapper.vm.formatTime(0)).toBe("0:00");
    expect(wrapper.vm.formatTime(Infinity)).toBe("0:00");
    expect(wrapper.vm.formatTime(undefined)).toBe("0:00");
  });
});
