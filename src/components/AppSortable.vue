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
        <!--
          @slot The content of each sortable item.
          @binding {any} item The current item from the list.
          @binding {number} index The index of the current item.
        -->
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
import { getElementBounds, hasClassUpToParent, isBetween, isEditableElement, moveArrayElement } from '../modules/utils/utils.js'

const props = defineProps({
  /**
   * The direction of the sortable.
   * @values vertical, horizontal
   */
  direction: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal'].includes(value)
  },
  /**
   * The unique key used to identify each element from the list. It can be a function
   * which receives the `item` and `index` as parameters or a string representing
   * a key on the item object.
   * @type {string | ((item: any, index: number) => string | number)}
   */
  itemKey: {
    type: [Function, String],
    required: true
  },
  /**
   * Whether to disable the component.
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * CSS class selector used as a drag handle. If the handle is not provided,
   * the item can be moved from anywhere.
   */
  handle: {
    type: String,
    default: null
  },
  /**
   * CSS class applied to the items.
   */
  itemClass: {
    type: String,
    default: null
  },
  /**
   * The name of the transition used for the `TransitionGroup` that is wrapping the list.
   */
  transitionGroupName: {
    type: String,
    default: null
  },
  /**
   * Reorder animation duration, in milliseconds.
   */
  animationDuration: {
    type: Number,
    default: 200
  },
  /**
   * Reorder animation easing.
   */
  animationEasing: {
    type: String,
    default: 'ease'
  },
  /**
   * The minimum number of pixels after it's considered a drag event.
   */
  dragThreshold: {
    type: Number,
    default: 3
  },
  /**
   * The time in milliseconds after the event is registered as a drag.
   */
  dragDelay: {
    type: Number,
    default: 150
  },
  /**
   * Whether the `dragDelay` prop should apply only on mobile devices.
   */
  dragDelayOnTouchOnly: {
    type: Boolean,
    default: true
  },
  /**
   * Whether to auto-scroll when dragging an item near the edges.
   */
  autoScroll: {
    type: Boolean,
    default: true
  },
  /**
   * The distance from the container edge that triggers auto-scrolling (in pixels).
   */
  autoScrollMargin: {
    type: Number,
    default: 50
  },
  /**
   * The speed at which auto-scrolling occurs.
   */
  autoScrollSpeed: {
    type: Number,
    default: 10
  }
})

const emits = defineEmits([
  /**
   * Emitted when a drag starts.
   * @arg {{ index: number }} payload - Object containing the initial index of the dragged element.
   */
  'start',
  /**
   * Emitted when a drag ends.
   * @arg {{ oldIndex: number, newIndex: number, value: any[] }} payload - Object containing the initial index, the final index and the reordered list.
   */
  'end',
  /**
   * Emitted when the dragged item's index changes during a drag.
   * @arg {{ oldIndex: number, newIndex: number }} payload - Object containing the initial index and the current index of the dragged element.
   */
  'change'
])

const sortableRef = useTemplateRef('sortable')

/**
 * The list of items that need to be sorted. Use with v-model.
 */
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
const wasDragging = ref(false)
const initialIndex = ref(null)
const currentIndex = ref(null)
const targetDragOffset = ref(0)

// -1 for moving towards the start
//  1 for moving towards the end
const dragDirection = ref(null)

let target = null
// Whether the target was fully in view at drag start.
let wasTargetFullyInView = true
// The target size and its start position in the scrollable content, measured at drag start.
// Not derived from `offsetWidth` / `offsetHeight`, those are rounded and the error adds up with the index.
let targetSize = 0
let targetStart = 0
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

  // Uses `translate` instead of `transform`, because `TransitionGroup` overwrites the inline
  // `transform` of the items it considers moved, leaving them out of place until the next update.
  const style = {
    transition: `translate ${props.animationDuration}ms ${props.animationEasing}`,
    translate: '0 0'
  }

  if (isBetween(index, initialIndex.value, currentIndex.value)) {
    const translate = (initialIndex.value - currentIndex.value < 0) ? '-100%' : '100%'
    const translateX = isVertical.value ? 0 : translate
    const translateY = isVertical.value ? translate : 0
    style.translate = `${translateX} ${translateY}`
  }

  return style
}

watch(currentIndex, (newIndex, oldIndex) => {
  styles.value = items.value.map((item, index) => getStyle(index))

  if (newIndex === null || oldIndex === null) {
    return
  }

  emits('change', {
    oldIndex: initialIndex.value,
    newIndex: currentIndex.value
  })
})

function onDragStart(event, index) {
  if (props.disabled) {
    return
  }

  // Ignore additional touches while a gesture is already in progress.
  if (target) {
    return
  }

  // Let form fields receive focus and text selection.
  if (isEditableElement(event.target)) {
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

  targetSize = targetBounds[boundsEndKey.value] - targetBounds[boundsStartKey.value]
  targetStart = targetBounds[boundsStartKey.value] + sortableRef.value[scrollKey.value]

  wasTargetFullyInView =
    targetBounds[boundsStartKey.value] >= 0 &&
    targetBounds[boundsEndKey.value] <= sortableViewSize.value
}

function onDrag(event) {
  if (props.dragDelay && (isTouchEvent || !props.dragDelayOnTouchOnly)) {
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
        index: initialIndex.value
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

function removeDragListeners() {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', onDragStop)

  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', onDragStop)
  document.removeEventListener('touchcancel', onDragStop)
}

function onDragStop() {
  removeDragListeners()

  if (target) {
    target.style.translate = ''
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

  // The model only updates after the parent re-renders, so keep a reference to the new list.
  const value = initialIndex.value != currentIndex.value
    ? moveArrayElement(items.value, initialIndex.value, currentIndex.value)
    : items.value

  items.value = value

  emits('end', {
    oldIndex: initialIndex.value,
    newIndex: currentIndex.value,
    value
  })

  initialIndex.value = null
  currentIndex.value = null
  dragDirection.value = null
  isDragging.value = false
  wasDragging.value = true

  // The click following this drag, if any, is dispatched before this timeout. There may
  // be none (released outside of the item, touch events), so the flag can't outlive it.
  setTimeout(() => {
    wasDragging.value = false
  })
}

function onItemClick(event) {
  if (!wasDragging.value) {
    return
  }

  event.stopPropagation()
  wasDragging.value = false
}

function moveTarget() {
  const scroll = sortableRef.value[scrollKey.value]
  const coordinate = position.value[positionKey.value]

  const minCoordinate = wasTargetFullyInView
    ? scroll
    : 0

  const maxCoordinate = wasTargetFullyInView
    ? sortableViewSize.value + scroll - targetSize
    : sortableScrollSize.value - targetSize

  const clampedCoordinate = clamp(coordinate - targetDragOffset.value, minCoordinate, maxCoordinate)

  currentIndex.value = clamp(Math.floor(coordinate / targetSize), 0, items.value.length - 1)

  const translate = clampedCoordinate - targetStart
  const translateX = isVertical.value ? 0 : translate
  const translateY = isVertical.value ? translate : 0
  target.style.translate = `${translateX}px ${translateY}px`
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
  removeDragListeners()
  cancelAnimationFrame(autoScrollAnimationRequest)
})
</script>
