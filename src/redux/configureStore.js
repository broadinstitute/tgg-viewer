import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { updateLocalStorageAndUrl, computeInitialState } from './initialState'

const persistStoreMiddleware = (store) => (next) => (action) => {

  updateLocalStorageAndUrl(store.getState())

  return next(action)
}


/**
 * Initialize the Redux store
 * @param rootReducer
 * @param initialState
 * @returns {*}
 */
export const configureStore = (
  rootReducer = (state) => state,
) => {

  const initialState = computeInitialState()

  console.log('Initializing store to:')
  console.log(initialState)

  return createStore(rootReducer, initialState, compose(
    applyMiddleware(thunkMiddleware, persistStoreMiddleware),
  ))
}
