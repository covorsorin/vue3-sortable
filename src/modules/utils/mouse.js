export function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num
}

export function getEventPosition(event) {
    if (event.touches || event.changedTouches) {
        const touchList = event.touches.length ? event.touches : event.changedTouches
        const touch = touchList[0]
        return {
            x: touch.clientX,
            y: touch.clientY,
            isTouch: true
        }
    }

    return {
        x: event.clientX,
        y: event.clientY,
        isTouch: false
    }
}

export function getRelativeEventPosition(event, element) {
    const position = getEventPosition(event)
    const rect = element.getBoundingClientRect()
    position.x = clamp(position.x + element.scrollLeft - rect.left, 0, element.scrollWidth)
    position.y = clamp(position.y + element.scrollTop - rect.top, 0, element.scrollHeight)
    return position
}

export function getVisibleRelativeEventPosition(event, element, parent) {
    const position = getRelativeEventPosition(event, element)

    const elementRect = element.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()

    const leftVisible = Math.max(parentRect.left, elementRect.left)
    const xOffset = Math.max(element.offsetWidth - (elementRect.right - leftVisible), 0)

    const topVisible = Math.max(parentRect.top, elementRect.top)
    const yOffset = Math.max(element.offsetHeight - (elementRect.bottom - topVisible), 0)

    position.x = position.x - xOffset
    position.y = position.y - yOffset

    return position
}
