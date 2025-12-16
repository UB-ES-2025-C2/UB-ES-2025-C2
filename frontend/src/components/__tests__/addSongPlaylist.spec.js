import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import AddSongPlaylist from '../../views/addSongPlaylist.vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/playlist/:id', name: 'playlist', component: { template: '<div />' } }],
})

// Spies
const postPlayListSongSpy = vi.fn(() => Promise.resolve(true))
const deletePlayListSongSpy = vi.fn(() => Promise.resolve(true))

// Mock guestApi
vi.mock('@/apiStore/guestApi', () => ({
  useApiStore: () => ({
    getPlaylistById: vi.fn(() =>
      Promise.resolve({
        id: 1,
        name: 'Test Playlist',
        cover: 'cover.jpg',
        description: 'Una playlist de test',
        owner: 'Paula',
      }),
    ),
    getSongFromPlayList: vi.fn(() =>
      Promise.resolve([
        {
          id: 10,
          song: {
            id: 10,
            name: 'Canción A',
            artist: 'Joan',
            topic: 'Pop',
            file_audio: 'song.mp3',
            cover: '',
          },
        },
      ]),
    ),
    fetchCatalog: vi.fn(() =>
      Promise.resolve([
        { id: 6, name: 'Canción B', artist: 'Maria', topic: 'Rock' },
        { id: 10, name: 'Canción A', artist: 'Joan', topic: 'Pop' },
      ]),
    ),
    songs: [
      { id: 6, name: 'Canción B', artist: 'Maria', topic: 'Rock' },
      { id: 10, name: 'Canción A', artist: 'Joan', topic: 'Pop' },
    ],
  }),
}))

// Mock authStore
vi.mock('@/apiStore/authStore', () => ({
  useAuthStore: () => ({
    postPlayListSong: postPlayListSongSpy,
    deletePlayListSong: deletePlayListSongSpy,
  }),
}))

// Mock useRoute para que playlistId no sea undefined
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => ({ params: { id: 1 } }),
  }
})

describe('addSongPlaylist.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    postPlayListSongSpy.mockClear()
    deletePlayListSongSpy.mockClear()
  })

  it('carrega les dades inicials de la playlist', async () => {
    const wrapper = mount(AddSongPlaylist, {
      global: {
        plugins: [router, createTestingPinia({ createSpy: vi.fn, stubActions: false })],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Test Playlist')
    expect(wrapper.text()).toContain('Una playlist de test')
    expect(wrapper.findAll('.song-row').length).toBe(1)
  })

  it('afegeix una cançó correctament', async () => {
    const wrapper = mount(AddSongPlaylist, {
      global: {
        plugins: [router, createTestingPinia({ createSpy: vi.fn, stubActions: false })],
      },
    })

    await flushPromises()

    const select = wrapper.find('select.song-select')
    await select.setValue(6)

    const addButton = wrapper.find('button.btn-add')
    await addButton.trigger('click')
    await flushPromises()

    expect(postPlayListSongSpy).toHaveBeenCalledWith(1, { song_id: 6 })
    expect(wrapper.vm.selectedSongId).toBe('')
  })

  it('elimina una cançó quan es confirma', async () => {
    const wrapper = mount(AddSongPlaylist, {
      global: {
        plugins: [router, createTestingPinia({ createSpy: vi.fn, stubActions: false })],
      },
    })

    await flushPromises()

    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)

    const deleteButton = wrapper.find('button.btn-delete')
    await deleteButton.trigger('click')
    await flushPromises()

    expect(confirmSpy).toHaveBeenCalled()
    expect(deletePlayListSongSpy).toHaveBeenCalledWith(1, 10)

    confirmSpy.mockRestore()
  })

  it('no elimina la cançó si es cancela confirm', async () => {
    const wrapper = mount(AddSongPlaylist, {
      global: {
        plugins: [router, createTestingPinia({ createSpy: vi.fn, stubActions: false })],
      },
    })

    await flushPromises()

    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false)

    const deleteButton = wrapper.find('button.btn-delete')
    await deleteButton.trigger('click')
    await flushPromises()

    expect(confirmSpy).toHaveBeenCalled()
    expect(deletePlayListSongSpy).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
