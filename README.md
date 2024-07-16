# vue3-sortable

Minimal, kind-of opinionated, Vue 3 sortable list component.

Developed for [Pigments](https://www.instagram.com/pigmentsapp/) app.

Check out the `demo` folder.

## Slots

`#item` - Receives the v-for directive item as a prop.

## Props

### modelValue

Type: `Array`<br>
Required: `true`<br>

The list of items that need to be sorted.

### direction

Type: `String`<br>
Required: `false`<br>
Default: `vertical`<br>
Values: [`vertical`, `horizontal`]<br>

The direction of the sortable.

### handle

Type: `String`<br>
Required: `false`<br>
Default: `null`<br>

CSS class selector used as a drag handle. If the handle is not provided, the item can be moved from anywhere.

### itemClass

Type: `String`<br>
Required: `false`<br>
Default: `null`<br>

CSS class applied to the items.

### animationDuration

Type: `Number`<br>
Required: `false`<br>
Default: `200`<br>

Reorder animation duration, in ms.

### animationEasing

Type: `String`<br>
Required: `false`<br>
Default: `ease`<br>

Reorder animation easing, any CSS transition accepted.

### autosScrollEnabled

Type: `Boolean`<br>
Required: `false`<br>
Default: `true`<br>

Whether to auto-scroll when near the edges of the list, when overflow is present.

### disabled

Type: `Boolean`<br>
Required: `false`<br>
Default: `true`<br>

Disable the sortable.

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
