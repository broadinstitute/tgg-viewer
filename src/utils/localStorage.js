import LZString from 'lz-string'

/* in-memory cache to avoid unnecessary compression/decompression */
const CACHE = {}

/**
 * Uses the localStorage API to save a state object in the browser under the given label.
 * @param label {string}
 * @param state {object}
 */
export const saveState = (label, state) => {
  try {
    const jsonString = JSON.stringify(state)
    if (CACHE[label] === jsonString) {
      return
    }

    const serializedState = LZString.compress(jsonString)
    localStorage.setItem(label, serializedState)
  } catch (err) {
    console.warn('Unable to save state: ', label, state, err)
  }
}


/**
 * Uses the localStorage API to restored a previously-saved state object.
 * @param label {string}
 * @param state {object}
 */
export const loadState = (label) => {
  try {
    const serializedState = localStorage.getItem(label)
    const jsonString = LZString.decompress(serializedState)
    CACHE[label] = jsonString

    if (jsonString === null) {
      return undefined
    }

    return JSON.parse(jsonString)
  } catch (err) {
    return undefined
  }
}
