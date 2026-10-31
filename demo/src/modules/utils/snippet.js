// The library's own defaults, a prop is left out of the snippet when it matches them.
const LIBRARY_DEFAULTS = {
  direction: 'vertical',
  disabled: false,
  handle: null,
  transitionGroupName: null,
  animationDuration: 200,
  animationEasing: 'ease',
  dragThreshold: 3,
  dragDelay: 150,
  dragDelayOnTouchOnly: true,
  autoScroll: true,
  autoScrollMargin: 50,
  autoScrollSpeed: 10
}

function toKebabCase(name) {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function formatProp(name, value) {
  const attribute = toKebabCase(name)

  if (typeof value == 'string') {
    return `${attribute}="${value}"`
  }

  return value === true ? attribute : `:${attribute}="${value}"`
}

export function createSnippet(props) {
  const lines = Object.keys(LIBRARY_DEFAULTS)
    .filter((name) => props[name] !== LIBRARY_DEFAULTS[name])
    .map((name) => formatProp(name, props[name]))

  const attributes = ['v-model="items"', 'item-key="id"', ...lines]
    .map((line) => `  ${line}`)
    .join('\n')

  const handle = props.handle ? `      <span class="${props.handle}"></span>\n` : ''

  return `<AppSortable
${attributes}
>
  <template #item="{ item }">
    <div class="item">
${handle}      {{ item.name }}
    </div>
  </template>
</AppSortable>`
}
