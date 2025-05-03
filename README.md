# vue3-sortable

Minimal, Vue 3 sortable list component.

Developed for [Pigments](https://www.instagram.com/pigmentsapp/) app.

Check out the [demo](https://covorsorin.github.io/vue3-sortable/) and the `demo` folder.

Check out vue3-sortable on [npmjs.com](https://www.npmjs.com/package/vue3-sortable).

## Slots

`#item` - Receives the v-for directive item as a prop.

## Props

| Prop                 | Type               | Required | Default      | Description                                                                                                                                                                             |
|----------------------|--------------------|----------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| modelValue           | Array              | Yes      |              | The list of items that need to be sorted.                                                                                                                                               |
| direction            | String             | No       | `'vertical'` | The direction of the sortable (`'vertical'` or `'horizontal'`).                                                                                                                         |
| itemKey              | Function \| String | Yes      |              | The unique key used to identify each element from the list. It can be a function which receives the `item` and `index` as parameters or a string representing a key on the item object. |
| disabled             | Boolean            | No       | `false`      | Whether to disable the component.                                                                                                                                                       |
| handle               | String             | No       | `null`       | CSS class selector used as a drag handle. If the handle is not provided, the item can be moved from anywhere.                                                                           |
| itemClass            | String             | No       | `null`       | CSS class applied to the items.                                                                                                                                                         |
| transitionGroupName  | String             | No       | `null`       | The name of the transition used for the `TransitionGroup` that is wrapping the list.                                                                                                    |
| animationDuration    | Number             | No       | `200`        | Reorder animation duration, in milliseconds.                                                                                                                                            |
| animationEasing      | String             | No       | `'ease'`     | Reorder animation easing.                                                                                                                                                               |
| dragThreshold        | Number             | No       | `3`          | The minimum number of pixels after it's considered a drag event.                                                                                                                        |
| dragDelay            | Number             | No       | `150`        | The time in milliseconds after the event is registered as a drag.                                                                                                                       |
| dragDelayOnTouchOnly | Boolean            | No       | `true`       | Whether the `dragDelay` prop should apply only on mobile devices.                                                                                                                       |
| autoScroll           | Boolean            | No       | `true`       | Whether to auto-scroll when dragging an item near the edges.                                                                                                                            |
| autoScrollMargin     | Number             | No       | `50`         | The distance from the container edge that triggers auto-scrolling (in pixels).                                                                                                          |
| autoScrollSpeed      | Number             | No       | `10`         | The speed at which auto-scrolling occurs.                                                                                                                                               |

## Emits

### update:modelValue

### drag-start

#### Parameters:

- index - The initial index of the dragged element.

#### drag-end

- oldIndex - The initial index of the dragged element.
- newIndex - The final index of the dragged element.
- value - The reordered list.

#### index-change

Triggers when the dragged item index changes.

- oldIndex - The initial index of the dragged element.
- newIndex - The final index of the dragged element.
