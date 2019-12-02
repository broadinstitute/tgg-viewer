import { createSelector } from 'reselect'
import { getGoogleAccessToken } from '../utils/googleAuth'
import { MOTIFS } from './constants'

export const getLocus = state => state.locus
export const getGenome = state => state.genome
export const getSamplesInfo = state => state.samplesInfo
export const getSelectedSampleNames = state => state.selectedSampleNames
export const getSjOptions = state => state.sjOptions
export const getBamOptions = state => state.bamOptions


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

export const getSelectedSamples = createSelector(
  getSamplesInfo,
  getSelectedSampleNames,
  (samplesInfo, selectedSampleNames) => samplesInfo.map(category => category.samples).flat().filter(s => selectedSampleNames.includes(s.name)),
)


export const getTracks = createSelector(
  getSelectedSamples,
  getSjOptions,
  getBamOptions,
  (selectedSamples, sjOptions, bamOptions) => {
    const igvTracks = []

    selectedSamples.forEach((sample) => {
      //docs @ https://github.com/igvteam/igv.js/wiki/Wig-Track
      let junctionsTrack
      if (sample.junctions && (!sjOptions.hideAnnotated || !sjOptions.hideUnannotated)) {
        junctionsTrack = {
          type: 'junctions',
          format: 'bed',
          url: sample.junctions,
          indexURL: `${sample.junctions}.tbi`,
          oauthToken: getGoogleAccessToken,
          name: sample.name,
          height: sjOptions.trackHeight,
          minUniquelyMappedReads: sjOptions.minUniquelyMappedReads,
          minTotalReads: sjOptions.minTotalReads,
          maxFractionMultiMappedReads: sjOptions.maxFractionMultiMappedReads,
          minSplicedAlignmentOverhang: sjOptions.minSplicedAlignmentOverhang,
          thicknessBasedOn: sjOptions.thicknessBasedOn, //options: numUniqueReads (default), numReads, isAnnotatedJunction
          bounceHeightBasedOn: sjOptions.bounceHeightBasedOn, //options: random (default), distance, thickness
          colorBy: sjOptions.colorBy, //options: numUniqueReads (default), numReads, isAnnotatedJunction, strand, motif
          labelUniqueReadCount: sjOptions.labelUniqueReadCount,
          labelMultiMappedReadCount: sjOptions.labelMultiMappedReadCount,
          labelTotalReadCount: sjOptions.labelTotalReadCount,
          labelMotif: sjOptions.labelMotif,
          labelIsAnnotatedJunction: sjOptions.labelIsAnnotatedJunction && sjOptions.labelIsAnnotatedJunctionValue,
          hideAnnotatedJunctions: sjOptions.hideAnnotated,
          hideUnannotatedJunctions: sjOptions.hideUnannotated,
          hideMotifs: MOTIFS.filter( motif => sjOptions[`hideMotif${motif}`] ), //options: 'GT/AG', 'CT/AC', 'GC/AG', 'CT/GC', 'AT/AC', 'GT/AT', 'non-canonical'
        }
      }

      let coverageTrack
      if(sample.coverage && !sjOptions.hideCoverage) {
        coverageTrack = {
          type: 'wig',
          format: 'bigwig',
          url: sample.coverage,
          oauthToken: getGoogleAccessToken,
          name: sample.name,
          height: sjOptions.trackHeight,
        }
      }

      if (coverageTrack && junctionsTrack) {
        igvTracks.push({
          type: 'merged',
          name: sample.name,
          height: sjOptions.trackHeight,
          tracks: [coverageTrack, junctionsTrack],
        })
      } else if (coverageTrack) {
        igvTracks.push(coverageTrack)
      } else if (junctionsTrack) {
        //igvTracks.push(junctionsTrack)
        igvTracks.push({
          type: 'merged',
          name: sample.name,
          height: sjOptions.trackHeight,
          tracks: [junctionsTrack],
        })
      }

      /*
      if (sample.vcf) {
        //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
        console.log(`Adding ${sample.vcf} track`)

        igvTracks.push({
          type: 'variant',
          format: 'vcf',
          url: sample.vcf,
          indexUrl: `${sample.vcf}.tbi`,
          oauthToken: getGoogleAccessToken,
          name: sample.name,
          displayMode: 'SQUISHED',
        })
      }
      */
      if (bamOptions.showBams && sample.bam) {
        //docs @ https://github.com/igvteam/igv.js/wiki/Alignment-Track
        console.log(`Adding ${sample.bam} track`)

        igvTracks.push({
          type: 'alignment',
          url: sample.bam,
          name: `${sample.name} bam`,
          alignmentShading: bamOptions.alignmentShading,
          showSoftClips: bamOptions.showSoftClips,
          oauthToken: getGoogleAccessToken,
          //...trackOptions,
        })
      }
    })

    return igvTracks
  }
)
