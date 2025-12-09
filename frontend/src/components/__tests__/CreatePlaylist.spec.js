import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CreatePlaylist from '../../views/CreatePlaylist.vue'

// Mock del store d'Auth
const mockAuthStore = {
  initializeAuthStore: vi.fn(),
  postPlaylist: vi.fn(),
  user_id: 1,
}

// Mock de useRouter
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// Mock del AuthStore
vi.mock('../../apiStore/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock alert
globalThis.alert = vi.fn()

describe('CreatePlaylist.vue', () => {
  let wrapper

  beforeEach(async () => {
    mockAuthStore.initializeAuthStore = vi.fn()
    mockAuthStore.postPlaylist = vi.fn()
    pushMock.mockClear()
    globalThis.alert.mockClear()

    wrapper = mount(CreatePlaylist)
    await flushPromises()
  })

  it('crida initializeAuthStore al muntar', () => {
    expect(mockAuthStore.initializeAuthStore).toHaveBeenCalled()
  })

  it('actualitza previewCover en seleccionar portada', async () => {
    const file = new File(['dummy'], 'cover.png', { type: 'image/png' })
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mocked-url')

    await wrapper.vm.onCoverSelected({ target: { files: [file] } })

    expect(wrapper.vm.cover).toBe(file)
    expect(wrapper.vm.previewCover).toBe('blob:mocked-url')
  })

  it('mostra error si nom i tema estan buits', async () => {
    wrapper.vm.name = ''
    wrapper.vm.topic = ''

    await wrapper.vm.createPlaylist()

    expect(wrapper.vm.error).toBe('El nom i el tema són obligatoris.')
  })

  it('crida postPlaylist i redirigeix correctament', async () => {
    mockAuthStore.postPlaylist.mockResolvedValue({ data: 'ok' })

    wrapper.vm.name = 'Test'
    wrapper.vm.topic = 'Pop'
    wrapper.vm.description = 'Desc'
    wrapper.vm.cover = new File(['x'], 'cover.png', { type: 'image/png' })

    await wrapper.vm.createPlaylist()
    await flushPromises()

    expect(mockAuthStore.postPlaylist).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith({ name: 'home' })
    expect(wrapper.vm.error).toBeNull()
    expect(globalThis.alert).toHaveBeenCalledWith('Playlist creada correctament!')
  })

  it('mostra error quan postPlaylist falla', async () => {
    mockAuthStore.postPlaylist.mockRejectedValue(new Error('fail'))

    wrapper.vm.name = 'Test'
    wrapper.vm.topic = 'Pop'

    await wrapper.vm.createPlaylist()
    await flushPromises()

    expect(wrapper.vm.error).toBe('Error en crear la playlist.')
  })
})
