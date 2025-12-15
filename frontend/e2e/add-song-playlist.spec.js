// 1. IMPORTACIÓ ESTÀNDARD
import { test, expect } from '@playwright/test'

// --- ELIMINAT: const BASE_URL = ... (Playwright ja ho sap pel config) ---

<<<<<<< HEAD
// 2. CREDENCIALS FIXES
const CREDENTIALS = {
  username: 'admin',
  password: 'admin1234+',
}
=======
test('Afegir una cançó a la playlist i comprovar backend', async ({ page, request }) => {
  // Login amb usuari hardcodejat
  const username = 'admin'
  const password = 'admin123'
>>>>>>> b2f9ce350617fd4bdd9edaa07c09c6904d99d7c7

test.beforeEach(async ({ page }) => {
  // 3. Login manual (Ruta Relativa)
  // Playwright afegirà automàticament localhost:5173, localhost:4173 o la URL d'Azure

  // --- BLOC DE DEBUG ---
  // Esperem 2 segons per donar temps a que carregui alguna cosa
  await page.waitForTimeout(2000)

  console.log('>>> Títol de la pàgina:', await page.title())
  console.log('>>> URL actual:', page.url())

  // Això ens dirà si React/Vue s'ha muntat o si està buit
  const bodyContent = await page.innerHTML('body')
  console.log('>>> Contingut del Body (Primers 500 caràcters):', bodyContent.substring(0, 500))
  // ---------------------

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
  const owner = '1'

  await page.getByLabel('Nom:').fill(nom)
  await page.getByLabel('Descripció:').fill(descripcio)
  await page.getByLabel('Tema:').fill(tema)
  await page.getByLabel('Owners (IDs separats per coma):').fill(owner)

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
  const owner = '1'

  await page.getByLabel('Descripció:').fill(descripcio)
  await page.getByLabel('Owners (IDs separats per coma):').fill(owner)

  const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
  await createBtn.click()

  const errorMsg = page.locator('.error')
  await expect(errorMsg).toHaveText('El nom i el tema són obligatoris.')
})

test('Error si falta Descripció o Owners', async ({ page }) => {
  const nom = 'Playlist Error'
  const tema = 'Rock'

  await page.getByLabel('Nom:').fill(nom)
  await page.getByLabel('Tema:').fill(tema)

  const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
  await createBtn.click()

  const errorMsg = page.locator('.error')
  await expect(errorMsg).toHaveText(/Error/i)
})
