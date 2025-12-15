import { expect, test } from '@playwright/test'
import _fs from 'fs'
import _path from 'path'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const _API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

test.beforeEach(async ({ page }) => {
  const { username, password } = testUser
  // Obre la pàgina de login
  await page.goto(`${BASE_URL}/login`)

  // Escriu credencials i submit
  await page.fill('input#identifier', username)
  await page.fill('input#password', password)
  await page.click('button:has-text("Iniciar Sessió")')

  // Espera que el login redirigeixi a Home
  await page.waitForURL(BASE_URL + '/')

  // Obrir formulari de crear playlist
  await page.click('text=+ Crear Playlist')
  await page.waitForURL(`${BASE_URL}/createPlayList`)
})

test('Crear playlist correctamente', async ({ page }) => {
  // Omplir formulari
  const nom = 'Playlist de Test'
  const descripcio = 'Aquesta és una playlist de test'
  const tema = 'Pop'

  await page.getByLabel('Nom:').fill(nom)
  await page.getByLabel('Descripció:').fill(descripcio)
  await page.getByLabel('Tema:').fill(tema)

  // Enviar formulari
  //await page.click('button:has-text("Crear Playlist")')
  const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
  await expect(createBtn).toBeEnabled()
  await createBtn.click()

  // Comprovar que retorna a la pàgina principal
  // await page.goto(BASE_URL + '/')
  await page.waitForURL(BASE_URL + '/')
  //await expect(page.locator('text=Playlist de Test')).toBeVisible()
})

test('Error si falta Nom o Tema', async ({ page }) => {
  const descripcio = 'Descripció sense nom ni tema'
  // Omplir formulari sense nom i tema
  await page.getByLabel('Descripció:').fill(descripcio)

  // Intentar enviar formulari
  //await page.click('button:has-text("Crear Playlist")')
  const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
  await expect(createBtn).toBeEnabled()
  await createBtn.click()

  // Validar missatge d'error
  const errorMsg = page.locator('.error')
  await expect(errorMsg).toHaveText('El nom i el tema són obligatoris.')
})
