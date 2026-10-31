<script setup>
import AppSortable from '../../../src/components/AppSortable.vue'

import { computed, reactive, ref, useTemplateRef } from 'vue'
import CodeBlock from './CodeBlock.vue'
import PlaygroundControl from './PlaygroundControl.vue'
import { scrollHorizontallyToIndex, scrollVerticallyToIndex } from '../modules/utils/scroll.js'
import { createSnippet } from '../modules/utils/snippet.js'

const NAMES = [
  'Inbox', 'Design review', 'Release notes', 'Bug triage', 'Roadmap', 'User interviews',
  'Changelog', 'Accessibility pass', 'Onboarding', 'Pricing page', 'Analytics', 'Documentation'
]
const INITIAL_LENGTH = 12
const MAX_LOG_LENGTH = 40

const ACCENTS = [
  { name: 'Vermilion', value: '#d9480f' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Magenta', value: '#c026d3' },
  { name: 'Graphite', value: '#57534e' }
]

const DEFAULTS = {
  direction: 'vertical',
  useHandle: false,
  disabled: false,
  dragThreshold: 3,
  dragDelay: 150,
  dragDelayOnTouchOnly: true,
  animationDuration: 200,
  animationEasing: 'ease',
  transition: 'scale',
  autoScroll: true,
  autoScrollMargin: 50,
  autoScrollSpeed: 10,
  showScrollMargin: false,
  look: 'card',
  density: 'comfortable',
  accent: ACCENTS[0].value
}

const options = reactive({ ...DEFAULTS })

const isVertical = computed(() => options.direction == 'vertical')

const transitionGroupName = computed(() => {
  if (options.transition == 'scale') {
    return isVertical.value ? 'scale-y' : 'scale-x'
  }

  return options.transition == 'fade' ? 'fade' : null
})

const sortableProps = computed(() => ({
  direction: options.direction,
  disabled: options.disabled,
  handle: options.useHandle ? 'drag-handle' : null,
  transitionGroupName: transitionGroupName.value,
  animationDuration: options.animationDuration,
  animationEasing: options.animationEasing,
  dragThreshold: options.dragThreshold,
  dragDelay: options.dragDelay,
  dragDelayOnTouchOnly: options.dragDelayOnTouchOnly,
  autoScroll: options.autoScroll,
  autoScrollMargin: options.autoScrollMargin,
  autoScrollSpeed: options.autoScrollSpeed
}))

const snippet = computed(() => createSnippet(sortableProps.value))

function resetOptions() {
  Object.assign(options, DEFAULTS)
}

let nextId = 1

function createItem() {
  const id = nextId++
  return { id, name: NAMES[(id - 1) % NAMES.length] }
}

function createItems() {
  return Array.from({ length: INITIAL_LENGTH }, createItem)
}

const items = ref(createItems())
const sortable = useTemplateRef('sortable')

function addItem() {
  items.value.push(createItem())

  const scrollToIndex = isVertical.value ? scrollVerticallyToIndex : scrollHorizontallyToIndex
  scrollToIndex(sortable.value.$el, items.value.length - 1)
}

function removeItem(index) {
  items.value.splice(index, 1)
}

function shuffleItems() {
  const shuffled = [...items.value]

  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]]
  }

  items.value = shuffled
}

function resetItems() {
  nextId = 1
  items.value = createItems()
}

const draggingIndex = ref(null)
const log = ref([])
let nextLogId = 1

function addLog(name, payload) {
  log.value.unshift({ id: nextLogId++, name, payload })
  log.value.length = Math.min(log.value.length, MAX_LOG_LENGTH)
}

function onStart({ index }) {
  draggingIndex.value = index
  addLog('start', `index: ${index}`)
}

function onChange({ oldIndex, newIndex }) {
  addLog('change', `oldIndex: ${oldIndex}, newIndex: ${newIndex}`)
}

function onEnd({ oldIndex, newIndex, value }) {
  draggingIndex.value = null
  addLog('end', `oldIndex: ${oldIndex}, newIndex: ${newIndex}, value: [${value.length} items]`)
}

const marginStyle = computed(() => ({
  [isVertical.value ? 'height' : 'width']: `${options.autoScrollMargin}px`
}))
</script>

