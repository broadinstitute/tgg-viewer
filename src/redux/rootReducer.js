import { combineReducers } from 'redux'

import {
  zeroActionsReducer,
  createSingleValueReducer,
  createSingleObjectReducer,
  createArrayReducer,
} from './utils/reducerFactories'

import modalReducers from './utils/modalReducer'

// root reducer
const rootReducer = combineReducers(Object.assign({
  //loci: createObjectsByIdReducer('UPDATE_LOCI'),
  genome: zeroActionsReducer,
  locus: createSingleValueReducer('UPDATE_LOCUS', ''),
  rightSideBarLocusList: createArrayReducer('RIGHT_SIDE_BAR_LOCUS_LIST', ['DMD', 'TTN']),
  leftSideBarLocusList: createArrayReducer('LEFT_SIDE_BAR_LOCUS_LIST'),
  samplesInfo: zeroActionsReducer,
  selectedSampleNames: createArrayReducer('SELECTED_SAMPLE_NAMES'),
  sjOptions: createSingleObjectReducer('UPDATE_SJ_OPTIONS'),
  vcfOptions: createSingleObjectReducer('UPDATE_VCF_OPTIONS'),
  bamOptions: createSingleObjectReducer('UPDATE_BAM_OPTIONS'),
  user: createSingleObjectReducer('UPDATE_USER'),
}, modalReducers))

export default rootReducer
