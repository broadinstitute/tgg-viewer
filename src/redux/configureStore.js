import { createStore, applyMiddleware, compose } from 'redux'
//import logger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import jsurl from 'jsurl'

import { loadState, saveState } from '../utils/localStorage'

const REFERENCE_DATA_ROOT = 'gs://macarthurlab-rnaseq/reference_tracks/GTEx_ref_data'
const REFERENCE_DATA_INFO_LIST = [
  {
    name: 'GTEx 100 Muscle',
    description: '100 randomly-chosen GTEx v3 muscle samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all 100 samples.',
    junctions: `${REFERENCE_DATA_ROOT}/muscle_100_GTEx_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/muscle_100_GTEx_samples.bigWig`,
  },
  {
    name: 'GTEx 100 Blood',
    description: '100 randomly-chosen GTEx v3 blood samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all 100 samples.',
    junctions: `${REFERENCE_DATA_ROOT}/blood_100_GTEx_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/blood_100_GTEx_samples.bigWig`,
  },
  {
    name: 'GTEx 100 Fibs',
    description: '100 randomly-chosen GTEx v3 fibroblast samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all 100 samples.',
    junctions: `${REFERENCE_DATA_ROOT}/fibs_100_GTEx_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/fibs_100_GTEx_samples.bigWig`,
  },
  {
    name: 'GTEx All Muscle',
    description: 'All 803 GTEx v3 muscle samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all samples.',
    junctions: `${REFERENCE_DATA_ROOT}/GTEX_muscle.803_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEX_muscle.803_samples.bigWig`,
  },
  {
    name: 'GTEx All Blood',
    description: 'All 755 GTEx v3 blood samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all samples.',
    junctions: `${REFERENCE_DATA_ROOT}/GTEX_blood.755_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEX_blood.755_samples.bigWig`,
  },
  {
    name: 'GTEx All Fibs',
    description: 'All 504 GTEx v3 fibroblast samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all samples.',
    junctions: `${REFERENCE_DATA_ROOT}/GTEX_fibs.504_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEX_fibs.504_samples.bigWig`,
  },
  {
    name: 'GTEx All Muscle - Norm.',
    description: 'All 803 GTEx v3 muscle samples combined by summing raw coverage values across all samples and also summing normalized splice-junction-spanning read counts across all samples. The normalization is done by computing the normalized read count for each junction as normalized_read_count = raw_read_count * scalar. Here scalar = average_unique_reads_per_muscle_sample / (total_unqiue_reads_in_this_sample * number_of_muscle_samples), and average_unique_reads_per_muscle_sample = (total_unqiue_reads_in_all_muscle_samples / number_of_muscle_samples)',
    junctions: `${REFERENCE_DATA_ROOT}/GTEX_muscle.803_samples.normalized.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEX_muscle.803_samples.bigWig`,
  },
  {
    name: 'GTEx All Blood - Norm.',
    description: 'All 755 GTEx v3 blood samples combined by summing raw coverage values across all samples and also summing normalized splice-junction-spanning read counts across all samples. The normalization is done by computing the normalized read count for each junction as normalized_read_count = raw_read_count * scalar. Here scalar = average_unique_reads_per_blood_sample / (total_unqiue_reads_in_this_sample * number_of_blood_samples), and average_unique_reads_per_blood_sample = (total_unqiue_reads_in_all_blood_samples / number_of_blood_samples)',
    junctions: `${REFERENCE_DATA_ROOT}/GTEX_blood.755_samples.normalized.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEX_blood.755_samples.bigWig`,
  },
  {
    name: 'GTEx All Fibs - Norm.',
    description: 'All 504 GTEx v3 fibroblast samples combined by summing raw coverage values across all samples and also summing normalized splice-junction-spanning read counts across all samples. The normalization is done by computing the normalized read count for each junction as normalized_read_count = raw_read_count * scalar. Here scalar = average_unique_reads_per_fibs_sample / (total_unqiue_reads_in_this_sample * number_of_fibs_samples), and average_unique_reads_per_fibs_sample = (total_unqiue_reads_in_all_fibs_samples / number_of_fibs_samples)',
    junctions: `${REFERENCE_DATA_ROOT}/GTEX_fibs.504_samples.normalized.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEX_fibs.504_samples.bigWig`,
  },
  /*
  {
    name: 'Gencode v32 Genes',
    description: 'Comprehensive gene annotations for GRCh38 reference chromosomes. Source: https://www.gencodegenes.org/human/release_32.html',
    annotation: 'gs://macarthurlab-rnaseq/reference_tracks/gencode.v32.annotation.sorted.gtf.gz'
  },
  {
    name: 'RefSeq Genes',
    path: 'https://s3.amazonaws.com/igv.org.genomes/hg38/refGene.sorted.txt.gz'
  }
  */
]

