<script setup>
import AppSortable from '../../../src/components/AppSortable.vue'

import { computed, ref } from 'vue'

const tasks = ref([
  { id: 1, name: 'Draft the announcement', done: true },
  { id: 2, name: 'Update the screenshots', done: false },
  { id: 3, name: 'Review the pull request', done: false },
  { id: 4, name: 'Publish to npm', done: false },
  { id: 5, name: 'Tag the release', done: false }
])

const colors = ref(['#1f2a44', '#2f5d8a', '#3f9c9c', '#e9c46a', '#f08a4b', '#d1495b'].map((value) => ({ value })))

const gradient = computed(() => {
  return `linear-gradient(90deg, ${colors.value.map((color) => color.value).join(', ')})`
})

const fields = ref([
  { id: 'name', label: 'Full name', value: 'Ada Lovelace' },
  { id: 'email', label: 'Email', value: 'ada@example.com' },
  { id: 'role', label: 'Role', value: 'Engineer' },
  { id: 'city', label: 'City', value: 'London' }
])
</script>

<template>
  <section id="examples" class="section container">
    <header class="section-header">
      <h2>Examples</h2>
      <p>The slot renders whatever you want. Each of these is a working list, so go ahead and drag.</p>
    </header>

    <div class="examples">
      <article class="example">
        <h3>Task list</h3>
        <p>A drag handle leaves the rest of the row free for clicks, like the checkbox here.</p>
        <AppSortable v-model="tasks" item-key="id" handle="drag-handle" item-class="list-item" class="list list-vertical">
          <template #item="{ item }">
            <div class="row">
              <span class="drag-handle" aria-hidden="true"></span>
              <label class="row-task" :class="{ 'is-done': item.done }">
                <input v-model="item.done" type="checkbox">
                <span>{{ item.name }}</span>
              </label>
            </div>
          </template>
        </AppSortable>
      </article>

      <article class="example">
        <h3>Color palette</h3>
        <p>Horizontal lists work the same way, and <code>v-model</code> keeps the gradient in sync.</p>
        <AppSortable v-model="colors" item-key="value" direction="horizontal" item-class="list-item" class="list list-horizontal">
          <template #item="{ item }">
            <div class="palette-color" :style="{ backgroundColor: item.value }"></div>
          </template>
        </AppSortable>
        <div class="palette-gradient" :style="{ backgroundImage: gradient }"></div>
      </article>

      <article class="example">
        <h3>Form builder</h3>
        <p>Inputs keep their focus and text selection. Drag from anywhere around them.</p>
        <AppSortable v-model="fields" item-key="id" item-class="list-item" class="list list-vertical">
          <template #item="{ item }">
            <div class="row row-field">
              <span class="drag-handle" aria-hidden="true"></span>
              <label>
                <span>{{ item.label }}</span>
                <input v-model="item.value" class="text-input" type="text">
              </label>
            </div>
          </template>
        </AppSortable>
      </article>
    </div>
  </section>
</template>
