<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['toggle', 'range', 'segment', 'select'].includes(value)
  },
  options: {
    type: Array,
    default: () => []
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const value = defineModel({ required: true })
</script>

<template>
  <label v-if="type == 'toggle'" class="control control-toggle" :class="{ 'is-disabled': disabled }">
    <span class="control-label">{{ label }}</span>
    <input v-model="value" class="switch" type="checkbox" role="switch" :disabled="disabled">
  </label>

  <label v-else-if="type == 'range'" class="control" :class="{ 'is-disabled': disabled }">
    <span class="control-row">
      <span class="control-label">{{ label }}</span>
      <output class="control-value">{{ value }}{{ unit }}</output>
    </span>
    <input v-model.number="value" type="range" :min="min" :max="max" :step="step" :disabled="disabled">
  </label>

  <label v-else-if="type == 'select'" class="control" :class="{ 'is-disabled': disabled }">
    <span class="control-label">{{ label }}</span>
    <select v-model="value" class="select" :disabled="disabled">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </label>

  <fieldset v-else class="control control-fieldset" :disabled="disabled">
    <legend class="control-label">{{ label }}</legend>
    <div class="segment">
      <label v-for="option in options" :key="option.value" class="segment-option">
        <input v-model="value" type="radio" :value="option.value">
        <span>{{ option.label }}</span>
      </label>
    </div>
  </fieldset>
</template>
