import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/vue3-sortable/',
  resolve: {
    // The component is imported from ../src, make it share the demo's copy of Vue.
    dedupe: ['vue']
  }
})
