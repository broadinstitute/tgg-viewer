/* eslint-disable prefer-object-spread */

import { combineReducers } from 'redux'

import {
  zeroActionsReducer,
  createSingleValueReducer,
  createSingleObjectReducer,
  createArrayReducer,
} from './utils/reducerFactories'

import modalReducers from './utils/modalReducer'


const samplesInCategoriesReducer = (state, action) => {
  if (!action || !action.categoryName || !action.samples) {
    return state || []
  }

  return state.map((category) => {
    if (category.categoryName !== action.categoryName) {
      return category
    }

    let updatedSamples
    switch (action.type) {
      case 'SET_SAMPLES':
        updatedSamples = [...action.samples]
        break

      case 'ADD_SAMPLES':
        updatedSamples = [...category.samples, ...action.samples]
        break

      default:
        updatedSamples = category.samples
    }

    return {
      ...category,
      samples: updatedSamples,
    }
  })
}


const selectedSampleNamesByCategoryNameReducer = (state, action) => {
  if (!action || !action.categoryName || !Array.isArray(action.selectedSampleNames)) {
    return state || {}
  }

  const previousList = state[action.categoryName] || []

  switch (action.type) {
    case 'SET_SELECTED_SAMPLE_NAMES':
    case 'ADD_SELECTED_SAMPLE_NAMES':
    case 'REMOVE_SELECTED_SAMPLE_NAMES': {
      let updatedList
      if (action.type === 'SET_SELECTED_SAMPLE_NAMES') {
        updatedList = [...action.selectedSampleNames] // make a copy of action.values
      } else if (action.type === 'ADD_SELECTED_SAMPLE_NAMES') {
        updatedList = [...previousList, ...action.selectedSampleNames]
      } else {
        const valuesToRemove = action.selectedSampleNames
        updatedList = previousList.filter((v) => !valuesToRemove.includes(v))
      }

      return {
        ...state,
        [action.categoryName]: updatedList,
      }
    }
    default:
      console.trace(`Unknown action type: ${action.type}`)
  }

  return state
}

// combined reducers
const otherReducers = combineReducers(Object.assign({
  genome: zeroActionsReducer,
  locus: createSingleValueReducer('UPDATE_LOCUS', ''),
  rightSideBarLocusList: createArrayReducer('RIGHT_SIDE_BAR_LOCUS_LIST'),
  leftSideBarLocusList: createArrayReducer('LEFT_SIDE_BAR_LOCUS_LIST'),
  samplesInCategories: samplesInCategoriesReducer,
  selectedSampleNamesByCategoryName: selectedSampleNamesByCategoryNameReducer,
  sjOptions: createSingleObjectReducer('UPDATE_SJ_OPTIONS'),
  vcfOptions: createSingleObjectReducer('UPDATE_VCF_OPTIONS'),
  bamOptions: createSingleObjectReducer('UPDATE_BAM_OPTIONS'),
  user: createSingleObjectReducer('UPDATE_USER'),
  initialSettingsUrl: createSingleValueReducer('UPDATE_INITIAL_SETTINGS_URL', ''),
  initialSettings: createSingleValueReducer('UPDATE_INITIAL_SETTINGS', {}),
}, modalReducers))

const rootReducer = (state, action) => {
  if (action.type === 'RESET_GLOBAL_STATE') {
    console.log('RESET_GLOBAL_STATE to', action.newState)
    return action.newState
  }

  return otherReducers(state, action)
}
export default rootReducer
