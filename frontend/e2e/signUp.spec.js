import { test, expect } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

test.describe('Registro de usuario', () => {
  const fakeUser = {
    username: 'usuari_1',
    password: 'password123Segur!',
  }

  test('Falla si no rellenas todos los campos', async ({ page }) => {
    await page.goto(`${BASE_URL}/SignUp`)

    // Afegeixo { force: true } per arreglar el timeout de Webkit
    await page.click('button:has-text("Registra\'t")', { force: true })

    const errorMsg = page.locator('.form-error', { hasText: "Has d'omplir tots els camps" })
    await expect(errorMsg).toBeVisible()
  })

  test('Registrar-se: registre correcte', async ({ page }) => {
    await page.goto(`${BASE_URL}/SignUp`)

    const newEmail = `nou_${Date.now()}@mail.com`
    const newUsername = fakeUser.username + Date.now()

    await page.waitForSelector('#username')
    await page.fill('#username', newUsername)
    await page.fill('#email', newEmail)
    await page.fill('#password', fakeUser.password)
    await page.fill('#password_conf', fakeUser.password)

    await page.click('button:has-text("Registra\'t")')
  })

  test('Correo electrónico inválido', async ({ page }) => {
    await page.goto(`${BASE_URL}/SignUp`)

    await page.fill('#username', fakeUser.username + '_invalid')
    await page.fill('#email', 'correo-invalido')
    await page.fill('#password', fakeUser.password)
    await page.fill('#password_conf', fakeUser.password)

    await page.click('button:has-text("Registra\'t")')

    const errorMsg = page.locator('.form-error', { hasText: 'El correu electrònic no és vàlid' })
    await expect(errorMsg).toBeVisible()
  })

  test('Contraseñas no coinciden mientras rellenas', async ({ page }) => {
    await page.goto(`${BASE_URL}/SignUp`)

    await page.fill('#username', fakeUser.username + '_pwd')
    await page.fill('#email', `nou_${Date.now()}@mail.com`)
    await page.fill('#password', fakeUser.password)

    await page.fill('#password_conf', 'otra')
    const errorMsg = page.locator('.error', { hasText: 'Les contrasenyes no coincideixen.' })
    await expect(errorMsg).toBeVisible()

    await page.fill('#password_conf', fakeUser.password)
    await expect(errorMsg).toHaveCount(0)
  })
})
