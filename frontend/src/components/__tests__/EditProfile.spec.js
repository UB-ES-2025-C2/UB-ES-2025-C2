import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import EditProfile from '../../views/EditProfile.vue'

// ==============================
// MOCK GLOBAL DE URL.createObjectURL
// ==============================
global.URL.createObjectURL = vi.fn(() => 'blob:mocked-url')

// ==============================
// MOCK DEL STORE DE API Y AUTH
// ==============================
const mockApiStore = {
  getUserById: vi.fn(),
}
const mockAuthStore = {
  changeProfilePicture: vi.fn(),
  refreshUserInfo: vi.fn(),
  updateUserProfile: vi.fn(),
}

// ==============================
// MOCK DE VUE ROUTER
// ==============================
const pushMock = vi.fn()

vi.mock('../../apiStore/guestApi', () => ({
  useApiStore: () => mockApiStore
}))

vi.mock('../../apiStore/authStore', () => ({
  useAuthStore: () => mockAuthStore
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '123' } }),
  useRouter: () => ({ push: pushMock }),
}))

// ==============================
// TESTS
// ==============================
describe('EditProfile.vue', () => {
  let wrapper
  const userMock = {
    nickname: 'testuser',
    description: 'Test description',
    profilePic: 'test.png'
  }

  beforeEach(async () => {
    mockApiStore.getUserById.mockResolvedValue(userMock)
    mockAuthStore.updateUserProfile.mockResolvedValue()
    mockAuthStore.changeProfilePicture.mockResolvedValue()
    wrapper = mount(EditProfile)
    await flushPromises()
  })

  it('renders edit profile form with user data', () => {
    expect(wrapper.find('input[type="text"]').element.value).toBe(userMock.nickname)
    expect(wrapper.find('textarea').element.value).toBe(userMock.description)
    expect(wrapper.find('img').attributes('src')).toBe(userMock.profilePic)
  })

  it('triggers file input when avatar is clicked', async () => {
    const clickMock = vi.fn()
    wrapper.vm.fileInput = { click: clickMock }
    await wrapper.find('.avatar-preview').trigger('click')
    expect(clickMock).toHaveBeenCalled()
  })

  it('updates preview image when a file is selected', async () => {
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' })
    const event = { target: { files: [file] } }
    await wrapper.vm.onFileSelected(event)
    expect(wrapper.vm.selectedFile).toBe(file)
    expect(wrapper.vm.previewImage).toBe('blob:mocked-url')
  })

  it('calls auth store functions and redirects on save', async () => {
    wrapper.vm.nickname = userMock.nickname
    wrapper.vm.description = userMock.description

    vi.useFakeTimers() //activar timers falsos

    await wrapper.vm.saveProfile()

    vi.advanceTimersByTime(1200)

    expect(mockAuthStore.updateUserProfile).toHaveBeenCalledWith({
      nickname: userMock.nickname,
      description: userMock.description
    })
    expect(pushMock).toHaveBeenCalledWith({ name: 'profile', params: { id: '123' } })

    vi.useRealTimers() //restaurar timers reals
  })

  it('shows error if getUserById fails', async () => {
    mockApiStore.getUserById.mockRejectedValue(new Error('fail'))
    wrapper = mount(EditProfile)
    await flushPromises()
    expect(wrapper.find('.error').text()).toBe("No s'ha pogut carregar l'usuari.")
  })

  it('shows error if saveProfile fails', async () => {
    mockAuthStore.updateUserProfile.mockRejectedValue(new Error('fail'))
    wrapper.vm.nickname = 'newuser'
    wrapper.vm.description = 'new description'
    await wrapper.vm.saveProfile()
    expect(wrapper.find('.error').text()).toBe('Error al desar el perfil.')
  })
})
