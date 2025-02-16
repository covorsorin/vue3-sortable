<script setup>
import AppSortable from '../../src/components/AppSortable.vue'

import { ref } from 'vue'
import { getRandomColor } from './modules/utils/utils.js'

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
}

function addRandomItem(list) {
  const index = Math.floor(Math.random() * (list.length + 1))
  list.splice(index, 0, createItem())
}

function getKey(item) {
  return item.id
}

const horizontalList = ref(Array.from(Array(5).keys()).map(index => createItem()))
const verticalList = ref(Array.from(Array(5).keys()).map(index => createItem()))
</script>

<template>
  <h3>Vertical list</h3>

  <div class="mb-8">
    <button class="mr-8" @click="addItem(verticalList)">Add</button>
    <button @click="addRandomItem(verticalList)">Add in random order</button>
  </div>

  <AppSortable
    v-model="verticalList"
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
    <button class="mr-8" @click="addItem(horizontalList)">Add</button>
    <button @click="addRandomItem(horizontalList)">Add in random order</button>
  </div>

  <AppSortable
    v-model="horizontalList"
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
