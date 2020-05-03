/* eslint-disable operator-linebreak */
/* eslint-disable no-unused-vars */

import jsurl from 'jsurl'

import { loadState, saveState } from '../utils/localStorage'

/*
TODO
- local, aws
- gtf
- reference tracks
    - splice ai
 */

const REFERENCE_DATA_ROOT = 'gs://seqr-reference-data/GRCh38/rna-seq'
const REFERENCE_DATA_INFO_LIST = [
  {
    name: 'GTEx 100 Muscle',
    description: '100 randomly-chosen GTEx v3 muscle samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all 100 samples.',
    junctions: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/muscle_100_GTEx_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/muscle_100_GTEx_samples.bigWig`,
  },
  {
    name: 'GTEx 100 Blood',
    description: '100 randomly-chosen GTEx v3 blood samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all 100 samples.',
    junctions: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/blood_100_GTEx_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/blood_100_GTEx_samples.bigWig`,
  },
  {
    name: 'GTEx 100 Fibs',
    description: '100 randomly-chosen GTEx v3 fibroblast samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all 100 samples.',
    junctions: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/fibs_100_GTEx_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/fibs_100_GTEx_samples.bigWig`,
  },
  {
    name: 'GTEx All Muscle',
    description: 'All 803 GTEx v3 muscle samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all samples.',
    junctions: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_muscle.803_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_muscle.803_samples.bigWig`,
  },
  {
    name: 'GTEx All Blood',
    description: 'All 755 GTEx v3 blood samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all samples.',
    junctions: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_blood.755_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_blood.755_samples.bigWig`,
  },
  {
    name: 'GTEx All Fibs',
    description: 'All 504 GTEx v3 fibroblast samples combined by summing raw coverage values and raw splice-junction-spanning read counts across all samples.',
    junctions: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_fibs.504_samples.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_fibs.504_samples.bigWig`,
  },
  {
    name: 'GTEx All Muscle - Norm.',
    description: 'All 803 GTEx v3 muscle samples combined by summing raw coverage values across all samples and also summing normalized splice-junction-spanning read counts across all samples. The normalization is done by computing the normalized read count for each junction as normalized_read_count = raw_read_count * scalar. Here scalar = average_unique_reads_per_muscle_sample / (total_unqiue_reads_in_this_sample * number_of_muscle_samples), and average_unique_reads_per_muscle_sample = (total_unqiue_reads_in_all_muscle_samples / number_of_muscle_samples)',
    junctions: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_muscle.803_samples.normalized.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_muscle.803_samples.bigWig`,
  },
  {
    name: 'GTEx All Blood - Norm.',
    description: 'All 755 GTEx v3 blood samples combined by summing raw coverage values across all samples and also summing normalized splice-junction-spanning read counts across all samples. The normalization is done by computing the normalized read count for each junction as normalized_read_count = raw_read_count * scalar. Here scalar = average_unique_reads_per_blood_sample / (total_unqiue_reads_in_this_sample * number_of_blood_samples), and average_unique_reads_per_blood_sample = (total_unqiue_reads_in_all_blood_samples / number_of_blood_samples)',
    junctions: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_blood.755_samples.normalized.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_blood.755_samples.bigWig`,
  },
  {
    name: 'GTEx All Fibs - Norm.',
    description: 'All 504 GTEx v3 fibroblast samples combined by summing raw coverage values across all samples and also summing normalized splice-junction-spanning read counts across all samples. The normalization is done by computing the normalized read count for each junction as normalized_read_count = raw_read_count * scalar. Here scalar = average_unique_reads_per_fibs_sample / (total_unqiue_reads_in_this_sample * number_of_fibs_samples), and average_unique_reads_per_fibs_sample = (total_unqiue_reads_in_all_fibs_samples / number_of_fibs_samples)',
    junctions: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_fibs.504_samples.normalized.junctions.bed.gz`,
    coverage: `${REFERENCE_DATA_ROOT}/GTEx_ref_data/GTEX_fibs.504_samples.bigWig`,
  },
  {
    name: 'splice AI scores - SNVs',
    coverage: `${REFERENCE_DATA_ROOT}/spliceai/spliceai_scores.raw.snv.hg38.all.bigWig`,
  },
  {
    name: 'splice AI scores - SNVs - alt allele A',
    coverage: `${REFERENCE_DATA_ROOT}/spliceai/spliceai_scores.raw.snv.hg38.alt-allele-A.bigWig`,
  },
  {
    name: 'splice AI scores - SNVs - alt allele C',
    coverage: `${REFERENCE_DATA_ROOT}/spliceai/spliceai_scores.raw.snv.hg38.alt-allele-C.bigWig`,
  },
  {
    name: 'splice AI scores - SNVs - alt allele G',
    coverage: `${REFERENCE_DATA_ROOT}/spliceai/spliceai_scores.raw.snv.hg38.alt-allele-G.bigWig`,
  },
  {
    name: 'splice AI scores - SNVs - alt allele T',
    coverage: `${REFERENCE_DATA_ROOT}/spliceai/spliceai_scores.raw.snv.hg38.alt-allele-T.bigWig`,
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

const ROW_INFO_LIST = []

const INITIAL_ROWS_IN_CATEGORIES = [
  {
    categoryName: 'Reference Data',
    rows: REFERENCE_DATA_INFO_LIST,
  },
  {
    categoryName: 'Samples',
    rows: ROW_INFO_LIST,
  },
]

export const DEFAULT_STATE = {
  genome: 'hg38',
  locus: 'chr15:92,835,700-93,031,800',
  //dataTypesToShow: ['junctions', 'coverage', 'vcf'],
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

DEFAULT_STATE.initialSettings = JSON.parse(JSON.stringify(DEFAULT_STATE)) // create a deep-copy of DEFAULT_STATE

const KEYS_TO_PERSIST_IN_URL = {
  locus: 'locus',
  dataTypesToShow: 'show',
  selectedRowNamesByCategoryName: 'selectedSamples',
  sjOptions: 'sjOptions',
  vcfOptions: 'vcfOptions',
  bamOptions: 'bamOptions',
  gcnvOptions: 'gcnvOptions',
  initialSettingsUrl: 'settingsUrl',
  //initialSettingsUrlHasBeenApplied: 'settingsUrlApplied',
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
