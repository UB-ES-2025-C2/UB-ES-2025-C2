import { mount, flushPromises } from "@vue/test-utils";
import SongDetailById from "../../views/SongDetailById.vue";
import { vi } from "vitest";

// Mock de Vue Router
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "123" } }),
}));

// Mock de la API
vi.mock("../../services/api", () => ({
  default: {
    getSongById: vi.fn(),
  },
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

  beforeAll(() => {
    // Mock de play y pause globalmente para JSDOM
    HTMLMediaElement.prototype.play = vi.fn();
    HTMLMediaElement.prototype.pause = vi.fn();
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

  it("togglePlay cambia isPlaying y llama a play/pause", async () => {
    const { default: api } = await import("../../services/api");
    api.getSongById.mockResolvedValue({ data: mockSong });

    const wrapper = mount(SongDetailById);
    await flushPromises();

    const audio = wrapper.find("audio").element;

    // Estado inicial
    let paused = true;
    HTMLMediaElement.prototype.play = vi.fn(() => (paused = false));
    HTMLMediaElement.prototype.pause = vi.fn(() => (paused = true));

    // Simulamos que el audio está pausado inicialmente
    Object.defineProperty(audio, "paused", {
      get: () => paused,
    });

    // Reproducir
    wrapper.vm.togglePlay();
    expect(wrapper.vm.isPlaying).toBe(true);
    expect(audio.play).toHaveBeenCalled();

    // Pausar
    wrapper.vm.togglePlay();
    expect(wrapper.vm.isPlaying).toBe(false);
    expect(audio.pause).toHaveBeenCalled();
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
