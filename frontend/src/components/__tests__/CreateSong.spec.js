import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CreateSong from '../../views/CreateSong.vue'

// Mock del store d'Auth
const mockAuthStore = {
  initializeAuthStore: vi.fn(),
  postSong: vi.fn(),
}

// Mock de useRouter
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock })
}))

vi.mock('../../apiStore/authStore', () => ({
  useAuthStore: () => mockAuthStore
}))

vi.useFakeTimers()

// Mock de alert
global.alert = vi.fn()

describe('CreateSong.vue', () => {
  let wrapper

  beforeEach(async () => {
    // Netegem els mocks abans de muntar
    mockAuthStore.initializeAuthStore = vi.fn()
    mockAuthStore.postSong = vi.fn()
    pushMock.mockClear()
    global.alert.mockClear()
    global.console.error = vi.fn() // Silenciar errors, que no son errors reals, en tests

    // Muntem el component i afegim authorsString per evitar warnings
    wrapper = mount(CreateSong, {
      data() {
        return { authorsString: '' }
      }
    })

    // Esperem a que onMounted async s'executi
    await flushPromises()
  })

  it('crida a initializeAuthStore al muntar', () => {
    expect(mockAuthStore.initializeAuthStore).toHaveBeenCalled()
  })

  it('actualitza previewCover al sel·leccionar portada', async () => {
    const file = new File(['dummy content'], 'cover.png', { type: 'image/png' })
    const event = { target: { files: [file] } }

    global.URL.createObjectURL = vi.fn(() => 'blob:mocked-url')

    await wrapper.vm.onCoverSelected(event)
    expect(wrapper.vm.cover).toBe(file)
    expect(wrapper.vm.previewCover).toBe('blob:mocked-url')
  })

  it('actualitza fileAudio al sel·leccionar audio', async () => {
    const file = new File(['audio content'], 'song.mp3', { type: 'audio/mp3' })
    const event = { target: { files: [file] } }

    await wrapper.vm.onAudioSelected(event)
    expect(wrapper.vm.fileAudio).toBe(file)
  })

  it('mostra error si no hi ha arxiu de àudio al crear cançó', async () => {
    wrapper.vm.fileAudio = null
    await wrapper.vm.createSong()
    expect(wrapper.vm.error).toBe("Cal pujar un fitxer d'àudio.")
  })

  it('crida a postSong y redirigeix al crear cançó correctament', async () => {
    const song = { data: 'ok' }
    mockAuthStore.postSong.mockResolvedValue(song)
    wrapper.vm.fileAudio = new File(['audio content'], 'song.mp3', { type: 'audio/mp3' })

    await wrapper.vm.createSong()
    await flushPromises()

    vi.runAllTimers()

    expect(mockAuthStore.postSong).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith({ name: 'home' })
    expect(wrapper.vm.error).toBeNull()
  })

  it('mostra error si postSong falla', async () => {
    const error = new Error('fail')
    mockAuthStore.postSong.mockRejectedValue(error)
    wrapper.vm.fileAudio = new File(['audio content'], 'song.mp3', { type: 'audio/mp3' })

    await wrapper.vm.createSong()
    await flushPromises()

    expect(wrapper.vm.error).toBe("Error en pujar la cançó.")
  })
})
