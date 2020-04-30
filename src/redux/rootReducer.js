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
      case 'SET_ROWS':
        updatedRows = [...action.rows]
        break

      case 'ADD_ROWS':
        updatedRows = [...category.rows, ...action.rows]
        break

      default:
        updatedRows = category.rows
    }

    return {
      ...category,
      rows: updatedRows,
    }
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
        updatedList = [...action.selectedRowNames] // make a copy of action.values
      } else if (action.type === 'ADD_SELECTED_ROW_NAMES') {
        updatedList = [...previousList, ...action.selectedRowNames]
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

// combined reducers
const otherReducers = combineReducers(Object.assign({
  genome: zeroActionsReducer,
  locus: createSingleValueReducer('UPDATE_LOCUS', ''),
  rightSideBarLocusList: createArrayReducer('RIGHT_SIDE_BAR_LOCUS_LIST'),
  leftSideBarLocusList: createArrayReducer('LEFT_SIDE_BAR_LOCUS_LIST'),
  rowsInCategories: rowsInCategoriesReducer,
  selectedRowNamesByCategoryName: selectedRowNamesByCategoryNameReducer,
  sjOptions: createSingleObjectReducer('UPDATE_SJ_OPTIONS'),
  vcfOptions: createSingleObjectReducer('UPDATE_VCF_OPTIONS'),
  bamOptions: createSingleObjectReducer('UPDATE_BAM_OPTIONS'),
  gcnvOptions: createSingleObjectReducer('UPDATE_BAM_OPTIONS'),
  user: createSingleObjectReducer('UPDATE_USER'),
  initialSettings: createSingleValueReducer('UPDATE_INITIAL_SETTINGS', {}),
  initialSettingsUrl: createSingleValueReducer('UPDATE_INITIAL_SETTINGS_URL', ''),
  initialSettingsUrlHasBeenApplied: createSingleValueReducer('UPDATE_INITIAL_SETTINGS_URL_HAS_BEEN_APPLIED', false),
}, modalReducers))


const rootReducer = (state, action) => {
  if (action.type === 'RESET_GLOBAL_STATE') {
    console.log('RESET_GLOBAL_STATE to', action.newState)
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

  console.log('Initializing store to:')
  console.log(initialState)

  return createStore(rootReducer, initialState, compose(applyMiddleware(thunkMiddleware)))
}
