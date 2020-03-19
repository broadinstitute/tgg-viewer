/* eslint-disable no-nested-ternary */
/* eslint-disable object-shorthand */

import { createSelector } from 'reselect'
import { getGoogleAccessToken } from '../utils/googleAuth'
import { MOTIFS, DEFAULT_COLOR_BY_NUM_READS_THRESHOLD } from '../constants'

export const getLocus = (state) => state.locus
export const getRightSideBarLocusList = (state) => state.rightSideBarLocusList
export const getLeftSideBarLocusList = (state) => state.leftSideBarLocusList
export const getGenome = (state) => state.genome
export const getSamplesInCategories = (state) => state.samplesInCategories
export const getSelectedSampleNamesByCategoryName = (state) => state.selectedSampleNamesByCategoryName
export const getSjOptions = (state) => state.sjOptions
export const getVcfOptions = (state) => state.vcfOptions
export const getBamOptions = (state) => state.bamOptions
export const getGcnvOptions = (state) => state.gcnvOptions
export const getUser = (state) => state.user
export const getInitialSettings = (state) => state.initialSettings
export const getInitialSettingsUrl = (state) => state.initialSettingsUrl
export const getInitialSettingsUrlHasBeenApplied = (state) => state.initialSettingsUrlHasBeenApplied


/**
 * Expects sample info like:
 *
 * [
 *    {
 *      label: 'category1',
 *      samples : [
 *          { sample1 .. },
 *          { sample2 .. },
 *          ...
 *      ]
 *    },
 *    {
 *      label: 'category2',
 *      samples : [
 *        { sample3 .. },
 *        { sample4 .. },
 *        ...
 *      ]
 *    },
 * ]
 */


export const getSamplesByCategoryName = createSelector(
  getSamplesInCategories,
  (samplesInCategories) => {
    return samplesInCategories.reduce((acc, category) => {
      return { ...acc, [category.categoryName]: category.samples }
    }, {})
  })


export const getSelectedSamplesByCategoryName = createSelector(
  getSelectedSampleNamesByCategoryName,
  getSamplesByCategoryName,
  (selectedSampleNamesByCategoryName, samplesByCategoryName) => {
    return Object.entries(selectedSampleNamesByCategoryName).reduce((acc, [categoryName, selectedSampleNames]) => {
      if (!samplesByCategoryName[categoryName]) {
        return acc
      }
      return { ...acc, [categoryName]: samplesByCategoryName[categoryName].filter((sample) => selectedSampleNames.includes(sample.name)) }
    }, {})
  })


