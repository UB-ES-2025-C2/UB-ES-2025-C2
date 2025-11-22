// tests/e2e/edit-profile-ui-backend.spec.js
import { test, expect } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

const TEST_USER = {
  username: process.env.TEST_USER || 'usuariTest',
  password: process.env.TEST_PASS || '1234',
}

test('Modificar descripció del perfil via UI i comprovar backend', async ({ page, request }) => {
  // 1️- Obre la pàgina de login
  await page.goto(`${BASE_URL}/login`)

  // 2️- Escriu credencials i submit
  await page.fill('input#identifier', TEST_USER.username)
  await page.fill('input#password', TEST_USER.password)
  await page.click('button:has-text("Iniciar Sessió")')

  // 3️- Espera que el login redirigeixi a Home
  await page.waitForURL(BASE_URL + '/')

  // 4️- Obre el menú d’usuari i clica "El teu perfil"
  await page.click('button[aria-label="User menu"]')
  await page.click('text=El teu perfil')

  // 5️- Comprova que estem a la pàgina de perfil i extreu userId
  await expect(page).toHaveURL(new RegExp('/profile/\\d+'))
  const currentProfileUrl = page.url() // ex: http://localhost:5173/profile/12
  const userId = currentProfileUrl.match(/\/profile\/(\d+)/)[1]

  // 6️- Clica "Editar Perfil"
  await page.click('text=Editar Perfil')
  await page.waitForURL(new RegExp('/profile/edit/\\d+'))

  // 7️- Canvia la descripció
  const novaDescripcio = 'Aquesta és la nova descripció!'
  await page.waitForFunction(() => {
    const el = document.querySelector('textarea[name="description"]')
    return el && el.value.length > 0
  })
  await page.fill('textarea[name="description"]', novaDescripcio)

  // 8️- Desar canvis
  await page.click('button:has-text("Desar canvis")')

  // 9️- Comprova missatge de confirmació
  await page.waitForSelector('text=Canvis desats correctament')

  // 10️- Torna al perfil i comprova la nova descripció a la UI
  await page.goto(`${BASE_URL}/profile/${userId}`)
  await expect(page.locator(`text=${novaDescripcio}`)).toBeVisible()

  // 11- Comprova el backend: agafa l'usuari via API
  const loginRes = await request.post(`${API_URL}/api/token/`, {
    data: TEST_USER,
  })
  expect(loginRes.ok()).toBeTruthy()
  const accessToken = (await loginRes.json()).access
  expect(accessToken).toBeTruthy()

  const userRes = await request.get(`${API_URL}/api/v1/userprofile/${userId}/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  expect(userRes.ok()).toBeTruthy()
  const user = await userRes.json()

  // 12️- Comprova que la descripció del backend coincideix amb la UI
  expect(user.description).toBe(novaDescripcio)
})
