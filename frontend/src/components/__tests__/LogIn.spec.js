import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
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

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('LogIn.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LogIn)
  })

  it('renders login form', () => {
    expect(wrapper.find('h3').text()).toBe('Please log in to enter')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Log In')
  })

  it('shows alert if username or password is empty', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    await wrapper.find('form').trigger('submit.prevent')
    expect(alertMock).toHaveBeenCalledWith('Please enter both username and password.')
    alertMock.mockRestore()
  })

  it('calls authStore.login with correct data', async () => {
    wrapper.find('input[type="text"]').setValue('user1')
    wrapper.find('input[type="password"]').setValue('pass1')
    await wrapper.find('form').trigger('submit.prevent')
    expect(mockAuthStore.login).toHaveBeenCalledWith({ username: 'user1', password: 'pass1' })
  })

  it('redirects to SignUp when clicking SignUp button', async () => {
    // Mock location.href
    delete window.location
    window.location = { href: '' }

    const signUpButton = wrapper.findAll('button').find(b => b.text() === 'Sign up')
    expect(signUpButton).toBeTruthy() // Aseguramos que encontró el botón
    await signUpButton.trigger('click')

    expect(window.location.href).toBe('/SignUp')
  })
})
