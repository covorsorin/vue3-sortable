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
    class="container"
  >
    <template #item="{ item }">
      <div class="item">
        <div class="handle" :style="{ backgroundColor: item.color }"></div>
        <div>{{ item.name }}</div>
      </div>
    </template>
  </AppSortable>
</template>

<style scoped>
.container {
  height: 600px;
  overflow: scroll;
}

.handle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #444;
  width: 200px;
  background: #111;
}

.item:hover {
  cursor: pointer;
}
</style>
