import { mount, flushPromises } from '@vue/test-utils'
import PlayerBar from '../PlayerBar.vue'
import { createTestingPinia } from '@pinia/testing'
import { usePlayerStore } from '@/piniaStore/playerStore'
import { vi } from 'vitest'

describe('PlayerBar.vue', () => {
  let store, wrapper

  beforeEach(async () => {
    wrapper = mount(PlayerBar, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            player: {
              current: null, // inicialmente null
              queue: [],
              index: 0,
              isPlaying: false,
              volume: 0.5,
              time: 0,
              duration: 180
            }
          },
          stubActions: false
        })]
      }
    })

    store = usePlayerStore()

    // Configuramos current y queue después del mount
    store.current = { id: 1, name: 'Canción Test', artist: 'Artista Test', cover: 'cover.jpg' }
    store.queue = [
      { id: 1, name: 'Canción Test', artist: 'Artista Test' },
      { id: 2, name: 'Otra Canción', artist: 'Artista 2' }
    ]

    await flushPromises()

    // Reemplazamos métodos por spies
    store.toggle = vi.fn(() => { store.isPlaying = !store.isPlaying })
    store.prev = vi.fn()
    store.next = vi.fn()
    store.seek = vi.fn()
    store.setVolume = vi.fn()
    store.playSong = vi.fn()
    store.setQueue = vi.fn()
  })

  it('renders correctly with current song', () => {
    expect(wrapper.text()).toContain('Canción Test')
    expect(wrapper.text()).toContain('Artista Test')

    const img = wrapper.find('img.cover')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('cover.jpg')
  })

  it('toggles play/pause when play button is clicked', async () => {
    await wrapper.find('button.play').trigger('click')
    expect(store.toggle).toHaveBeenCalled()
    expect(store.isPlaying).toBe(true)
  })

  it('calls prev and next when respective buttons are clicked', async () => {
    await wrapper.find('button[title="Anterior"]').trigger('click')
    await wrapper.find('button[title="Següent"]').trigger('click')
    expect(store.prev).toHaveBeenCalled()
    expect(store.next).toHaveBeenCalled()
  })

  it('updates progress when timeline changes', async () => {
    const input = wrapper.find('input[type="range"]')
    await input.setValue(42)
    expect(store.seek).toHaveBeenCalledWith(42)
  })

  it('updates volume when volume slider changes', async () => {
    const volInput = wrapper.findAll('input[type="range"]')[1]
    await volInput.setValue(0.8)
    expect(store.setVolume).toHaveBeenCalledWith(0.8)
  })

  it('toggles queue display and plays song from queue', async () => {
    await wrapper.find('button[title="Cua"]').trigger('click')
    expect(wrapper.vm.showQueue).toBe(true)

    const queueRow = wrapper.findAll('.qrow')[1]
    await queueRow.trigger('dblclick')
    expect(store.setQueue).toHaveBeenCalledWith(store.queue, 1)
    expect(store.playSong).toHaveBeenCalled()
  })
})
