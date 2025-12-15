import { expect, test } from '@playwright/test'

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

test('Flux complet: Buscar una playlist, filtrar i obrir-la', async ({ page }) => {
  // 0️⃣ Dades de prova
  // Posa aquí el nom d'una playlist que tinguis creada a la Base de Dades.
  // Si encara no tens playlists reals i uses les "mock" del codi Vue, busca "Playlist de prueba".
  const searchTerm = 'Test'

  // -----------------------------------------------------------
  //  LOGIN
  // -----------------------------------------------------------
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input#identifier', 'admin')
  await page.fill('input#password', 'admin1234+')
  await page.click('button:has-text("Iniciar Sessió")')
  await page.waitForURL(BASE_URL + '/')

  // -----------------------------------------------------------
  //  CERCA
  // -----------------------------------------------------------
  const searchInput = page.locator('input[type="search"]')
  await expect(searchInput).toBeVisible()

  await searchInput.fill(searchTerm)
  await searchInput.press('Enter')

  // Esperem la redirecció a /search
  await page.waitForURL(/.*\/search\?q=/)

  // -----------------------------------------------------------
  // FILTRAT PER PESTANYA "PLAYLISTS"
  // -----------------------------------------------------------
  // Al teu Search.vue tens: <button ...>Playlists</button>
  // Cliquem per filtrar només playlists
  await page.click('button.tab:has-text("Playlists")')

  // Verifiquem visualment que la pestanya està activa
  const playlistTab = page.locator('button.tab:has-text("Playlists")')
  await expect(playlistTab).toHaveClass(/active/)

  // -----------------------------------------------------------
  //  SELECCIÓ DEL RESULTAT
  // -----------------------------------------------------------
  // Al teu codi: <li class="playlist-card">
  const firstPlaylist = page.locator('.playlist-card').first()

  // Esperem que es carregui
  await expect(firstPlaylist).toBeVisible()

  // Opcional: Comprovar que el títol conté el text buscat
  // Al teu codi tens: <strong>{{ playlist.name }}</strong> dins la card
  await expect(firstPlaylist.locator('strong')).toContainText(searchTerm, { ignoreCase: true })

  // Cliquem
  await firstPlaylist.click()

  // -----------------------------------------------------------
  //  VALIDACIÓ NAVEGACIÓ
  // -----------------------------------------------------------
  // El teu router fa: router.push({ name: "playlist", params: { id } })
  // Això sol ser una URL tipus: /playlist/1
  await page.waitForURL(/.*\/playlist\/.+/)

  console.log(`✅ Test passat: Playlist '${searchTerm}' trobada i oberta.`)
})
