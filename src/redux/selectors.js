/* eslint-disable no-nested-ternary */
/* eslint-disable object-shorthand */
/* eslint-disable array-callback-return */

import { createSelector } from 'reselect'
import { getGoogleAccessToken } from '../utils/googleAuth'
import { SJ_MOTIFS, SJ_DEFAULT_COLOR_BY_NUM_READS_THRESHOLD, GCNV_DEFAULT_HIGHLIGHT_COLOR } from '../constants'

export const getLocus = (state) => state.locus
export const getRightSideBarLocusList = (state) => state.rightSideBarLocusList
export const getLeftSideBarLocusList = (state) => state.leftSideBarLocusList
export const getGenome = (state) => state.genome
export const getDataTypesToShow = (state) => state.dataTypesToShow
export const getRowsInCategories = (state) => state.rowsInCategories
export const getSelectedRowNamesByCategoryName = (state) => state.selectedRowNamesByCategoryName

export const getSelectedSamplesByCategoryNameAndRowName = (state) => state.selectedSamplesByCategoryNameAndRowName
export const getSjOptions = (state) => state.sjOptions
export const getVcfOptions = (state) => state.vcfOptions
export const getBamOptions = (state) => state.bamOptions
export const getGcnvOptions = (state) => state.gcnvOptions
export const getUser = (state) => state.user
export const getInitialSettingsUrl = (state) => state.initialSettingsUrl

export const getAllDataTypes = createSelector(
  getRowsInCategories,
  (rowsInCategories) => {
    return [...rowsInCategories.reduce((acc, category) => {
      category.rows.forEach((row) => {
        if (row.data) {
          const dataTypes = row.data.filter((data) => data.type).map((data) => data.type)
          dataTypes.forEach((dataType) => {
            acc.add(dataType)
          })
        }
      })
      return acc
    }, new Set())]
  })


export const getDataTypesUsersCanToggle = createSelector(
  getRowsInCategories,
  (rowsInCategories) => {
    return [...rowsInCategories.reduce((acc, category) => {
      category.rows.forEach((row) => {
        if (row.data) {
          const dataTypes = row.data.filter((data) => data.type).map((data) => data.type)
          if (new Set(dataTypes).size >= 2) { // only include data types when a row has more than one data type
            dataTypes.forEach((dataType) => {
              acc.add(dataType)
            })
          }
        }
      })
      return acc
    }, new Set())]
  })

export const getEnabledDataTypes = createSelector(
  getAllDataTypes,
  getDataTypesUsersCanToggle,
  getDataTypesToShow,
  (allDataTypes, dataTypesUsersCanToggle, dataTypesToShow) => {
    return allDataTypes.filter((dataType) => (dataTypesUsersCanToggle.includes(dataType) ? dataTypesToShow.includes(dataType) : true))
  })

export const getRowsByCategoryName = createSelector(
  getRowsInCategories,
  (rowsInCategories) => {
    return rowsInCategories.reduce((acc, category) => {
      return { ...acc, [category.categoryName]: category.rows }
    }, {})
  })


export const getSelectedRowsByCategoryName = createSelector(
  getSelectedRowNamesByCategoryName,
  getRowsByCategoryName,
  (selectedRowNamesByCategoryName, rowsByCategoryName) => {
    return Object.entries(selectedRowNamesByCategoryName).reduce((acc, [categoryName, selectedRowNames]) => {
      if (!rowsByCategoryName[categoryName]) {
        return acc
      }
      return { ...acc, [categoryName]: rowsByCategoryName[categoryName].filter((row) => selectedRowNames.includes(row.name)) }
    }, {})
  })


