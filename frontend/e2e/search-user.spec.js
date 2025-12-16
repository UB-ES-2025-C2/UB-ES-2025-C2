import { expect } from '@playwright/test'
import { test } from './fixtures/testUser.js'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

test('Buscar un usuari existent i navegar al seu perfil públic', async ({ page }) => {
  // 0️⃣ Dades de prova
  // Buscarem l'usuari 'admin' (el mateix amb el que ens loguegem) perquè sabem que existeix segur.
  const targetUser = 'admin'

  // 1️⃣ Login (Pas estàndard)
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input#identifier', 'admin')
  await page.fill('input#password', 'admin')
  await page.click('button:has-text("Iniciar Sessió")')

  // Esperem que redirigeixi a la Home (o on sigui després del login)
  await page.waitForURL(BASE_URL + '/')

  // 2️⃣ Interacció amb el Header (Buscador)
  // Segons el teu codi: <input type="search" ... />
  const searchInput = page.locator('input[type="search"]')

  // Comprovem que es veu abans d'escriure
  await expect(searchInput).toBeVisible()

  // Escrivim el nom i premem Enter (el teu form té @submit.prevent="onSubmit")
  await searchInput.fill(targetUser)
  await searchInput.press('Enter')

  // 3️⃣ Validació de la pàgina de cerca
  // El teu router fa push a: /search?q=term
  await page.waitForURL(/.*\/search\?q=admin/)

  // 4️⃣ Selecció del resultat
  // El teu codi genera: <li class="user-card">...<strong>admin</strong>...</li>
  // Busquem una targeta que contingui el text 'admin'
  const userCard = page.locator('.user-card').filter({ hasText: targetUser }).first()

  // Esperem que aparegui (pot trigar una mica si l'API és lenta)
  await expect(userCard).toBeVisible()

  // 5️⃣ Navegació al perfil de l'usuari
  await userCard.click()

  // 6️⃣ Validació final
  // El teu mètode goToUser fa: router.push({ name: "user", params: { username } })
  // Això sol generar una URL tipus /user/admin o /profile/admin.
  // Comprovem que la URL conté el nom d'usuari.
  await page.waitForURL(new RegExp(targetUser))

  console.log(`✅ Test passat: Usuari '${targetUser}' trobat i perfil obert.`)
})
