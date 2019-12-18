import { combineReducers } from 'redux'

import {
  zeroActionsReducer,
  createSingleValueReducer,
  createSingleObjectReducer,
  createArrayReducer,
} from './utils/reducerFactories'


// root reducer
const rootReducer = combineReducers(Object.assign({
  //loci: createObjectsByIdReducer('UPDATE_LOCI'),
  genome: zeroActionsReducer,
  locus: createSingleValueReducer('UPDATE_LOCUS', ''),
  samplesInfo: zeroActionsReducer,
  selectedSampleNames: createArrayReducer('SELECTED_SAMPLE_NAMES'),
  sjOptions: createSingleObjectReducer('UPDATE_SJ_OPTIONS'),
  vcfOptions: createSingleObjectReducer('UPDATE_VCF_OPTIONS'),
  bamOptions: createSingleObjectReducer('UPDATE_BAM_OPTIONS'),
  user: createSingleObjectReducer('UPDATE_USER'),
}))

export default rootReducer