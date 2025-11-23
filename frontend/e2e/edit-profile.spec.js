import { expect } from '@playwright/test'
import { test } from './fixtures/testUser.js'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

test('Modificar descripció del perfil via UI i comprovar backend', async ({
  page,
  request,
  testUser,
}) => {
  const { username, password } = testUser

  // 1️- Obre la pàgina de login
  await page.goto(`${BASE_URL}/login`)

  // 2️- Escriu credencials i submit
  await page.fill('input#identifier', username)
  await page.fill('input#password', password)
  await page.click('button:has-text("Iniciar Sessió")')

  // 3️- Espera que el login redirigeixi a Home
  await page.waitForURL(BASE_URL + '/')

  // 4️- Obre el menú d’usuari i clica "El teu perfil"
  await page.click('button[aria-label="User menu"]')
  await page.click('text=El teu perfil')

  // 5️- Comprova que estem a la pàgina de perfil i extreu userId
  await expect(page).toHaveURL(/\/profile\/\d+/)
  const currentProfileUrl = page.url()
  const userId = currentProfileUrl.match(/\/profile\/(\d+)/)[1]

  // 6️- Clica "Editar Perfil"
  await page.click('text=Editar Perfil')
  await page.waitForURL(/\/profile\/edit\/\d+/)

  // 7️- Canvia la descripció
  const novaDescripcio = 'Aquesta és la nova descripció!'
  await page.waitForSelector('textarea[name="description"]')
  await page.fill('textarea[name="description"]', novaDescripcio)

  // 8️- Desar canvis
  await page.click('button:has-text("Desar canvis")')

  // 9️- Comprova missatge de confirmació
  await page.waitForSelector('text=Canvis desats correctament')

  // 10️- Torna al perfil i comprova la nova descripció a la UI
  await page.goto(`${BASE_URL}/profile/${userId}`)
  await page.waitForFunction((text) => document.body.innerText.includes(text), novaDescripcio)

  // 11- Comprova el backend: login del mateix usuari
  const loginRes = await request.post(`${API_URL}/api/token/`, {
    data: { username, password },
  })

  expect(loginRes.ok()).toBeTruthy()
  const accessToken = (await loginRes.json()).access

  // 12- Demanar perfil al backend
  const userRes = await request.get(`${API_URL}/api/v1/userprofile/${userId}/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  expect(userRes.ok()).toBeTruthy()
  const user = await userRes.json()

  // 13️- Comprova que la descripció del backend coincideix
  expect(user.description).toBe(novaDescripcio)
})
