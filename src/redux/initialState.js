/* eslint-disable operator-linebreak */
/* eslint-disable no-unused-vars */

import jsurl from 'jsurl'

import { loadState, saveState } from '../utils/localStorage'


const INITIAL_ROWS_IN_CATEGORIES = []

export const DEFAULT_STATE = {
  genome: 'hg38',
  locus: 'chr15:92,835,700-93,031,800',
  dataTypesToShow: ['junctions', 'coverage', 'vcf', 'gcnv_bed'],
  leftSideBarLocusList: [],
  rightSideBarLocusList: [],
  rowsInCategories: INITIAL_ROWS_IN_CATEGORIES,
  selectedRowNamesByCategoryName: {},
  sjOptions: {
    trackHeight: 170,
    hideAnnotated: false,
    hideUnannotated: false,
    colorBy: 'strand',
    minUniquelyMappedReads: 0,
    minTotalReads: 1,
    maxFractionMultiMappedReads: 1,
    minSplicedAlignmentOverhang: 0,
    thicknessBasedOn: 'numUniqueReads', //options: numUniqueReads (default), numReads, isAnnotatedJunction
    bounceHeightBasedOn: 'random', //options: random (default), distance, thickness
    labelUniqueReadCount: true,
    labelMultiMappedReadCount: false,
    labelTotalReadCount: false,
    labelMotif: false,
    labelAnnotatedJunction: false,
    labelAnnotatedJunctionValue: ' [A]',
  },
  vcfOptions: {
    displayMode: 'EXPANDED',
  },
  bamOptions: {
    trackHeight: 200,
    showSoftClips: true,
    alignmentShading: 'strand',
  },
  gcnvOptions: {
    trackHeight: 200,
    trackMin: 0,
    trackMax: 5,
    autoscale: false,
    onlyHandleClicksForHighlightedSamples: true,
  },
  initialSettingsUrl: '',
}

const KEYS_TO_PERSIST_IN_URL = {
  locus: 'locus',
  dataTypesToShow: 'show',
  selectedRowNamesByCategoryName: 'selectedRows',
  selectedSamplesByCategoryNameAndRowName: 'selectedSamples',
  sjOptions: 'sjOptions',
  vcfOptions: 'vcfOptions',
  bamOptions: 'bamOptions',
  gcnvOptions: 'gcnvOptions',
  initialSettingsUrl: 'settingsUrl',
  initialSettingsUrlHasBeenApplied: 'settingsUrlApplied',
}

const KEYS_TO_PERSIST_IN_LOCAL_STORAGE = [
  'rowsInCategories', 'leftSideBarLocusList', 'rightSideBarLocusList',
]


export const computeInitialState = () => {

  // restore values from local storage
  const stateFromLocalStorage = KEYS_TO_PERSIST_IN_LOCAL_STORAGE.reduce((acc, key) => {
    const v = loadState(key)
    if (v !== undefined) {
      acc[key] = v
    }
    return acc
  }, {})

  // restore values from url
  const REVERSE_KEY_NAME_LOOKUP = Object.entries(KEYS_TO_PERSIST_IN_URL).reduce(
    (acc, [key, value]) => {
      return { ...acc, [value]: key }
    }, {})
  const hashString = window.location.hash.replace(/^#/, '')

  const stateFromUrlHash = hashString ?
    hashString.split('&').reduce((acc, keyValue) => {
      const keyValueList = keyValue.split('=')
      const key = (keyValueList[0] in REVERSE_KEY_NAME_LOOKUP) ? REVERSE_KEY_NAME_LOOKUP[keyValueList[0]] : keyValueList[0]
      if (key === 'locus') {
        acc = { ...acc, [key]: keyValueList[1] }
      } else {
        try {
          acc[key] = jsurl.parse(keyValueList[1])
        } catch (e) {
          console.error('Couldn\'t parse url hash param', keyValueList[0], ': ', keyValueList[1])
        }
      }
      return acc
    }, {})
    : {}

  // check google sign-in status


  // default values are over-ridden by values from local storage, which are over-ridden by values from the url
  const initialState = { ...DEFAULT_STATE, ...stateFromLocalStorage, ...stateFromUrlHash }

  return initialState
}


export const updateLocalStorageAndUrl = (state) => {
  //update local storage

  KEYS_TO_PERSIST_IN_LOCAL_STORAGE.forEach((key) => {
    saveState(key, state[key])
  })

  //update url
  const hashString = Object.keys(state)
    .filter((key) => (key in KEYS_TO_PERSIST_IN_URL))
    .reduce((hashKeyValueList, key) => {
      const value = key === 'locus' ? state[key].replace(',', '') : jsurl.stringify(state[key])
      return [
        ...hashKeyValueList,
        `${KEYS_TO_PERSIST_IN_URL[key]}=${value}`,
      ]
    }, []).join('&')

  window.location.hash = `#${hashString}`
}
