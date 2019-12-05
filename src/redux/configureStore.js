import { createStore, applyMiddleware, compose } from 'redux'
//import logger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import jsurl from 'jsurl'

import { loadState, saveState } from '../utils/localStorage'

const INITIAL_STATE = {
  genome: 'hg38',
  locus: 'chr15:92,835,700-93,031,800',
  sjOptions: {
    trackHeight: 170,
    hideCoverage: false,
    hideAnnotated: false,
    hideUnannotated: false,
    colorBy: 'strand',
    minUniquelyMappedReads: 1,
    minTotalReads: 1,
    maxFractionMultiMappedReads: 1,
    minSplicedAlignmentOverhang: 0,
    thicknessBasedOn: 'numUniqueReads', //options: numUniqueReads (default), numReads, isAnnotatedJunction
    bounceHeightBasedOn: 'random', //options: random (default), distance, thickness
    labelUniqueReadCount: true,
    labelMultiMappedReadCount: true,
    labelTotalReadCount: false,
    labelMotif: true,
    labelIsAnnotatedJunction: false,
    labelIsAnnotatedJunctionValue: " [A]",
  },
  vcfOptions: {
    trackHeight: 50,
  },
  bamOptions: {
    trackHeight: 100,
    showSoftClips: true,
    colorBy: 'strand',

  },
  samplesInfo: [],

  ...(window.IGV_SETTINGS || {}),
}

const PERSIST_STATE_IN_URL = [
  'locus', 'selectedSampleNames', 'sjOptions', 'vcfOptions', 'bamOptions',
]

const PERSIST_STATE_IN_LOCAL_STORAGE = []

const persistStoreMiddleware = store => next => (action) => {
  const result = next(action)
  const nextState = store.getState()
  PERSIST_STATE_IN_LOCAL_STORAGE.forEach((key) => { saveState(key, nextState[key]) })

  const stateToSave = Object.keys(nextState)
    .filter(key => PERSIST_STATE_IN_URL.includes(key))
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: nextState[key],
      }
    }, {})

  window.location.hash = `#${jsurl.stringify(stateToSave)}`

  return result
}

const enhancer = compose(
  applyMiddleware(thunkMiddleware, persistStoreMiddleware),
)


/**
 * Initialize the Redux store
 * @param rootReducer
 * @param initialState
 * @returns {*}
 */
export const configureStore = (
  rootReducer = state => state,
  initialState = INITIAL_STATE,
) => {

  //restore any values from local storage
  PERSIST_STATE_IN_LOCAL_STORAGE.forEach((key) => {
    const v = loadState(key)
    if (v !== undefined) {
      initialState[key] = v
    }
  })

  //values from url override values from local storage
  initialState = { ...initialState, ...jsurl.parse(window.location.hash.replace(/^#/, '')) }

  console.log('Initializing store to:', initialState)

  return createStore(rootReducer, initialState, enhancer)
}
