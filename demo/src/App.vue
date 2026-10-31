<script setup>
import { onMounted, ref, watch } from 'vue'
import pkg from '../../package.json'
import CodeBlock from './components/CodeBlock.vue'
import PlaygroundSection from './components/PlaygroundSection.vue'
import ExamplesSection from './components/ExamplesSection.vue'
import ApiSection from './components/ApiSection.vue'

const GITHUB_URL = 'https://github.com/CovorSorin/vue3-sortable'
const NPM_URL = 'https://www.npmjs.com/package/vue3-sortable'
const THEME_KEY = 'vue3-sortable-theme'

const features = [
  { value: '3 kB', label: 'gzipped' },
  { value: '0', label: 'dependencies' },
  { value: '2', label: 'directions' },
  { value: 'Touch', label: 'and mouse' }
]

const theme = ref(null)

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}

function toggleTheme() {
  const current = theme.value
    ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  theme.value = current == 'dark' ? 'light' : 'dark'

  try {
    localStorage.setItem(THEME_KEY, theme.value)
  } catch {
    // The choice just won't be remembered.
  }
}

watch(theme, (value) => {
  if (value) {
    document.documentElement.dataset.theme = value
  }
})

onMounted(() => {
  theme.value = readStoredTheme()
})
</script>

<template>
  <header class="nav">
    <div class="container nav-inner">
      <a class="nav-brand" href="#top">
        vue3-sortable
        <span class="nav-version">v{{ pkg.version }}</span>
      </a>

      <nav class="nav-links" aria-label="Main">
        <a class="nav-section-link" href="#playground">Playground</a>
        <a class="nav-section-link" href="#examples">Examples</a>
        <a class="nav-section-link" href="#api">API</a>
        <a :href="GITHUB_URL">GitHub</a>
        <a :href="NPM_URL">npm</a>
        <button class="button button-quiet" type="button" @click="toggleTheme">Theme</button>
      </nav>
    </div>
  </header>

  <main id="top">
    <section class="hero container">
      <h1>Sortable lists for Vue&nbsp;3, and nothing else.</h1>
      <p class="hero-lead">
        One small component with no dependencies. Bind a list with <code>v-model</code>,
        render your own items in a slot, and drag them with a mouse or a finger.
      </p>

      <div class="hero-install">
        <CodeBlock code="npm i vue3-sortable" />
      </div>

      <dl class="stats">
        <div v-for="feature in features" :key="feature.label" class="stat">
          <dt>{{ feature.label }}</dt>
          <dd>{{ feature.value }}</dd>
        </div>
      </dl>
    </section>

    <PlaygroundSection />
    <ExamplesSection />
    <ApiSection />
  </main>

  <footer class="footer">
    <div class="container footer-inner">
      <span>MIT licensed. Developed for the Pigments app.</span>
      <span class="footer-links">
        <a :href="GITHUB_URL">GitHub</a>
        <a :href="`${GITHUB_URL}/issues`">Issues</a>
        <a :href="NPM_URL">npm</a>
      </span>
    </div>
  </footer>
</template>