export const getTracks = createSelector(
  getSelectedRowsByCategoryName,
  getSelectedSamplesByCategoryNameAndRowName,
  getEnabledDataTypes,
  getSjOptions,
  getVcfOptions,
  getBamOptions,
  getGcnvOptions,
  (
    selectedRowsByCategoryName,
    selectedSamplesByCategoryNameAndRowName,
    enabledDataTypes,
    sjOptions,
    vcfOptions,
    bamOptions,
    gcnvOptions,
  ) => {
    const igvTracks = []

    Object.entries(selectedRowsByCategoryName).forEach(([categoryName, selectedRows]) => selectedRows.forEach((row, i) => {
      let junctionsTrack
      let coverageTrack
      (row.data || []).forEach((data, j) => {
        //docs @ https://github.com/igvteam/igv.js/wiki/Wig-Track
        if (!enabledDataTypes.includes(data.type)) {
          console.log(`Skipping hidden track: ${data.url}`)
          return
        }

        if (data.type === 'gcnv_bed') { // && vcfOptions.showGcnv
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          console.log(`Adding ${data.url} track #`)

          igvTracks.push({
            type: 'gcnv',
            format: 'gcnv',
            name: `${row.name} ${data.label || ''}`,
            url: data.url,
            indexURL: data.indexURL || `${data.url}.tbi`,
            height: gcnvOptions.trackHeight,
            min: gcnvOptions.trackMin,
            max: gcnvOptions.trackMax,
            autoscale: gcnvOptions.autoscale,
            highlightSamples: (((selectedSamplesByCategoryNameAndRowName[categoryName] || {}).selectedSamples || {})[row.name] || []).reduce(
              (acc, sampleName) => {
                acc[sampleName] = ((((selectedSamplesByCategoryNameAndRowName[categoryName] || {}).sampleSettings || {})[row.name] || {})[sampleName] || {}).color || GCNV_DEFAULT_HIGHLIGHT_COLOR
                return acc
              }, {}),
            onlyHandleClicksForHighlightedSamples: gcnvOptions.onlyHandleClicksForHighlightedSamples,
            oauthToken: getGoogleAccessToken,
            order: i * 100 + j,
            rowName: row.name,
            categoryName: categoryName,
          })
        }
        else if (data.type === 'junctions') {
          if (junctionsTrack) {
            console.error('More than one "junctions" track found in row', row)
            return
          }

          junctionsTrack = {
            type: 'spliceJunctions',
            format: 'bed',
            url: data.url,
            indexURL: data.indexURL || `${data.url}.tbi`,
            oauthToken: getGoogleAccessToken,
            order: i * 10,
            name: row.name,
            height: sjOptions.trackHeight,
            minUniquelyMappedReads: sjOptions.minUniquelyMappedReads,
            minTotalReads: sjOptions.minTotalReads,
            maxFractionMultiMappedReads: sjOptions.maxFractionMultiMappedReads,
            minSplicedAlignmentOverhang: sjOptions.minSplicedAlignmentOverhang,
            minSamplesWithThisJunction: sjOptions.minSamplesWithThisJunction,
            maxSamplesWithThisJunction: sjOptions.maxSamplesWithThisJunction,
            minPercentSamplesWithThisJunction: sjOptions.minPercentSamplesWithThisJunction,
            maxPercentSamplesWithThisJunction: sjOptions.maxPercentSamplesWithThisJunction,
            minJunctionEndsVisible: sjOptions.minJunctionEndsVisible,
            thicknessBasedOn: sjOptions.thicknessBasedOn, //options: numUniqueReads (default), numReads, isAnnotatedJunction
            bounceHeightBasedOn: sjOptions.bounceHeightBasedOn, //options: random (default), distance, thickness
            colorBy: sjOptions.colorBy, //options: numUniqueReads (default), numReads, isAnnotatedJunction, strand, motif
            colorByNumReadsThreshold: sjOptions.colorByNumReadsThreshold !== undefined ? sjOptions.colorByNumReadsThreshold : SJ_DEFAULT_COLOR_BY_NUM_READS_THRESHOLD,
            hideStrand: sjOptions.showOnlyPlusStrand ? '-' : (sjOptions.showOnlyMinusStrand ? '+' : undefined),
            labelWith: sjOptions.labelWith,
            labelWithInParen: sjOptions.labelWithInParen,
            hideAnnotatedJunctions: sjOptions.hideAnnotated,
            hideUnannotatedJunctions: sjOptions.hideUnannotated,
            hideMotifs: SJ_MOTIFS.filter((motif) => sjOptions[`hideMotif${motif}`]), //options: 'GT/AG', 'CT/AC', 'GC/AG', 'CT/GC', 'AT/AC', 'GT/AT', 'non-canonical'
            rowName: row.name,
            categoryName: categoryName,
          }
        }
        else if (data.type === 'coverage') {
          if (coverageTrack) {
            console.error('More than one "coverage" track found in row', row)
            return
          }

          coverageTrack = {
            type: 'wig',
            format: 'bigwig',
            url: data.url,
            oauthToken: getGoogleAccessToken,
            name: row.name,
            height: sjOptions.trackHeight,
            order: i * 10 + j,
            rowName: row.name,
            categoryName: categoryName,
          }

          if (data.url.includes('spliceai')) {
            coverageTrack.color = (value) => {
              let c
              if (value < 0.5) {
                c = 'rgb(180,180,180)'
              }
              else if (value < 0.8) {
                c = 'rgb(180,180,0)'
              }
              else {
                c = 'rgb(200,0,0)'
              }

              return c
            }
          }
        }
        else if (['bed', 'gff3', 'gtf', 'genePred', 'genePredExt', 'peaks', 'narrowPeak', 'broadPeak', 'bigBed', 'bedpe'].includes(data.type)) {
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          console.log(`Adding ${data.url} ${data.type} track`)

          igvTracks.push({
            type: 'annotation',
            format: data.type,
            name: `${row.name} ${data.label || ''}`,
            url: data.url,
            indexURL: data.indexURL || `${data.url}.tbi`,
            height: 100,
          })
        }
        else if ((data.type === 'vcf' || data.url.includes('.vcf')) && enabledDataTypes.includes('vcf')) {
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          console.log(`Adding ${data.url} track #`)

          igvTracks.push({
            type: 'variant',
            format: 'vcf',
            url: data.url,
            indexURL: data.indexURL || `${data.url}.tbi`,
            indexed: true,
            name: `${row.name} ${data.label || 'vcf'}`,
            displayMode: vcfOptions.displayMode,
            oauthToken: getGoogleAccessToken,
            order: i * 100 + j,
            rowName: row.name,
            categoryName: categoryName,
          })
        }
        else if (data.type === 'alignment' || data.url.includes('.bam') || data.url.includes('.cram')) {
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          console.log(`Adding ${data.url} track #`)

          igvTracks.push({
            type: 'alignment',
            url: data.url,
            indexURL: data.indexURL || (`${data.url}`.endsWith('cram') ? `${data.url}.crai` : `${data.url}`.endsWith('bam') ? `${data.url}.bai` : null),
            indexed: true,
            name: `${row.name} ${data.label || 'bam'}`,
            height: bamOptions.trackHeight,
            colorBy: bamOptions.colorBy,
            viewAsPairs: bamOptions.viewAsPairs,
            showSoftClips: bamOptions.showSoftClips,
            oauthToken: getGoogleAccessToken,
            order: i * 100 + j,
            rowName: row.name,
            categoryName: categoryName,
          })
        }
      })

      if (coverageTrack && junctionsTrack) {
        console.log(`Adding ${junctionsTrack.url} & ${coverageTrack.url} track`)
        igvTracks.push({
          type: 'merged',
          name: junctionsTrack.name,
          height: sjOptions.trackHeight,
          tracks: [coverageTrack, junctionsTrack],
          order: i * 10 + 2,
          rowName: row.name,
          categoryName: categoryName,
        })
      } else if (junctionsTrack) {
        console.log(`Adding ${junctionsTrack.url} track`)
        igvTracks.push(junctionsTrack)
      } else if (coverageTrack) {
        console.log(`Adding ${coverageTrack.url} track`)
        igvTracks.push(coverageTrack)
      }
    }))

    igvTracks.push({
      name: 'Gencode v32 Genes',
      format: 'refgene',
      url: 'gs://tgg-viewer/ref/GRCh38/gencode_v32/gencode_v32_knownGene.sorted.txt.gz',
      indexURL: 'gs://tgg-viewer/ref/GRCh38/gencode_v32/gencode_v32_knownGene.sorted.txt.gz.tbi',
      indexed: true,
      searchable: true,
      height: 350,
      visibilityWindow: -1,
      displayMode: 'EXPANDED',
      order: 1000001,
      color: 'rgb(76,171,225)',
      oauthToken: getGoogleAccessToken,
    })

    return igvTracks
  },
)