<template>
  <section id="playground" class="section container">
    <header class="section-header">
      <h2>Playground</h2>
      <p>Every control below is a real prop. Change one, drag an item, and copy the code when it feels right.</p>
    </header>

    <div class="playground">
      <div class="stage" :style="{ '--swatch': options.accent }">
        <div class="stage-toolbar">
          <span class="stage-count">{{ items.length }} items</span>
          <div class="stage-actions">
            <button class="button" type="button" @click="addItem">Add</button>
            <button class="button" type="button" @click="shuffleItems">Shuffle</button>
            <button class="button" type="button" @click="resetItems">Reset</button>
          </div>
        </div>

        <div class="stage-view">
          <AppSortable
            :key="options.direction"
            ref="sortable"
            v-model="items"
            v-bind="sortableProps"
            item-key="id"
            class="list"
            :class="[
              isVertical ? 'list-vertical' : 'list-horizontal',
              `look-${options.look}`,
              `density-${options.density}`,
              { 'is-disabled': options.disabled, 'has-handle': options.useHandle }
            ]"
            item-class="list-item"
            @start="onStart"
            @change="onChange"
            @end="onEnd"
          >
            <template #item="{ item, index }">
              <div class="card" :class="{ 'is-dragging': index === draggingIndex }">
                <span class="drag-handle" aria-hidden="true"></span>
                <span class="card-text">
                  <span class="card-title">{{ item.name }}</span>
                  <span class="card-meta">Item {{ item.id }}</span>
                </span>
                <button
                  class="card-remove"
                  type="button"
                  :aria-label="`Remove ${item.name}`"
                  @mousedown.stop
                  @touchstart.stop
                  @click="removeItem(index)"
                >&times;</button>
              </div>
            </template>
          </AppSortable>

          <template v-if="options.showScrollMargin">
            <div class="margin-guide" :class="isVertical ? 'margin-top' : 'margin-left'" :style="marginStyle"></div>
            <div class="margin-guide" :class="isVertical ? 'margin-bottom' : 'margin-right'" :style="marginStyle"></div>
          </template>
        </div>

        <p v-if="!items.length" class="stage-empty">The list is empty. Add an item or reset the list.</p>
      </div>

      <form class="controls" @submit.prevent>
        <div class="controls-header">
          <h3>Options</h3>
          <button class="button button-quiet" type="button" @click="resetOptions">Reset all</button>
        </div>

        <div class="control-group">
          <h4>Layout</h4>
          <PlaygroundControl
            v-model="options.direction"
            type="segment"
            label="Direction"
            :options="[{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }]"
          />
          <PlaygroundControl v-model="options.useHandle" type="toggle" label="Drag handle only" />
          <PlaygroundControl v-model="options.disabled" type="toggle" label="Disabled" />
        </div>

        <div class="control-group">
          <h4>Drag</h4>
          <PlaygroundControl v-model="options.dragThreshold" type="range" label="Threshold" :max="20" unit="px" />
          <PlaygroundControl v-model="options.dragDelay" type="range" label="Delay" :max="500" :step="10" unit="ms" />
          <PlaygroundControl v-model="options.dragDelayOnTouchOnly" type="toggle" label="Delay on touch only" />
        </div>

        <div class="control-group">
          <h4>Animation</h4>
          <PlaygroundControl v-model="options.animationDuration" type="range" label="Duration" :max="800" :step="10" unit="ms" />
          <PlaygroundControl
            v-model="options.animationEasing"
            type="select"
            label="Easing"
            :options="[
              { value: 'ease', label: 'ease' },
              { value: 'linear', label: 'linear' },
              { value: 'ease-in-out', label: 'ease-in-out' },
              { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'overshoot' }
            ]"
          />
          <PlaygroundControl
            v-model="options.transition"
            type="segment"
            label="Add and remove"
            :options="[{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade' }, { value: 'scale', label: 'Scale' }]"
          />
        </div>

        <div class="control-group">
          <h4>Auto-scroll</h4>
          <PlaygroundControl v-model="options.autoScroll" type="toggle" label="Enabled" />
          <PlaygroundControl v-model="options.autoScrollMargin" type="range" label="Margin" :min="10" :max="120" unit="px" :disabled="!options.autoScroll" />
          <PlaygroundControl v-model="options.autoScrollSpeed" type="range" label="Speed" :min="1" :max="40" :disabled="!options.autoScroll" />
          <PlaygroundControl v-model="options.showScrollMargin" type="toggle" label="Show margin guides" :disabled="!options.autoScroll" />
        </div>

        <div class="control-group">
          <h4>Item style</h4>
          <p class="control-note">Items are your own markup. These only change this page's CSS.</p>
          <PlaygroundControl
            v-model="options.look"
            type="segment"
            label="Look"
            :options="[{ value: 'card', label: 'Card' }, { value: 'outline', label: 'Outline' }, { value: 'flat', label: 'Flat' }]"
          />
          <PlaygroundControl
            v-model="options.density"
            type="segment"
            label="Density"
            :options="[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]"
          />
          <fieldset class="control control-fieldset">
            <legend class="control-label">Accent</legend>
            <div class="swatches">
              <label v-for="accent in ACCENTS" :key="accent.value" class="swatch" :style="{ '--swatch': accent.value }">
                <input v-model="options.accent" type="radio" :value="accent.value" :aria-label="accent.name">
                <span></span>
              </label>
            </div>
          </fieldset>
        </div>
      </form>

      <CodeBlock class="playground-code" title="Your configuration" :code="snippet" />

      <div class="log">
        <div class="code-header">
          <span>Events</span>
          <button class="button button-quiet" type="button" :disabled="!log.length" @click="log = []">Clear</button>
        </div>
        <ol v-if="log.length" class="log-list">
          <li v-for="entry in log" :key="entry.id">
            <span class="log-name">@{{ entry.name }}</span>
            <span class="log-payload">{{ entry.payload }}</span>
          </li>
        </ol>
        <p v-else class="log-empty">Drag an item to see its events here.</p>
      </div>
    </div>
  </section>
</template>
