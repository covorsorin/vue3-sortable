<script setup>
import AppSortable from '../../src/components/AppSortable.vue'

import { ref, useTemplateRef } from 'vue'
import { getRandomColor } from './modules/utils/utils.js'
import { scrollHorizontallyToIndex, scrollVerticallyToIndex } from './modules/utils/scroll.js'

const verticalListRef = useTemplateRef('verticalListRef')
const horizontalListRef = useTemplateRef('horizontalListRef')

const horizontalList = ref(Array.from(Array(5).keys()).map(index => createItem()))
const verticalList = ref(Array.from(Array(5).keys()).map(index => createItem()))

function getKey(item) {
  return item.id
}

function createItem() {
  const id = window.crypto.randomUUID()

  return {
    id,
    name: `Item ${id.slice(0, 8)}`,
    color: getRandomColor()
  }
}

function removeItem(list, index) {
  list.splice(index, 1)
}

function addItem(list) {
  list.push(createItem())
  return list.length
}

function addRandomItem(list) {
  const index = Math.floor(Math.random() * (list.length + 1))
  list.splice(index, 0, createItem())
  return index
}

function addVerticalItem() {
  const index = addItem(verticalList.value)
  scrollVerticallyToIndex(verticalListRef.value.$el, index)
}

function addRandomVerticalItem() {
  const index = addRandomItem(verticalList.value)
  scrollVerticallyToIndex(verticalListRef.value.$el, index)
}

function addHorizontalItem() {
  const index = addItem(horizontalList.value)
  scrollHorizontallyToIndex(horizontalListRef.value.$el, index)
}

function addRandomHorizontalItem() {
  const index = addRandomItem(horizontalList.value)
  scrollHorizontallyToIndex(horizontalListRef.value.$el, index)
}
</script>

<template>
  <h3>Vertical list</h3>

  <div class="mb-8">
    <button class="mr-8" @click="addVerticalItem">Add</button>
    <button @click="addRandomVerticalItem">Add in random order</button>
  </div>

  <AppSortable
    v-model="verticalList"
    ref="verticalListRef"
    class="sortable-vertical"
    item-class="item"
    handle="handle"
    direction="vertical"
    transition-group-name="scale-y"
    :item-key="getKey"
  >
    <template #item="{ item, index }">
      <div>
        <div class="handle mr-8" :style="{ backgroundColor: item.color }"></div>
        <div>{{ item.name }}</div>
        <button @click="removeItem(verticalList, index)">Remove</button>
      </div>
    </template>
  </AppSortable>

  <h3>Horizontal list</h3>

  <div class="mb-8">
    <button class="mr-8" @click="addHorizontalItem">Add</button>
    <button @click="addRandomHorizontalItem">Add in random order</button>
  </div>

  <AppSortable
    v-model="horizontalList"
    ref="horizontalListRef"
    class="sortable-horizontal"
    item-class="item"
    handle="handle"
    direction="horizontal"
    transition-group-name="scale-x"
    :item-key="getKey"
  >
    <template #item="{ item, index }">
      <div>
        <div class="handle" :style="{ backgroundColor: item.color }"></div>
        <div>{{ item.name }}</div>
        <button @click="removeItem(horizontalList, index)">Remove</button>
      </div>
    </template>
  </AppSortable>
</template>

<style src="./stylesheets/main.css" />
