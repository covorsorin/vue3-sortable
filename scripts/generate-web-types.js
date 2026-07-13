import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { parse } from 'vue-docgen-api'

const rootDir = resolve(import.meta.dirname, '..')
const componentsDir = join(rootDir, 'src/components')
const outFile = join(rootDir, 'web-types.json')

const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))

// Metadata that vue-docgen-api can't extract from the SFCs:
// the component description (not supported for <script setup>)
// and the model prop/event created by defineModel().
const componentMeta = {
  AppSortable: {
    description: 'Minimal, Vue 3 sortable list component, with no dependencies.',
    model: {
      prop: 'modelValue',
      event: 'update:modelValue',
      type: 'any[]',
      required: true,
      description: 'The list of items that need to be sorted. Use with v-model.'
    }
  }
}

const typeMap = {
  func: 'Function',
  array: 'any[]'
}

function mapType(name) {
  // Union types from docgen come as 'a|b'; leave explicit @type overrides
  // (which contain parentheses or spaces) untouched.
  if (name.includes('|') && !name.includes('(')) {
    return name.split('|').map((type) => typeMap[type.trim()] ?? type.trim()).join(' | ')
  }

  return typeMap[name] ?? name
}

function toKebabCase(name) {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function toSingleLine(text) {
  return (text ?? '').replace(/\s*\n\s*/g, ' ').trim()
}

function propToAttribute(prop) {
  const attribute = {
    name: toKebabCase(prop.name)
  }

  if (prop.required) {
    attribute.required = true
  }

  attribute.value = {
    kind: 'expression',
    type: prop.values
      ? prop.values.map((value) => `'${value}'`).join(' | ')
      : mapType(prop.type.name)
  }

  if (prop.defaultValue) {
    attribute.default = prop.defaultValue.value
  }

  if (prop.description) {
    attribute.description = toSingleLine(prop.description)
  }

  return attribute
}

function eventToWebTypes(event) {
  const webTypesEvent = {
    name: toKebabCase(event.name),
    description: toSingleLine(event.description)
  }

  if (event.properties?.length) {
    webTypesEvent.arguments = event.properties.map((property) => ({
      name: property.name,
      description: toSingleLine(property.description)
    }))
  }

  return webTypesEvent
}

function slotToWebTypes(slot) {
  const webTypesSlot = {
    name: slot.name,
    description: toSingleLine(slot.description)
  }

  if (slot.bindings?.length) {
    webTypesSlot['vue-properties'] = slot.bindings.map((binding) => ({
      name: binding.name,
      description: toSingleLine(binding.description)
    }))
  }

  return webTypesSlot
}

async function documentComponent(fileName) {
  const doc = await parse(join(componentsDir, fileName))
  const meta = componentMeta[doc.displayName] ?? {}

  const component = {
    name: doc.displayName,
    source: {
      module: pkg.name,
      symbol: doc.displayName
    },
    description: meta.description ?? toSingleLine(doc.description)
  }

  const attributes = (doc.props ?? []).map(propToAttribute)
  const events = (doc.events ?? []).map(eventToWebTypes)
  const js = {}

  if (meta.model) {
    attributes.unshift({
      name: toKebabCase(meta.model.prop),
      ...(meta.model.required && { required: true }),
      value: {
        kind: 'expression',
        type: meta.model.type
      },
      description: meta.model.description
    })

    js['vue-model'] = {
      prop: meta.model.prop,
      event: meta.model.event
    }

    events.unshift({
      name: toKebabCase(meta.model.event),
      description: `Emitted with the reordered list, use for v-model.`
    })
  }

  component.attributes = attributes
  js.events = events
  component.js = js
  component.slots = (doc.slots ?? []).map(slotToWebTypes)

  return component
}

const componentFiles = readdirSync(componentsDir).filter((fileName) => fileName.endsWith('.vue'))
const components = await Promise.all(componentFiles.map(documentComponent))

const webTypes = {
  $schema: 'https://json.schemastore.org/web-types.json',
  framework: 'vue',
  name: pkg.name,
  version: pkg.version,
  contributions: {
    html: {
      'vue-components': components
    }
  }
}

writeFileSync(outFile, `${JSON.stringify(webTypes, null, 2)}\n`)
console.log(`Generated ${outFile} for ${components.length} component(s).`)
