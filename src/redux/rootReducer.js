/* eslint-disable prefer-object-spread */
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { updateLocalStorageAndUrl, computeInitialState } from './initialState'


import {
  zeroActionsReducer,
  createSingleValueReducer,
  createSingleObjectReducer,
  createArrayReducer,
} from './utils/reducerFactories'

import modalReducers from './utils/modalReducer'


const rowsInCategoriesReducer = (state, action) => {
  if (!action || !action.categoryName || !action.rows) {
    return state || []
  }

  return state.map((category) => {
    if (category.categoryName !== action.categoryName) {
      return category
    }

    let updatedRows
    switch (action.type) {
      case 'SET_ROWS': {
        updatedRows = [...action.rows]
        break
      }
      case 'ADD_ROWS': {
        const existingNames = category.rows.map((row) => row.name)
        updatedRows = [...category.rows, ...action.rows.filter((row) => !existingNames.includes(row.name))]
        break
      }
      default:
        updatedRows = category.rows
    }

    const result = {
      ...category,
      rows: updatedRows,
    }
    return result
  })
}


const selectedRowNamesByCategoryNameReducer = (state, action) => {
  if (!action || !action.categoryName || !Array.isArray(action.selectedRowNames)) {
    return state || {}
  }

  const previousList = state[action.categoryName] || []
  switch (action.type) {
    case 'SET_SELECTED_ROW_NAMES':
    case 'ADD_SELECTED_ROW_NAMES':
    case 'REMOVE_SELECTED_ROW_NAMES': {
      let updatedList
      if (action.type === 'SET_SELECTED_ROW_NAMES') {
        updatedList = Array.from(new Set(action.selectedRowNames)) // make a copy of action.values
      } else if (action.type === 'ADD_SELECTED_ROW_NAMES') {
        updatedList = Array.from(new Set([...previousList, ...action.selectedRowNames]))
      } else {
        const valuesToRemove = action.selectedRowNames
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


const selectedSamplesByCategoryNameAndRowNameReducer = (state, action) => {
  if (!action || !action.categoryName || (!action.selectedSamplesByRowName && !action.sampleSettingsByRowNameAndSampleName)) {
    return state || {}
  }

  const categoryObj = state[action.categoryName] || {}
  const previousSelectedSamplesByRowName = categoryObj.selectedSamples || {}
  const previousSampleSettingsByRowNameAndSampleName = categoryObj.sampleSettings || {}
  let updatedSelectedSamplesByRowName = previousSelectedSamplesByRowName
  let updatedSampleSettingsByRowNameAndSampleName = previousSampleSettingsByRowNameAndSampleName

  switch (action.type) {
    case 'SET_SELECTED_SAMPLES':
    case 'ADD_SELECTED_SAMPLES':
    case 'REMOVE_SELECTED_SAMPLES': {
      if (action.type === 'SET_SELECTED_SAMPLES') {
        updatedSelectedSamplesByRowName = { ...previousSelectedSamplesByRowName, ...action.selectedSamplesByRowName }
      } else if (action.type === 'ADD_SELECTED_SAMPLES') {
        updatedSelectedSamplesByRowName = Array.from(new Set([
          ...Object.keys(previousSelectedSamplesByRowName),
          ...Object.keys(action.selectedSamplesByRowName),
        ])).reduce((acc, rowName) => {
          acc[rowName] = Array.from(new Set([...(previousSelectedSamplesByRowName[rowName] || []), ...(action.selectedSamplesByRowName[rowName] || [])]))

          return acc
        }, {})
      } else {
        updatedSelectedSamplesByRowName = Object.keys(previousSelectedSamplesByRowName).reduce((acc, rowName) => {
          const valuesToRemove = action.selectedSamplesByRowName[rowName] || []
          const updatedList = (previousSelectedSamplesByRowName[rowName] || []).filter((v) => !valuesToRemove.includes(v))
          if (updatedList.length > 0) {
            acc[rowName] = updatedList
          }
          return acc
        }, {})
      }
      break
    }

    case 'UPDATE_SAMPLE_SETTINGS': {
      updatedSampleSettingsByRowNameAndSampleName = {
        ...previousSampleSettingsByRowNameAndSampleName,
        ...action.sampleSettingsByRowNameAndSampleName,
      }
      Object.keys(action.sampleSettingsByRowNameAndSampleName).forEach((rowName) => {
        const previousSampleSettingsBySampleName = previousSampleSettingsByRowNameAndSampleName[rowName] || {}
        const newSampleSettingsBySampleName = action.sampleSettingsByRowNameAndSampleName[rowName]
        const mergedSamplesSettingsBySampleName = {
          ...previousSampleSettingsBySampleName,
          ...newSampleSettingsBySampleName,
        }
        Object.entries(newSampleSettingsBySampleName).forEach(
          ([sampleName, sampleSettings]) => {
            const mergedSampleSettings = {
              ...previousSampleSettingsBySampleName[sampleName] || {},
              ...sampleSettings,
            }
            mergedSamplesSettingsBySampleName[sampleName] = mergedSampleSettings
          })
        updatedSampleSettingsByRowNameAndSampleName[rowName] = mergedSamplesSettingsBySampleName
      })
      break
    }

    default: {
      console.trace(`Unknown action type: ${action.type}`)
      return state
    }
  }

  return {
    ...state,
    [action.categoryName]: {
      selectedSamples: updatedSelectedSamplesByRowName,
      sampleSettings: updatedSampleSettingsByRowNameAndSampleName,
    },
  }
}

// combined reducers
const otherReducers = combineReducers(Object.assign({
  genome: zeroActionsReducer,
  locus: createSingleValueReducer('UPDATE_LOCUS', ''),
  rightSideBarLocusList: createArrayReducer('RIGHT_SIDE_BAR_LOCUS_LIST'),
  leftSideBarLocusList: createArrayReducer('LEFT_SIDE_BAR_LOCUS_LIST'),
  dataTypesToShow: createArrayReducer('DATA_TYPES_TO_SHOW'),
  rowsInCategories: rowsInCategoriesReducer,
  selectedRowNamesByCategoryName: selectedRowNamesByCategoryNameReducer,
  selectedSamplesByCategoryNameAndRowName: selectedSamplesByCategoryNameAndRowNameReducer,
  sjOptions: createSingleObjectReducer('UPDATE_SJ_OPTIONS'),
  vcfOptions: createSingleObjectReducer('UPDATE_VCF_OPTIONS'),
  bamOptions: createSingleObjectReducer('UPDATE_BAM_OPTIONS'),
  gcnvOptions: createSingleObjectReducer('UPDATE_GCNV_OPTIONS'),
  user: createSingleObjectReducer('UPDATE_USER'),
  initialSettingsUrl: createSingleValueReducer('UPDATE_INITIAL_SETTINGS_URL', ''),
  initialSettingsUrlHasBeenApplied: createSingleValueReducer('UPDATE_INITIAL_SETTINGS_URL_HAS_BEEN_APPLIED', false),
}, modalReducers))


const rootReducer = (state, action) => {
  if (action.type === 'RESET_GLOBAL_STATE') {
    return action.newState
  }

  const nextState = otherReducers(state, action)

  updateLocalStorageAndUrl(nextState)
  return nextState
}


/**
 * Initialize and return the Redux store
 * @param rootReducer
 * @param initialState
 * @returns {*}
 */
export const createReduxStore = () => {

  const initialState = computeInitialState()

  console.log('Initializing store to:', initialState)

  return createStore(rootReducer, initialState, compose(applyMiddleware(thunkMiddleware)))
}
