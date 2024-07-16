<script setup>
import { AppSortable } from 'vue3-sortable'

import { ref } from 'vue'
import { getRandomColor } from './modules/utils/utils.js'

const items = ref(Array.from(Array(20).keys()).map(index => ({
  id: index,
  name: `Item ${index}`,
  color: getRandomColor()
})))
</script>

<template>
  <AppSortable
    v-model="items"
    class="sortable"
    item-class="item"
    direction="vertical"
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
  height: 600px;
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
</style>
