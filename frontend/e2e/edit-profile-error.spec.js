import { expect } from '@playwright/test'
import { test } from './fixtures/testUser.js'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

test('Mostrar missatge d’error quan el backend falla al desar la descripció', async ({
  page,
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
  await page.waitForURL(new RegExp(`/profile/edit/${userId}`))

  // 7️- Interceptar i forçar error del backend
  await page.route(`**/api/v1/userprofile/${userId}/`, (route) => {
    route.abort('failed')
  })

  // 8️- Omplir nova descripció
  const novaDescripcio = 'Nova descripció fallida'
  await page.waitForSelector('textarea[name="description"]')
  await page.fill('textarea[name="description"]', novaDescripcio)

  // 9️- Intentar desar → backend falla
  await page.click('button:has-text("Desar canvis")')

  // 10️- Comprovar que surt el missatge d’error al frontend
  const errorLocator = page.locator('.error')
  await errorLocator.waitFor({ state: 'visible', timeout: 7000 })
  await expect(errorLocator).toContainText('Error al desar el perfil.')
})
