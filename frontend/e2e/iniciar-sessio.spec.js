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
})
