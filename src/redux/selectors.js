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
export const getIsLeftSideBarVisible = (state) => state.showLeftSideBar
export const getIsRightSideBarVisible = (state) => state.showRightSideBar
export const getDataTypesToShow = (state) => state.dataTypesToShow
export const getRowsInCategories = (state) => state.rowsInCategories
export const getSelectedRowNamesByCategoryName = (state) => state.selectedRowNamesByCategoryName
export const getSelectedSamplesByCategoryNameAndRowName = (state) => state.selectedSamplesByCategoryNameAndRowName
export const getTrackOrder = (state) => state.trackOrder
export const getSjOptions = (state) => state.sjOptions
export const getVcfOptions = (state) => state.vcfOptions
export const getBamOptions = (state) => state.bamOptions
export const getGcnvOptions = (state) => state.gcnvOptions
export const getUser = (state) => state.user
export const getIsGoogleLoginRequired = (state) => state.isGoogleLoginRequired
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
  getTrackOrder,
  getEnabledDataTypes,
  getSjOptions,
  getVcfOptions,
  getBamOptions,
  getGcnvOptions,
  (
    selectedRowsByCategoryName,
    selectedSamplesByCategoryNameAndRowName,
    trackOrderArray,
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

        const computeTrackOrder = (trackName) => {
          let trackOrder = trackOrderArray.indexOf(trackName) //add category as prefix to trackOrder strings?
          if (trackOrder !== -1) {
            trackOrder += 50000
          } else {
            trackOrder = i * 100 + j //default track order
          }
          return trackOrder
        }

        if (data.type === 'gcnv_bed') { // && vcfOptions.showGcnv
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          const trackName = `${row.name} ${data.label || ''}`
          const trackOrder = computeTrackOrder(trackName)
          console.log(`Adding ${trackName} (${data.url}) track: order ${trackOrder}`)

          igvTracks.push({
            type: 'gcnv',
            format: 'gcnv',
            name: trackName,
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
            order: trackOrder,
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
            name: row.name,
            order: computeTrackOrder(row.name),
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
            order: computeTrackOrder(row.name),
            height: sjOptions.trackHeight,
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
          const trackName = `${row.name} ${data.label || ''}`
          const trackOrder = computeTrackOrder(trackName)
          console.log(`Adding ${trackName} (${data.url}) ${data.type} track: order ${trackOrder}`)

          igvTracks.push({
            type: 'annotation',
            format: data.type,
            name: trackName,
            order: trackOrder,
            url: data.url,
            delimiter: data.delimiter,
            nameField: data.nameField,
            oauthToken: getGoogleAccessToken,
            indexURL: data.indexURL || `${data.url}.tbi`,
            height: 100,
          })
        }
        else if ((data.type === 'vcf' || data.url.includes('.vcf')) && enabledDataTypes.includes('vcf')) {
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          const trackName = `${row.name} ${data.label || 'vcf'}`
          const trackOrder = computeTrackOrder(trackName)
          console.log(`Adding ${trackName} (${data.url}) track: order ${trackOrder}`)

          igvTracks.push({
            type: 'variant',
            format: 'vcf',
            url: data.url,
            indexURL: data.indexURL || `${data.url}.tbi`,
            indexed: true,
            name: trackName,
            order: trackOrder,
            displayMode: vcfOptions.displayMode,
            oauthToken: getGoogleAccessToken,
            rowName: row.name,
            categoryName: categoryName,
          })
        }
        else if (data.type === 'alignment' || data.url.includes('.bam') || data.url.includes('.cram')) {
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          const trackName = `${row.name} ${data.label || 'bam'}`
          const trackOrder = computeTrackOrder(trackName)
          console.log(`Adding ${trackName} (${data.url}) track: order ${trackOrder}`)

          igvTracks.push({
            type: 'alignment',
            url: data.url,
            indexURL: data.indexURL || (`${data.url}`.endsWith('cram') ? `${data.url}.crai` : `${data.url}`.endsWith('bam') ? `${data.url}.bai` : null),
            indexed: true,
            name: trackName,
            order: trackOrder,
            height: bamOptions.trackHeight,
            colorBy: bamOptions.colorBy,
            viewAsPairs: bamOptions.viewAsPairs,
            showSoftClips: bamOptions.showSoftClips,
            oauthToken: getGoogleAccessToken,
            rowName: row.name,
            categoryName: categoryName,
          })
        }
      })

      if (coverageTrack && junctionsTrack) {
        console.log(`Adding ${junctionsTrack.name} (${junctionsTrack.url} & ${coverageTrack.url}) track: order ${junctionsTrack.order}`)
        igvTracks.push({
          type: 'merged',
          name: junctionsTrack.name,
          order: junctionsTrack.order,
          height: sjOptions.trackHeight,
          tracks: [coverageTrack, junctionsTrack],
          rowName: row.name,
          categoryName: categoryName,
        })
      } else if (junctionsTrack) {
        console.log(`Adding ${junctionsTrack.name} (${junctionsTrack.url}) track: order ${junctionsTrack.order}`)
        igvTracks.push(junctionsTrack)
      } else if (coverageTrack) {
        console.log(`Adding ${coverageTrack.name} (${coverageTrack.url}) track: order ${coverageTrack.order}`)
        igvTracks.push(coverageTrack)
      }
    }))

    // add gencode genes
    const gencodeGeneTrackName = 'Gencode v46 Genes'

    let gencodeGeneTrackOrder = trackOrderArray.indexOf(gencodeGeneTrackName)
    if (gencodeGeneTrackOrder !== -1) {
      gencodeGeneTrackOrder += 50000
    } else {
      gencodeGeneTrackOrder = 1000001
    }

    igvTracks.push({
      name: gencodeGeneTrackName,
      format: 'refgene',
      url: 'gs://tgg-viewer/ref/GRCh38/gencode_v46/gencode.v46.GRCh38.sorted.txt.gz',
      indexURL: 'gs://tgg-viewer/ref/GRCh38/gencode_v46/gencode.v46.GRCh38.sorted.txt.gz.tbi',
      indexed: true,
      searchable: true,
      height: 350,
      visibilityWindow: -1,
      displayMode: 'EXPANDED',
      order: gencodeGeneTrackOrder,
      color: 'rgb(76,171,225)',
      oauthToken: getGoogleAccessToken,
    })

    return igvTracks
  },
)
