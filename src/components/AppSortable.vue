<template>
  <div
    ref="sortable"
    @wheel="onWheel"
  >
    <TransitionGroup
      :name="transitionGroupName"
    >
      <div
        v-for="(item, index) in items"
        :key="itemKeys[index]"
        :style="styles[index]"
        :class="itemClass"
        @mousedown="onDragStart($event, index)"
        @touchstart="onDragStart($event, index)"
        @click.capture="onItemClick($event)"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { clamp, getEventPosition, getRelativeEventPosition } from '../modules/utils/mouse.js'
import { getElementBounds, hasClassUpToParent, isBetween, moveArrayElement } from '../modules/utils/utils.js'

const props = defineProps({
  direction: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal'].includes(value)
  },
  itemKey: {
    type: [Function, String],
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  handle: {
    type: String,
    default: null
  },
  itemClass: {
    type: String,
    default: null
  },
  transitionGroupName: {
    type: String,
    default: null
  },
  animationDuration: {
    type: Number,
    default: 200
  },
  animationEasing: {
    type: String,
    default: 'ease'
  },
  dragThreshold: {
    type: Number,
    default: 3
  },
  dragDelay: {
    type: Number,
    default: 150
  },
  dragDelayOnTouchOnly: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  autoScrollMargin: {
    type: Number,
    default: 50
  },
  autoScrollSpeed: {
    type: Number,
    default: 10
  }
})

const emits = defineEmits([
  'start',
  'end',
  'change'
])

const sortableRef = useTemplateRef('sortable')

const items = defineModel()

const itemKeys = computed(() => {
  return items.value.map((item, index) => {
    return (typeof props.itemKey == 'function')
      ? props.itemKey(item, index)
      : item[props.itemKey]
  })
})

const styles = ref(items.value.map(() => ({})))

const isVertical = computed(() => props.direction == 'vertical')
const positionKey = computed(() => isVertical.value ? 'y' : 'x')
const sizeKey = computed(() => isVertical.value ? 'offsetHeight' : 'offsetWidth')
const scrollSizeKey = computed(() => isVertical.value ? 'scrollHeight' : 'scrollWidth')
const scrollKey = computed(() => isVertical.value ? 'scrollTop' : 'scrollLeft')
const boundsStartKey = computed(() => isVertical.value ? 'top' : 'left')
const boundsEndKey = computed(() => isVertical.value ? 'bottom' : 'right')

const sortableScrollSize = ref(0)
const sortableViewSize = ref(0)

const position = ref({
  x: 0,
  y: 0
})

const isDragging = ref(false)
const initialIndex = ref(null)
const currentIndex = ref(null)
const targetDragOffset = ref(0)

// -1 for moving towards the start
//  1 for moving towards the end
const dragDirection = ref(null)

let target = null
// Whether the target was fully in view at drag start.
let wasTargetFullyInView = true
let startedDragAt = null
let isTouchEvent = false
let autoScrollAnimationRequest = null

// These values are relative to the sortable component viewport.
let initialDragPosition = null
let currentDragPosition = null
let previousDragPosition = null

function getDragDelta() {
  if (!initialDragPosition || !currentDragPosition) {
    return 0
  }

  return currentDragPosition[positionKey.value] - initialDragPosition[positionKey.value]
}

function getDragDirection() {
  if (!previousDragPosition || !currentDragPosition) {
    return null
  }

  const delta = currentDragPosition[positionKey.value] - previousDragPosition[positionKey.value]

  // If there's no movement, keep the previous direction.
  if (delta == 0) {
    return dragDirection.value
  }

  return delta > 0 ? 1 : -1
}

function onWheel(event) {
  if (isDragging.value) {
    event.preventDefault()
  }
}

function getStyle(index) {
  if (initialIndex.value === null || !isDragging.value) {
    return {}
  }

  if (index == initialIndex.value) {
    return {
      position: 'relative',
      zIndex: 1000
    }
  }

  const style = {
    transition: `transform ${props.animationDuration}ms ${props.animationEasing}`,
    transform: 'translate3d(0, 0, 0)'
  }

  if (isBetween(index, initialIndex.value, currentIndex.value)) {
    const transform = (initialIndex.value - currentIndex.value < 0) ? '-100%' : '100%'
    const transformX = isVertical.value ? 0 : transform
    const transformY = isVertical.value ? transform : 0
    style.transform = `translate3d(${transformX}, ${transformY}, 0)`
  }

  return style
}

watch(currentIndex, () => {
  styles.value = items.value.map((item, index) => getStyle(index))

  emits('change', {
    oldIndex: initialIndex.value,
    newIndex: currentIndex.value
  })
})

function onDragStart(event, index) {
  if (props.disabled) {
    return
  }

  // Ignore right click events.
  if (event.button && event.button != 0) {
    return
  }

  if (props.handle && !hasClassUpToParent(event.target, event.currentTarget, props.handle)) {
    return
  }

  isTouchEvent = event.type == 'touchstart'
  startedDragAt = performance.now()

  if (isTouchEvent) {
    document.addEventListener('touchmove', onDrag, { passive: false })
    document.addEventListener('touchend', onDragStop)
    document.addEventListener('touchcancel', onDragStop)
  } else {
    // Only prevent mouse events, otherwise click events on mobile won't register.
    event.preventDefault()

    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', onDragStop)
  }

  isDragging.value = false
  initialIndex.value = index
  dragDirection.value = null

  sortableScrollSize.value = sortableRef.value[scrollSizeKey.value]
  sortableViewSize.value = sortableRef.value[sizeKey.value]

  target = sortableRef.value.children[index]
  initialDragPosition = getEventPosition(event)
  previousDragPosition = initialDragPosition

  targetDragOffset.value = getRelativeEventPosition(event, target)[positionKey.value]

  const targetBounds = getElementBounds(target, sortableRef.value)

  wasTargetFullyInView =
    targetBounds[boundsStartKey.value] >= 0 &&
    targetBounds[boundsEndKey.value] <= sortableViewSize.value
}

