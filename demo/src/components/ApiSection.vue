<script setup>
import CodeBlock from './CodeBlock.vue'
import webTypes from '../../../web-types.json'

const component = webTypes.contributions.html['vue-components'][0]

const usage = `<script setup>
import { ref } from 'vue'
import { AppSortable } from 'vue3-sortable'

const items = ref([
  { id: 1, name: 'First' },
  { id: 2, name: 'Second' }
])
<\/script>

<template>
  <AppSortable v-model="items" item-key="id">
    <template #item="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </AppSortable>
</template>`

const notes = [
  'Items in a list should all be the same size. Use padding on the item instead of margins for gaps.',
  'Leave padding off the scrolling container, since item positions are calculated from its edge.',
  'Sorting happens within one list. Dragging between lists and grid layouts are not supported.',
  'Reordering works with a pointer only, so offer another way to reorder if keyboard users need it.'
]
</script>

<template>
  <section id="api" class="section container">
    <header class="section-header">
      <h2>API</h2>
      <p>{{ component.description }}</p>
    </header>

    <div class="api-usage">
      <CodeBlock title="Quick start" :code="usage" />

      <div class="notes">
        <h3>Good to know</h3>
        <ul>
          <li v-for="note in notes" :key="note">{{ note }}</li>
        </ul>
      </div>
    </div>

    <h3 class="api-heading">Props</h3>
    <div class="api-list">
      <div v-for="attribute in component.attributes" :key="attribute.name" class="api-row">
        <div class="api-signature">
          <code class="api-name">{{ attribute.name }}</code>
          <span v-if="attribute.required" class="api-required">required</span>
          <code class="api-type">{{ attribute.value.type }}</code>
          <span v-if="attribute.default" class="api-default">Default <code>{{ attribute.default }}</code></span>
        </div>
        <p>
          <template v-for="(part, index) in attribute.description.split('`')" :key="index">
            <code v-if="index % 2">{{ part }}</code>
            <template v-else>{{ part }}</template>
          </template>
        </p>
      </div>
    </div>

    <h3 class="api-heading">Events</h3>
    <div class="api-list">
      <div v-for="event in component.js.events" :key="event.name" class="api-row">
        <div class="api-signature">
          <code class="api-name">@{{ event.name }}</code>
        </div>
        <p>
          {{ event.description }}
          <template v-for="argument in event.arguments" :key="argument.name">{{ argument.description }}</template>
        </p>
      </div>
    </div>

    <h3 class="api-heading">Slots</h3>
    <div class="api-list">
      <div v-for="slot in component.slots" :key="slot.name" class="api-row">
        <div class="api-signature">
          <code class="api-name">#{{ slot.name }}</code>
          <code v-for="property in slot['vue-properties']" :key="property.name" class="api-type">{{ property.name }}</code>
        </div>
        <p>{{ slot.description }}</p>
      </div>
    </div>
  </section>
</template>
