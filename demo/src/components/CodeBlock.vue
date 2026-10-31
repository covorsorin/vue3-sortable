<script setup>
import { computed, ref } from 'vue'
import { tokenize } from '../modules/utils/highlight.js'

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: null
  }
})

const tokens = computed(() => tokenize(props.code))
const isCopied = ref(false)
let copiedTimeout = null

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
  } catch {
    return
  }

  isCopied.value = true
  clearTimeout(copiedTimeout)
  copiedTimeout = setTimeout(() => {
    isCopied.value = false
  }, 1500)
}
</script>

<template>
  <div class="code" :class="{ 'code-inline': !title }">
    <div v-if="title" class="code-header">
      <span>{{ title }}</span>
      <button class="button button-quiet" type="button" @click="copy">{{ isCopied ? 'Copied' : 'Copy' }}</button>
    </div>
    <pre><code><span
      v-for="(token, index) in tokens"
      :key="index"
      :class="token.type && `token-${token.type}`"
    >{{ token.text }}</span></code></pre>
    <button v-if="!title" class="button button-quiet" type="button" @click="copy">{{ isCopied ? 'Copied' : 'Copy' }}</button>
  </div>
</template>
