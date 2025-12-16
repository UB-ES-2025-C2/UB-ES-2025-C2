import { expect } from '@playwright/test'
import { test } from './fixtures/testUser.js'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

test.describe('Registro de usuario', () => {

  test('Falla si no rellenas todos los campos', async ({ page }) => {
    await page.goto(`${BASE_URL}/SignUp`)

    // Click sin rellenar nada
    await page.click('button:has-text("Registra\'t")')

    // Debe aparecer mensaje de error
    const errorMsg = page.locator('.form-error', { hasText: "Has d'omplir tots els camps" })
    await expect(errorMsg).toBeVisible()
  })


  test('Registrar-se: registre correcte', async ({ page, testUser }) => {  const { username, password } = testUser
    await page.goto(`${BASE_URL}/SignUp`)

    const newEmail = `nou_${Date.now()}@mail.com`
    const newUsername = username + '_nou'

    await page.waitForSelector('#username')
    await page.fill('#username', newUsername)
    await page.fill('#email', newEmail)
    await page.fill('#password', password)
    await page.fill('#password_conf', password)

    // Click en el botó de registre
    await page.click('button:has-text("Registra\'t")')

    // Esperar la redirección suave
    await page.waitForURL(`${BASE_URL}/login`)
    await expect(page.locator('button:has-text("Iniciar Sessió")')).toBeVisible()
  })

  test('Correo electrónico inválido', async ({ page, testUser }) => {
    const { username, password } = testUser
    await page.goto(`${BASE_URL}/SignUp`)

    await page.fill('#username', username + '_nou')
    await page.fill('#email', 'correo-invalido')
    await page.fill('#password', password)
    await page.fill('#password_conf', password)
    await page.click('button:has-text("Registra\'t")')

    // Debe aparecer mensaje de error de email
    const errorMsg = page.locator('.form-error', { hasText: 'El correu electrònic no és vàlid' })
    await expect(errorMsg).toBeVisible()
  })

  test('Contraseñas no coinciden mientras rellenas', async ({ page, testUser }) => {
    const { username, password } = testUser
    await page.goto(`${BASE_URL}/SignUp`)

    await page.fill('#username', username + '_nou')
    await page.fill('#email', `nou_${Date.now()}@mail.com`)
    await page.fill('#password', password)

    // Empezar a rellenar la segunda contraseña
    await page.fill('#password_conf', 'otra')
    const errorMsg = page.locator('.error', { hasText: 'Les contrasenyes no coincideixen.' })
    await expect(errorMsg).toBeVisible()

    // Ahora que coinciden
    await page.fill('#password_conf', password)
    await expect(errorMsg).toHaveCount(0) // desaparece
  })

})
