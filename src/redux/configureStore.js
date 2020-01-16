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
    showCoverage: true,
    showJunctions: true,
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
    labelAnnotatedJunction: false,
    labelAnnotatedJunctionValue: " [A]",
  },
  vcfOptions: {
    displayMode: "EXPANDED",
  },
  bamOptions: {
    trackHeight: 200,
    showSoftClips: true,
    colorBy: 'strand',
  },

  ...(window.IGV_SETTINGS || {}),
}

const PERSIST_STATE_IN_URL = {
  'locus': 'locus',
  'selectedSampleNamesByCategoryName': 'selectedSamples',
  'sjOptions': 'sjOptions',
  'bamOptions': 'bamOptions',
  'vcfOptions': 'vcfOptions',
  'initialSettingsUrl': 'initialSettingUrl',
}

const PERSIST_STATE_IN_LOCAL_STORAGE = [
  'samplesInCategories', 'leftSideBarLocusList', 'rightSideBarLocusList',
]

const persistStoreMiddleware = store => next => (action) => {
  const result = next(action)
  const nextState = store.getState()
  PERSIST_STATE_IN_LOCAL_STORAGE.forEach((key) => { saveState(key, nextState[key]) })

  const hashString = Object.keys(nextState)
    .filter(key => (key in PERSIST_STATE_IN_URL))
    .reduce((hashKeyValueList, key) => {
      const value = key === 'locus' ? nextState[key].replace(',', '') : jsurl.stringify(nextState[key])
      return [
        ...hashKeyValueList,
        `${PERSIST_STATE_IN_URL[key]}=${value}`,
      ]
    }, []).join('&')

  window.location.hash = '#' + hashString

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

  const REVERSE_KEY_NAME_LOOKUP = Object.entries(PERSIST_STATE_IN_URL).reduce((acc, [key, value]) => { return { ...acc, [value]: key } }, {})
  const hashString = window.location.hash.replace(/^#/, '')
  const objFromHash = hashString.split('&').reduce((acc, keyValue) => {
    let keyValueList = keyValue.split('=')
    let key = (keyValueList[0] in REVERSE_KEY_NAME_LOOKUP) ? REVERSE_KEY_NAME_LOOKUP[keyValueList[0]] : keyValueList[0]
    if (key === 'locus') {
      acc[key] = keyValueList[1]
    } else {
      try {
        acc[key] = jsurl.parse(keyValueList[1])
      } catch(e) {
        console.error("Couldn't parse value for ", keyValueList[0], ": ", keyValueList[1])
      }
    }
    return acc
  }, {})

  //values from url override values from local storage
  initialState = { ...initialState, ...objFromHash }

  console.log('Initializing store to:', initialState)

  return createStore(rootReducer, initialState, enhancer)
}
