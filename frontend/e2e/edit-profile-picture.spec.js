import { expect } from '@playwright/test'
import { test } from './fixtures/testUser.js'
import path from 'path'
import { fileURLToPath } from 'url'

// Convertir import.meta.url a __dirname equivalente
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

test('Modificar imatge de perfil via UI i comprovar backend', async ({ page, request }) => {
  // Login amb usuari hardcodejat
  const username = 'admin'
  const password = 'admin'
  // 1- Login
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input#identifier', username)
  await page.fill('input#password', password)
  await page.click('button:has-text("Iniciar Sessió")')
  await page.waitForURL(BASE_URL + '/')

  // 2- Anar al perfil
  await page.click('button[aria-label="User menu"]')
  await page.click('text=El teu perfil')
  await expect(page).toHaveURL(/\/profile\/\d+/)
  const currentProfileUrl = page.url()
  const userId = currentProfileUrl.match(/\/profile\/(\d+)/)[1]

  // 3- Click "Editar Perfil" amb espera explícita
  const editBtn = page.locator('button.edit-profile-btn')
  await editBtn.waitFor({ state: 'visible', timeout: 10000 })
  await editBtn.click()
  await page.waitForURL(new RegExp(`/profile/edit/${userId}`))

  // 4- Seleccionar imatge vàlida
  const filePath = path.resolve(__dirname, 'files/profile_picture.png')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(filePath)

  // 5- Guardar canvis
  const saveBtn = page.locator('button:has-text("Desar canvis")')
  await saveBtn.click()

  // 6- Comprovar missatge d'èxit
  const successLocator = page.locator('.success')
  await successLocator.waitFor({ state: 'visible', timeout: 10000 })
  await expect(successLocator).toHaveText('Canvis desats correctament!')

  // 7- Comprovar UI: imatge actualitzada
  const profilePic = page.locator('.avatar img, .user-info img')
  await expect(profilePic).toHaveAttribute('src', /profile_picture.*\.png/)

  // 8- Comprovar backend: login
  const loginRes = await request.post(`${API_URL}/api/token/`, {
    data: { username, password },
  })
  expect(loginRes.ok()).toBeTruthy()
  const accessToken = (await loginRes.json()).access

  // 9- Obtenir perfil desde backend
  const userRes = await request.get(`${API_URL}/api/v1/userprofile/${userId}/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  expect(userRes.ok()).toBeTruthy()
  const user = await userRes.json()

  // 10- Comprovar que la imatge coincideix
  expect(user.profilePic).toContain('profile_picture')
})
