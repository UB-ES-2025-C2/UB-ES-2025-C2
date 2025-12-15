import { expect, test } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

test('Flux complet: Buscar una cançó, filtrar i obrir-la', async ({ page }) => {
  // 0️⃣ Dades de prova
  // Posa aquí una part del títol d'una cançó que sàpigues que existeix.
  // Als logs anteriors veia que tenies una "Cançó de test".
  const searchTerm = 'test'

  // -----------------------------------------------------------
  // 1️⃣ LOGIN (Pas estàndard)
  // -----------------------------------------------------------
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input#identifier', 'admin')
  await page.fill('input#password', 'admin')
  await page.click('button:has-text("Iniciar Sessió")')
  await page.waitForURL(BASE_URL + '/')

  // -----------------------------------------------------------
  // 2️⃣ ÚS DEL BUSCADOR
  // -----------------------------------------------------------
  const searchInput = page.locator('input[type="search"]')

  // Assegurem que l'input és visible
  await expect(searchInput).toBeVisible()

  // Escrivim i premem Enter
  await searchInput.fill(searchTerm)
  await searchInput.press('Enter')

  // Esperem que la URL canvïi per incloure la query
  // El teu router fa: /search?q=...
  await page.waitForURL(/.*\/search\?q=/)

  // -----------------------------------------------------------
  // 3️⃣ FILTRAT PER PESTANYA "CANÇONS"
  // -----------------------------------------------------------
  // Al teu codi tens: <button class="tab">Cançons</button>
  // Cliquem exactament aquest botó per assegurar que el filtre funciona
  await page.click('button.tab:has-text("Cançons")')

  // Opcional: Comprovar que la pestanya ha quedat activa (classe .active)
  const songTab = page.locator('button.tab:has-text("Cançons")')
  await expect(songTab).toHaveClass(/active/)

  // -----------------------------------------------------------
  // 4️⃣ SELECCIÓ I CLIC A LA CANÇÓ
  // -----------------------------------------------------------
  // El teu codi genera: <li class="song-card">
  // Esperem que aparegui almenys una targeta
  const firstSong = page.locator('.song-card').first()

  // Esperem que sigui visible (Playwright esperarà automàticament si l'API triga)
  await expect(firstSong).toBeVisible()

  // Comprovem que el text de la targeta conté el que hem buscat (o part d'ell)
  // (Nota: ignora majúscules/minúscules amb { ignoreCase: true })
  await expect(firstSong).toContainText(searchTerm, { ignoreCase: true })

  // Cliquem la cançó
  await firstSong.click()

  // -----------------------------------------------------------
  // 5️⃣ VALIDACIÓ FINAL
  // -----------------------------------------------------------
  // El teu mètode goToSong fa: router.push({ name: "song-by-id", params: { id } })
  // Normalment això genera una URL tipus /song/123 o /song-by-id/123
  // Comprovem que ja no estem a /search
  await expect(page).not.toHaveURL(/.*\/search/)

  // Comprovem que la URL conté algun ID numèric o la paraula 'song'
  // Ajusta aquesta Regex segons la teva ruta real. Si és /song/23, això funciona:
  await page.waitForURL(/.*\/song.*/)

  console.log(`✅ Test passat: Cançó '${searchTerm}' trobada i oberta correctament.`)
})
