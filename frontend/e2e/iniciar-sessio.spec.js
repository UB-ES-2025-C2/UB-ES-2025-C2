import { expect, test } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const CREDENTIALS = {
  username: 'admin',
  password: 'admin1234+',
}

test('Iniciar sessió, validar credencials i tancar sessió', async ({ page }) => {

  // Accedir a la pàgina de login
  await page.goto(`${BASE_URL}/login`)

  // Login amb credencials correctes
  await page.fill('input#identifier', CREDENTIALS.username)
  await page.fill('input#password', CREDENTIALS.password)
  await page.click('button:has-text("Iniciar Sessió")')

  // Comprovar redirecció i imatge de perfil
  await page.waitForURL(BASE_URL + '/')
  const profileImg = page.locator('button[aria-label="User menu"] img')
  await expect(profileImg).toBeVisible({ timeout: 10000 })

  // Login amb credencials incorrectes
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input#identifier', 'usuari_incorrecte')
  await page.fill('input#password', '1234')
  await page.click('button:has-text("Iniciar Sessió")')

  // Intentar enviar formulari amb camps buits
  await page.goto(`${BASE_URL}/login`)
  await page.click('button:has-text("Iniciar Sessió")')
  await expect(page).toHaveURL(`${BASE_URL}/login`)

  // Tornar a login correcte abans de fer logout
  await page.fill('input#identifier', CREDENTIALS.username)
  await page.fill('input#password', CREDENTIALS.password)
  await page.click('button:has-text("Iniciar Sessió")')
  await page.waitForURL(BASE_URL + '/')
  await expect(profileImg).toBeVisible({ timeout: 10000 })

  // Logout amb modal
  const userMenuBtn = page.locator('button[aria-label="User menu"]')
  await expect(userMenuBtn).toBeVisible({ timeout: 10000 })
  await userMenuBtn.click()

  // Esperar menú i clicar "Tancar sessió" del menú
  const logoutMenuBtn = page.locator('.menu-item.danger', { hasText: 'Tancar sessió' })
  await expect(logoutMenuBtn).toBeVisible({ timeout: 5000 })
  await logoutMenuBtn.click()

  // Esperar el modal de confirmació i clicar "Tancar sessió"
  const confirmLogoutBtn = page.locator('.modal-actions button.btn-confirm', {
    hasText: 'Tancar sessió',
  })
  await expect(confirmLogoutBtn).toBeVisible({ timeout: 5000 })
  await confirmLogoutBtn.click()

  // Comprovar que tornem a home i que apareix "Iniciar sessió"
  await page.waitForURL(BASE_URL + '/')
  await expect(page.locator('button:has-text("Iniciar Sessió")')).toBeVisible()
})
