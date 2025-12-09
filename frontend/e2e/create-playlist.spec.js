import { expect } from '@playwright/test'
import { test } from './fixtures/testUser.js'
import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

test.beforeEach(async ({ page, testUser }) => {
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
    const owner = '1'

    await page.getByLabel('Nom:').fill(nom)
    await page.getByLabel('Descripció:').fill(descripcio)
    await page.getByLabel('Tema:').fill(tema)
    await page.getByLabel('Owners (IDs separats per coma):').fill(owner)

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
    const owner = '1'
    // Omplir formulari sense nom i tema
    await page.getByLabel('Descripció:').fill(descripcio)
    await page.getByLabel('Owners (IDs separats per coma):').fill(owner)

    // Intentar enviar formulari
    //await page.click('button:has-text("Crear Playlist")')
    const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
    await expect(createBtn).toBeEnabled()
    await createBtn.click()

    // Validar missatge d'error
    const errorMsg = page.locator('.error')
    await expect(errorMsg).toHaveText('El nom i el tema són obligatoris.')
})

test('Error si falta Descripció o Owners', async ({ page }) => {
    const nom = 'Playlist Sense Descripcio ni Owners'
    const tema = 'Rock'

    // Omplir formulari sense descripció i owners
    await page.getByLabel('Nom:').fill(nom)
    await page.getByLabel('Tema:').fill(tema)

    // Intentar enviar formulari
    const createBtn = page.getByRole('button', { name: 'Crear Playlist', exact: true })
    await expect(createBtn).toBeEnabled()
    await createBtn.click()

    const errorMsg = page.locator('.error')
    await expect(errorMsg).toHaveText('Error en crear la playlist.')
})
