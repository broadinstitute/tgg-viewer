import { createObjectsByIdReducer } from './reducerFactories'


// actions
const UPDATE_MODAL_STATE = 'UPDATE_MODAL_STATE'

// action creators
export const openModal = modalName => dispatch =>
  dispatch({ type: UPDATE_MODAL_STATE, updatesById: { [modalName]: { open: true } } })

export const closeModal = (modalName, confirmed) => (dispatch, getState) => {
  if (getState().modals[modalName].confirmOnClose && !confirmed) {
    dispatch({ type: UPDATE_MODAL_STATE, updatesById: { [modalName]: { confirming: true } } })
  } else {
    dispatch({ type: UPDATE_MODAL_STATE, updatesById: { [modalName]: { open: false, confirming: false, confirmOnClose: null } } })
  }
}

// root reducer
export default {
  modals: createObjectsByIdReducer(UPDATE_MODAL_STATE),
}

// basic selectors
export const getModalOpen = (state, modalName) => state.modals[modalName] && state.modals[modalName].open
