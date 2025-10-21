# MusicSpace

This template should help get you started developing with Vue 3 in Vite.
The template uses Vue 3 `<script setup>` SFCs,
check out the [script setup docs][Vue script setup docs] to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide].


## Recommended IDE Setup

[VS Code] + [Vue (Official)][Vue Extension] (and disable Vetur).


## Recommended Browser Setup

* Chromium-based browsers (Chrome, Edge, Brave, etc.):
  + [Vue.js devtools Chrome]
  + [Turn on Custom Object Formatter in Chrome DevTools][Chrome DevTools Object Formatter]
* Firefox:
  + [Vue.js devtools Firefox]
  + [Turn on Custom Object Formatter in Firefox DevTools][Firefox DevTools Object Formatter]


## Customize configuration

See [Vite Configuration Reference].


## Project Setup

```sh
npm install
```


### Compile and Hot-Reload for Development

```sh
npm run dev
```


### Compile and Minify for Production

```sh
npm run build
```


### Run Unit Tests with [Vitest]

```sh
npm run test:unit
```


### Run End-to-End Tests with [Playwright]

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```


### Lint with [ESLint]

```sh
npm run lint
```


[Chrome DevTools Object Formatter]: http://bit.ly/object-formatters
[ESLint]: https://eslint.org/
[Firefox DevTools Object Formatter]: https://fxdx.dev/firefox-devtools-custom-object-formatters/
[Playwright]: https://playwright.dev/
[Vite Configuration Reference]: https://vite.dev/config/
[Vitest]: https://vitest.dev/
[VS Code]: https://code.visualstudio.com/
[Vue Docs Scaling up Guide]: https://vuejs.org/guide/scaling-up/tooling.html#ide-support
[Vue Extension]: https://marketplace.visualstudio.com/items?itemName=Vue.volar
[Vue script setup docs]: https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
[Vue.js devtools Chrome]: https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
[Vue.js devtools Firefox]: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/
