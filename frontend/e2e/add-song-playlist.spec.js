// 1. IMPORTACIÓ ESTÀNDARD
import { test, expect } from '@playwright/test'

// --- ELIMINAT: const BASE_URL = ... (Playwright ja ho sap pel config) ---

// 2. CREDENCIALS FIXES
const CREDENTIALS = {
  username: 'admin',
  password: 'admin1234+',
}

test.beforeEach(async ({ page }) => {
  // 3. Login manual (Ruta Relativa)
  // Playwright afegirà automàticament localhost:5173, localhost:4173 o la URL d'Azure

  await page.goto(`/login`)

  await page.fill('input#identifier', CREDENTIALS.username)
  await page.fill('input#password', CREDENTIALS.password)
  await page.click('button:has-text("Iniciar Sessió")')

  // Esperem a estar a la home (Ruta relativa)
  await page.waitForURL('/')

  // Navegar al formulari de crear playlist
  await page.click('text=+ Crear Playlist')
  await page.waitForURL('/createPlayList')
})

// 4. TEST PRINCIPAL
test('Crear playlist correctament', async ({ page }) => {
  const nom = 'Playlist de Test Sense Fixture'
  const descripcio = 'Test independent del backend'
  const tema = 'Pop'

  await page.getByLabel('Nom:').fill(nom)
  await page.getByLabel('Descripció:').fill(descripcio)
  await page.getByLabel('Tema:').fill(tema)

  const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
  await expect(createBtn).toBeEnabled()
  await createBtn.click()

  // Validar redirecció a Home
  await page.waitForURL('/')

  // Opcional: Validar visualització
  // await expect(page.locator(`text=${nom}`)).toBeVisible()
})

test('Error si falta Nom o Tema', async ({ page }) => {
  const descripcio = 'Descripció sense nom ni tema'

  await page.getByLabel('Descripció:').fill(descripcio)

  const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
  await createBtn.click()

  const errorMsg = page.locator('.error')
  await expect(errorMsg).toHaveText('El nom i el tema són obligatoris.')
})
