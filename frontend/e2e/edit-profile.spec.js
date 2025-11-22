// tests/e2e/edit-profile-ui.spec.js
import { test, expect } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const TEST_USER = {
  username: process.env.TEST_USER || 'usuariTest',
  password: process.env.TEST_PASS || '1234',
}

test('Modificar descripció del perfil via UI', async ({ page }) => {
  // 1️⃣ Obre la pàgina de login
  await page.goto(`${BASE_URL}/login`)

  // 2️⃣ Escriu credencials i submit
  await page.fill('input#identifier', TEST_USER.username)
  await page.fill('input#password', TEST_USER.password)
  await page.click('button:has-text("Iniciar Sessió")')

  // 3️⃣ Espera que el login redirigeixi a Home
  await page.waitForURL(BASE_URL + '/')

  // 4️⃣ Obre el menú d’usuari i clica "El teu perfil"
  await page.click('button[aria-label="User menu"]')
  await page.click('text=El teu perfil')

  // 5️⃣ Comprova que estem a la pàgina de perfil
await expect(page).toHaveURL(new RegExp('/profile/\\d+'))

// Extreu l'ID de l'URL actual
const currentProfileUrl = page.url() // ex: http://localhost:5173/profile/12
const userId = currentProfileUrl.match(/\/profile\/(\d+)/)[1]

// 6️⃣ Clica "Editar Perfil"
await page.click('text=Editar Perfil')
await page.waitForURL(new RegExp('/profile/edit/\\d+'))

// 7️⃣ Canvia la descripció
const novaDescripcio = 'Aquesta és la nova descripció!'
await page.waitForFunction(() => {
  const el = document.querySelector('textarea[name="description"]')
  return el && el.value.length > 0
})
await page.fill('textarea[name="description"]', novaDescripcio)

// 8️⃣ Desar canvis
await page.click('button:has-text("Desar canvis")')

// 9️⃣ Comprova missatge de confirmació
await page.waitForSelector('text=Canvis desats correctament')

// 10️⃣ Torna al perfil i comprova la nova descripció
await page.goto(`${BASE_URL}/profile/${userId}`)
await expect(page.locator(`text=${novaDescripcio}`)).toBeVisible()
})