const SAMPLE_INFO_LIST = []

const INITIAL_SAMPLES_IN_CATEGORIES = [
  {
    categoryName: 'Reference Data',
    samples: REFERENCE_DATA_INFO_LIST,
  },
  {
    categoryName: 'Samples',
    samples: SAMPLE_INFO_LIST,
  },
]

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
    labelMultiMappedReadCount: false,
    labelTotalReadCount: false,
    labelMotif: false,
    labelAnnotatedJunction: false,
    labelAnnotatedJunctionValue: " [A]",
  },
  vcfOptions: {
    displayMode: 'EXPANDED',
  },
  bamOptions: {
    trackHeight: 200,
    showSoftClips: true,
    alignmentShading: 'strand',
  },
  samplesInCategories: INITIAL_SAMPLES_IN_CATEGORIES,
  selectedSampleNamesByCategoryName: {},
  leftSideBarLocusList: [],
  rightSideBarLocusList: [],
}

INITIAL_STATE.initialSettings = JSON.parse(JSON.stringify(INITIAL_STATE)) // create a deep-copy of INITIAL_STATE

const PERSIST_KEYS_IN_URL = {
  'locus': 'locus',
  'selectedSampleNamesByCategoryName': 'selectedSamples',
  'sjOptions': 'sjOptions',
  'bamOptions': 'bamOptions',
  'vcfOptions': 'vcfOptions',
  'initialSettingsUrl': 'initialSettingUrl',
}

const PERSIST_KEYS_IN_LOCAL_STORAGE = [
  'samplesInCategories', 'leftSideBarLocusList', 'rightSideBarLocusList',
]

const persistStoreMiddleware = store => next => (action) => {
  const result = next(action)
  const nextState = store.getState()
  PERSIST_KEYS_IN_LOCAL_STORAGE.forEach((key) => { saveState(key, nextState[key]) })

  const hashString = Object.keys(nextState)
    .filter(key => (key in PERSIST_KEYS_IN_URL))
    .reduce((hashKeyValueList, key) => {
      const value = key === 'locus' ? nextState[key].replace(',', '') : jsurl.stringify(nextState[key])
      return [
        ...hashKeyValueList,
        `${PERSIST_KEYS_IN_URL[key]}=${value}`,
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
  PERSIST_KEYS_IN_LOCAL_STORAGE.forEach((key) => {
    const v = loadState(key)
    if (v !== undefined) {
      initialState[key] = v
    }
  })

  const REVERSE_KEY_NAME_LOOKUP = Object.entries(PERSIST_KEYS_IN_URL).reduce((acc, [key, value]) => { return { ...acc, [value]: key } }, {})
  const hashString = window.location.hash.replace(/^#/, '')
  const stateFromUrlHash = hashString.split('&').reduce((acc, keyValue) => {
    let keyValueList = keyValue.split('=')
    let key = (keyValueList[0] in REVERSE_KEY_NAME_LOOKUP) ? REVERSE_KEY_NAME_LOOKUP[keyValueList[0]] : keyValueList[0]
    if (key === 'locus') {
      acc[key] = keyValueList[1]
    } else {
      try {
        acc[key] = jsurl.parse(keyValueList[1])
      } catch(e) {
        console.error('Couldn\'t parse url hash param', keyValueList[0], ": ", keyValueList[1])
      }
    }
    return acc
  }, {})

  //values from url override values from local storage
  initialState = { ...initialState, ...stateFromUrlHash }

  console.log('Initializing store to:')
  console.log(initialState)

  return createStore(rootReducer, initialState, enhancer)
}
