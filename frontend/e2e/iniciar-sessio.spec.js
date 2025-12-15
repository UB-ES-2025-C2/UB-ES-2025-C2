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
  const profileImg = page.locator('button[aria-label="User menu"]')
  await page.click('text=Tancar Sessió')
  await page.click('text=Tancar sessió')

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
})
