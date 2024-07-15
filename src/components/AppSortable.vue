<template>
  AppSortable: {{ value }}
</template>

<script setup>
const props = defineProps({
  value: {
    required: true
  }
})
</script>
