import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LogIn from '../../views/LogIn.vue'

// Mock del store
const mockAuthStore = {
  isAuthenticated: false,
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  initializeAuthStore: vi.fn(),
}

// Mock del router
const mockPush = vi.fn()

vi.mock('../../apiStore/authStore', () => ({
  useAuthStore: () => mockAuthStore
}))

// Mock de vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush })
}))

describe('LogIn.vue', () => {
  let wrapper

  beforeEach(() => {
    setActivePinia(createPinia())

    wrapper = mount(LogIn, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Reset de mocks antes de cada test
    mockAuthStore.login.mockReset()
    mockAuthStore.logout.mockReset()
    mockAuthStore.initializeAuthStore.mockReset()
    mockPush.mockReset()
  })

  it('renders login form', () => {
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button.btn-primary').text()).toBe('Iniciar Sessió')
  })

  it('shows alert if username or password is empty', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    await wrapper.find('form').trigger('submit.prevent')
    expect(alertMock).toHaveBeenCalledWith('Please enter both username and password.')
    alertMock.mockRestore()
  })

  it('calls authStore.login with correct data', async () => {
    await wrapper.find('input[type="text"]').setValue('user1')
    await wrapper.find('input[type="password"]').setValue('pass1')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockAuthStore.login).toHaveBeenCalledWith({ username: 'user1', password: 'pass1' })
  })

  it('redirects to SignUp when clicking SignUp button', async () => {
    const signUpButton = wrapper.findAll('button').find(b => b.text() === 'Registra’t')
    expect(signUpButton).toBeTruthy()
    await signUpButton.trigger('click')
    expect(mockPush).toHaveBeenCalledWith({ name: 'sign_up' })
  })
})
