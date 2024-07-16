export function moveArrayElement(array, oldIndex, newIndex) {
    const arrayCopy = [...array]
    const element = arrayCopy.splice(oldIndex, 1)[0]
    arrayCopy.splice(newIndex, 0, element)
    return arrayCopy
}

export function isBetween(number, start, end) {
    const a = start > end ? end : start
    const b = end < start ? start : end
    return number >= a && number <= b
}

export function hasClassUpToParent(element, parent, className) {
    let currentElement = element

    while (currentElement && currentElement !== parent) {
        if (currentElement.classList.contains(className)) {
            return true
        }

        currentElement = currentElement.parentElement
    }

    return false
}