function onDrag(event) {
  if (props.dragDelay && props.dragDelayOnTouchOnly ? isTouchEvent : true) {
    const timeDelta = performance.now() - startedDragAt
    const isTimeThresholdExceeded = timeDelta > props.dragDelay
    if (!isTimeThresholdExceeded) {
      onDragStop()
      return
    }
  }

  if (isTouchEvent) {
    // Prevent scrolling.
    event.preventDefault()
  }

  previousDragPosition = currentDragPosition || initialDragPosition
  currentDragPosition = getEventPosition(event)

  dragDirection.value = getDragDirection()

  if (!isDragging.value) {
    const dragDelta = getDragDelta()
    const isDragThresholdExceeded = Math.abs(dragDelta) > props.dragThreshold

    // This is where the drag event is triggered.
    if (isDragThresholdExceeded) {
      isDragging.value = true
      autoScrollAnimationRequest = requestAnimationFrame(animateAutoScroll)

      emits('start', {
        index: initialIndex
      })
    } else {
      return
    }
  }

  const { x, y } = getRelativeEventPosition(event, sortableRef.value)
  position.value.x = x
  position.value.y = y

  moveTarget()
}

function onDragStop() {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', onDragStop)

  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', onDragStop)
  document.removeEventListener('touchcancel', onDragStop)

  if (target) {
    target.style.transform = ''
    target = null
  }

  startedDragAt = null
  isTouchEvent = false
  initialDragPosition = null
  previousDragPosition = null
  currentDragPosition = null

  if (!isDragging.value) {
    return
  }

  items.value = initialIndex.value != currentIndex.value
    ? moveArrayElement(items.value, initialIndex.value, currentIndex.value)
    : items.value

  emits('end', {
    oldIndex: initialIndex.value,
    newIndex: currentIndex.value,
    value: items.value
  })

  initialIndex.value = null
  currentIndex.value = null
  dragDirection.value = null
  isDragging.value = false
}

function onItemClick(event) {
  if (!isDragging.value) {
    return
  }

  event.stopPropagation()
  isDragging.value = false
}

function moveTarget() {
  const targetSize = target[sizeKey.value]
  const scroll = sortableRef.value[scrollKey.value]
  const coordinate = position.value[positionKey.value]

  const minCoordinate = wasTargetFullyInView
    ? scroll
    : 0

  const maxCoordinate = wasTargetFullyInView
    ? sortableViewSize.value + scroll - targetSize
    : sortableScrollSize.value - targetSize

  const clampedCoordinate = clamp(coordinate - targetDragOffset.value, minCoordinate, maxCoordinate)

  currentIndex.value = Math.floor(coordinate / targetSize)

  const transform = clampedCoordinate - targetSize * initialIndex.value
  const transformX = isVertical.value ? 0 : transform
  const transformY = isVertical.value ? transform : 0
  target.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`
}

let previousAutoScrollTimestamp = 0

function animateAutoScroll(timestamp) {
  if (!isDragging.value || !props.autoScroll) {
    cancelAnimationFrame(autoScrollAnimationRequest)
    autoScrollAnimationRequest = null
    return
  }

  const elapsed = timestamp - previousAutoScrollTimestamp

  // Target ~60fps (1000ms/60 ≈ 16.67ms).
  if (elapsed >= 16) {
    autoScroll()
    previousAutoScrollTimestamp = timestamp
  }

  autoScrollAnimationRequest = requestAnimationFrame(animateAutoScroll)
}

function autoScroll() {
  const targetSize = target[sizeKey.value]
  const coordinate = position.value[positionKey.value]
  const relativeCoordinate = coordinate - sortableRef.value[scrollKey.value]
  const relativeCoordinateStart = relativeCoordinate - targetDragOffset.value
  const relativeCoordinateEnd = relativeCoordinateStart + targetSize
  const initialScroll = sortableRef.value[scrollKey.value]

  const hasReachedMinScroll = initialScroll == 0
  const hasReachedMaxScroll = (sortableScrollSize.value - initialScroll) == sortableViewSize.value

  const startDelta = props.autoScrollMargin - relativeCoordinateStart
  const endDelta = relativeCoordinateEnd - (sortableViewSize.value - props.autoScrollMargin)

  let direction = null
  let delta = null

  if (!hasReachedMaxScroll && endDelta > 0) {
    delta = endDelta
    direction = 1
  } else if (!hasReachedMinScroll && startDelta > 0) {
    delta = startDelta
    direction = -1
  } else {
    return
  }

  // Don't auto-scroll if the user is dragging in the opposite direction of the scroll.
  if (dragDirection.value != direction) {
    return
  }

  const acceleration = clamp(delta, 0, props.autoScrollMargin) / props.autoScrollMargin

  sortableRef.value[scrollKey.value] += direction * acceleration * props.autoScrollSpeed
  // The browser may not scroll by the new value due to boundaries or other constraints,
  // so we measure the actual scroll amount that occurred.
  const scrollDelta = direction * Math.abs(initialScroll - sortableRef.value[scrollKey.value])

  const minCoordinate = sortableRef.value[scrollKey.value]
  const maxCoordinate = minCoordinate + sortableRef.value[sizeKey.value]
  position.value[positionKey.value] = clamp(coordinate + scrollDelta, minCoordinate, maxCoordinate)

  moveTarget()
}

onUnmounted(() => {
  cancelAnimationFrame(autoScrollAnimationRequest)
})
</script>