export const getTracks = createSelector(
  getSelectedSamplesByCategoryName,
  getSjOptions,
  getVcfOptions,
  getBamOptions,
  getGcnvOptions,
  (selectedSamplesByCategoryName, sjOptions, vcfOptions, bamOptions, gcnvOptions) => {
    const igvTracks = []

    Object.entries(selectedSamplesByCategoryName).forEach(([categoryName, selectedSamples]) => selectedSamples.forEach((sample, i) => {
      let junctionsTrack
      let coverageTrack
      (sample.data || []).forEach((data, j) => {
        //docs @ https://github.com/igvteam/igv.js/wiki/Wig-Track

        if (data.type === 'gcnv' && vcfOptions.showGcnv) {
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          console.log(`Adding ${data.url} track #`, i * 100 + j)

          igvTracks.push({
            type: 'gcnv',
            format: 'gcnv',
            name: `${sample.name} ${data.label}`,
            url: data.url,
            indexUrl: `${data.url}.tbi`,
            height: gcnvOptions.trackHeight,
            min: gcnvOptions.trackMin,
            max: gcnvOptions.trackMax,
            autoscale: gcnvOptions.autoscale,
            highlightSamples: {
              C2168_SHE_3134F_1_v1_Exome_GCP: 'blue',
            },
            onlyHandleClicksForHighlightedSamples: gcnvOptions.onlyHandleClicksForHighlightedSamples,
            oauthToken: getGoogleAccessToken,
            order: i * 100 + j,
          })
        }
        else if ((data.type === 'junctions' || data.url.includes('junctions.bed')) && sjOptions.showJunctions) {
          junctionsTrack = {
            type: 'spliceJunctions',
            format: 'bed',
            url: data.url,
            indexURL: `${data.url}.tbi`,
            oauthToken: getGoogleAccessToken,
            order: i * 10,
            name: sample.name,
            categoryName: categoryName,
            height: sjOptions.trackHeight,
            minUniquelyMappedReads: sjOptions.minUniquelyMappedReads,
            minTotalReads: sjOptions.minTotalReads,
            maxFractionMultiMappedReads: sjOptions.maxFractionMultiMappedReads,
            minSplicedAlignmentOverhang: sjOptions.minSplicedAlignmentOverhang,
            thicknessBasedOn: sjOptions.thicknessBasedOn, //options: numUniqueReads (default), numReads, isAnnotatedJunction
            bounceHeightBasedOn: sjOptions.bounceHeightBasedOn, //options: random (default), distance, thickness
            colorBy: sjOptions.colorBy, //options: numUniqueReads (default), numReads, isAnnotatedJunction, strand, motif
            colorByNumReadsThreshold: sjOptions.colorByNumReadsThreshold !== undefined ? sjOptions.colorByNumReadsThreshold : DEFAULT_COLOR_BY_NUM_READS_THRESHOLD,
            hideStrand: sjOptions.showOnlyPlusStrand ? '-' : (sjOptions.showOnlyMinusStrand ? '+' : undefined),
            labelUniqueReadCount: sjOptions.labelUniqueReadCount,
            labelMultiMappedReadCount: sjOptions.labelMultiMappedReadCount,
            labelTotalReadCount: sjOptions.labelTotalReadCount,
            labelMotif: sjOptions.labelMotif,
            labelAnnotatedJunction: sjOptions.labelAnnotatedJunction && sjOptions.labelAnnotatedJunctionValue,
            hideAnnotatedJunctions: sjOptions.hideAnnotated,
            hideUnannotatedJunctions: sjOptions.hideUnannotated,
            hideMotifs: MOTIFS.filter((motif) => sjOptions[`hideMotif${motif}`]), //options: 'GT/AG', 'CT/AC', 'GC/AG', 'CT/GC', 'AT/AC', 'GT/AT', 'non-canonical'
          }
        }
        else if ((data.type === 'coverage' || data.url.includes('.bigWig')) && sjOptions.showCoverage) {
          coverageTrack = {
            type: 'wig',
            format: 'bigwig',
            url: data.url,
            oauthToken: getGoogleAccessToken,
            name: sample.name,
            categoryName: categoryName,
            height: sjOptions.trackHeight,
            order: i * 10 + j,
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
        else if ((data.type === 'vcf' || data.url.includes('.vcf')) && vcfOptions.showVcfs) {
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          console.log(`Adding ${data.url} track #`, i * 100 + j)

          igvTracks.push({
            type: 'variant',
            format: 'vcf',
            url: data.url,
            indexUrl: `${data.url}.tbi`,
            indexed: true,
            name: `${sample.name} ${data.label || data.type}`,
            categoryName: categoryName,
            displayMode: vcfOptions.displayMode,
            oauthToken: getGoogleAccessToken,
            order: i * 100 + j,
          })
        }
        else if ((data.type === 'alignment' || data.url.includes('.bam') || data.url.includes('.cram')) && bamOptions.showBams) {
          //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
          console.log(`Adding ${data.url} track #`, i * 100 + j)

          igvTracks.push({
            type: 'alignment',
            url: data.url,
            indexed: true,
            name: `${sample.name} ${data.label}`,
            categoryName: categoryName,
            height: bamOptions.trackHeight,
            colorBy: bamOptions.colorBy,
            viewAsPairs: bamOptions.viewAsPairs,
            showSoftClips: bamOptions.showSoftClips,
            oauthToken: getGoogleAccessToken,
            order: i * 100 + j,
          })
        }
      })

      if (coverageTrack && junctionsTrack) {
        console.log(`Adding ${junctionsTrack.url} & ${coverageTrack.url} track`)
        igvTracks.push({
          type: 'merged',
          name: junctionsTrack.name,
          categoryName: categoryName,
          height: sjOptions.trackHeight,
          tracks: [coverageTrack, junctionsTrack],
          order: i * 10 + 2,
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
      url: 'gs://macarthurlab-rnaseq/reference_tracks/gencode_v32_knownGene.sorted.txt.gz',
      indexUrl: 'gs://macarthurlab-rnaseq/reference_tracks/gencode_v32_knownGene.sorted.txt.gz.tbi',
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
