import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true, // Adds "types" to package.json if needed
      rollupTypes: true,
    })
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'index.js'),
      name: 'AppSortable',
      fileName: "vue3-sortable-lib"
    },
    rolldownOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
