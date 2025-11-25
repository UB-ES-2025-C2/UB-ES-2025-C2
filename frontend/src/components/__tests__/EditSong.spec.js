import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import EditSong from '../../views/EditSong.vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock de router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/profile/:id', name: 'profile', component: { template: '<div />' } }
  ]
})

// Spy que vamos a usar para patchSong
const patchSongSpy = vi.fn(() => Promise.resolve({ status: 200 }))

// Mock de guestApi
vi.mock('@/apiStore/guestApi', () => ({
  useApiStore: () => ({
    getSongById: vi.fn(() =>
      Promise.resolve({
        id: 1,
        name: 'Hola',
        artist: 'Joan',
        topic: 'Test',
        authors: [5, 6],
        cover: 'cover.jpg'
      })
    )
  })
}))

// Mock de authStore con spy
vi.mock('@/apiStore/authStore', () => ({
  useAuthStore: () => ({
    patchSong: patchSongSpy,
    user_id: 7
  })
}))

describe('EditSong.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    patchSongSpy.mockClear() // Limpiar spy antes de cada test
  })

  it('carrega dades inicials de la cançó', async () => {
    const wrapper = mount(EditSong, {
      global: {
        plugins: [
          router,
          createTestingPinia({ createSpy: vi.fn, stubActions: false })
        ],
        mocks: {
          $route: { params: { id: 1 } }
        }
      }
    })

    await flushPromises()

    const inputs = wrapper.findAll('input[type="text"]')
    expect(inputs[0].element.value).toBe('Hola')       // nombre
    expect(inputs[1].element.value).toBe('Joan')       // artista
    expect(inputs[2].element.value).toBe('Test')       // tema

    const coverImg = wrapper.find('img.cover-preview')
    expect(coverImg.exists()).toBe(true)
    expect(coverImg.attributes('src')).toBe('cover.jpg')
  })

  it('actualitza la cançó correctament', async () => {
    const wrapper = mount(EditSong, {
      global: {
        plugins: [
          router,
          createTestingPinia({ createSpy: vi.fn, stubActions: false })
        ],
        mocks: {
          $route: { params: { id: 1 } }
        }
      }
    })

    await flushPromises()

    // Simulamos click en el botón de guardar
    const saveButton = wrapper.find('button:not([type="button"])')
    expect(saveButton.exists()).toBe(true)

    await saveButton.trigger('click')
    await flushPromises()

    // Comprobamos que la spy se llamó
    expect(patchSongSpy).toHaveBeenCalled()

    // Comprobamos mensaje de éxito
    expect(wrapper.text()).toContain('Cançó actualitzada correctament!')

    // Avanzamos timers para el redirect
    vi.advanceTimersByTime(3000)
    await flushPromises()

    expect(wrapper.vm.success).toBe(null)
  })
})
