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

const items = ref(Array.from(Array(5).keys()).map(index => createItem()))

function addItem() {
  items.value.push(createItem())
}

function addRandomItem() {
  const index = Math.floor(Math.random() * (items.value.length + 1))
  items.value.splice(index, 0, createItem())
}

function getKey(item) {
  return item.id
}
</script>

<template>
  <button @click="addItem">Add an item</button>
  <button @click="addRandomItem">Add an item in random order</button>

  <AppSortable
    v-model="items"
    class="sortable"
    item-class="item"
    direction="vertical"
    transition-group-name="scale-x"
    :item-key="getKey"
  >
    <template #item="{ item }">
      <div>
        <div class="handle" :style="{ backgroundColor: item.color }"></div>
        <div>{{ item.name }}</div>
      </div>
    </template>
  </AppSortable>
</template>

<style>
.sortable {
  width: 400px;
  max-height: 400px;
  overflow-y: scroll;
}

.item {
  cursor: pointer;
  user-select: none;
  padding: 10px;
  border: 1px solid #2C3E50;
  background: #111;
}

.item > div {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.handle {
  cursor: move;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.scale-x-enter-active, .scale-x-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.scale-x-enter-from {
  opacity: 0;
  transform: scaleX(0);
}

.scale-x-leave-to {
  opacity: 0;
  transform: scaleX(0);
}
</style>
