import { combineReducers } from 'redux'

import {
  zeroActionsReducer,
  createSingleValueReducer,
  createSingleObjectReducer,
} from './utils/reducerFactories'


// root reducer
const rootReducer = combineReducers(Object.assign({
  //loci: createObjectsByIdReducer('UPDATE_LOCI'),
  genome: zeroActionsReducer,
  locus: createSingleValueReducer('UPDATE_LOCUS', ''),
  samplesInfo: zeroActionsReducer,
  selectedSampleNames: createSingleValueReducer('UPDATE_SELECTED_SAMPLES', []),
  sjOptions: createSingleObjectReducer('UPDATE_SJ_OPTIONS'),
  bamOptions: createSingleObjectReducer('UPDATE_BAM_OPTIONS'),
}))

export default rootReducer
