import { nextTick } from 'vue'

const PADDING = 20

export async function scrollVerticallyToIndex(element, index, padding = PADDING) {
  await nextTick()
  const length = element.children.length
  const size = element.scrollHeight
  const to = Math.round(size / length * index)
  element.scrollTop = to - padding
}

export async function scrollHorizontallyToIndex(element, index, padding = PADDING) {
  await nextTick()
  const length = element.children.length
  const size = element.scrollWidth
  const to = Math.round(size / length * index)
  element.scrollLeft = to - padding
}
