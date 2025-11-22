// tests/e2e/edit-profile-error.spec.js
import { test, expect } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const TEST_USER = {
  username: process.env.TEST_USER || 'usuariTest',
  password: process.env.TEST_PASS || '1234',
}

test('Mostrar missatge d’error quan el backend falla al desar la descripció', async ({ page }) => {
  // 1️⃣ Login
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input#identifier', TEST_USER.username)
  await page.fill('input#password', TEST_USER.password)
  await page.click('button:has-text("Iniciar Sessió")')
  await page.waitForURL(BASE_URL + '/')

  // 2️⃣ Navegar fins al perfil
  await page.click('button[aria-label="User menu"]')
  await page.click('text=El teu perfil')
  await expect(page).toHaveURL(/\/profile\/\d+/)

  // 3️⃣ Anar a "Editar Perfil"
  await page.click('text=Editar Perfil')
  await page.waitForURL(/\/profile\/edit\/\d+/)

  // 4️⃣ Interceptar i forçar error del backend
  await page.route('**/api/v1/userprofile/*', (route) => {
    route.abort('failed') // simulem un error de connexió
  })

  // 5️⃣ Intentar editar descripció
  await page.waitForSelector('textarea[name="description"]')
  await page.fill('textarea[name="description"]', 'Nova descripció fallida')

  // 6️⃣ Intentar desar → backend falla
  await page.click('button:has-text("Desar canvis")')

  // 7️⃣ Comprovar que surt el missatge d’error
  await expect(page.locator('text=Error al desar el perfil.')).toBeVisible()
})
