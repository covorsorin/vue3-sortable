export function getRandomColor() {
  const letters = '0123456789ABCDEF'
  const color = Array.from(Array(6).keys())
    .map(() => letters[Math.floor(Math.random() * 16)])
    .join('')
  return `#${color}`
}
