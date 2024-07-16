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
