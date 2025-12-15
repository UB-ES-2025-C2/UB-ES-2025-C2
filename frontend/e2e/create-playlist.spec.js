import { expect, test } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const CREDENTIALS = {
  username: 'admin',
  password: 'admin1234+',
}

test.beforeEach(async ({ page }) => {
  // 1. Obre la pàgina de login
  await page.goto(`/login`)

  // 2. Omple credencials i entra
  await page.fill('input#identifier', CREDENTIALS.username)
  await page.fill('input#password', CREDENTIALS.password)
  await page.click('button:has-text("Iniciar Sessió")')

  // 3. CORRECCIÓ: En lloc d'esperar la URL, esperem que aparegui el botó de la Home
  // Això confirma que el login ha anat bé i la pàgina ha carregat
  const crearButton = page.getByText(/Crear Playlist/i).first()

  // Esperem que sigui visible i cliquem
  await expect(crearButton).toBeVisible()
  await crearButton.click()

  // 4. Confirmem que som al formulari esperant veure l'input del Nom
  await expect(page.getByLabel('Nom:')).toBeVisible()
})

test('Crear playlist correctamente', async ({ page }) => {
  // Dades del test
  const nom = 'Playlist de Test'
  const descripcio = 'Aquesta és una playlist de test'
  const tema = 'Pop'

  // Omplir formulari
  await page.getByLabel('Nom:').fill(nom)
  await page.getByLabel('Descripció:').fill(descripcio)
  await page.getByLabel('Tema:').fill(tema)

  // Enviar formulari
  const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
  await expect(createBtn).toBeEnabled()
  await createBtn.click()
})

test('Error si falta Nom o Tema', async ({ page }) => {
  const descripcio = 'Descripció sense nom ni tema'

  // Omplir només la descripció
  await page.getByLabel('Descripció:').fill(descripcio)

  // Intentar enviar
  const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
  await expect(createBtn).toBeEnabled()
  await createBtn.click()

  // Validar missatge d'error
  const errorMsg = page.locator('.error')
  await expect(errorMsg).toHaveText('El nom i el tema són obligatoris.')
})
