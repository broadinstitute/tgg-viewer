/* eslint-disable eqeqeq */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable radix */
/* eslint-disable prefer-template */
/* eslint-disable no-else-return */

import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import igv from 'igv/dist/igv.esm'
import { connect } from 'react-redux'

import {
  getGenome,
  getLocus,
  getTracks,
  getSelectedSamplesByCategoryNameAndRowName,
  getEnabledDataTypes,
  getSjOptions,
  getVcfOptions,
  getBamOptions,
  getGcnvOptions,
} from '../redux/selectors'
import { throttle } from '../utils/throttle'

const IGV_SETTINGS = {
  showIdeogram: true,
  showNavigation: true,
  showRuler: true,
  showCenterGuide: true,
  showCursorTrackingGuide: true,
  showCommandBar: true,
}


/**
 * Use a custom popupData function for the spliceJunction track
 */
function popupData(clickState, features) {

  if (!features) features = this.clickedFeatures(clickState)

  let featureData = []
  features.forEach((feature) => {

    if (feature.end < clickState.genomicLocation || feature.start > clickState.genomicLocation) {
      return
    }
    if (this.config.type === 'spliceJunctions') {
      if (!feature.isVisible || !feature.attributes) {
        return
      }
      featureData.push('<hr />')
      featureData.push(
        { name: `<b>${feature.chr}:${feature.start}-${feature.end} (${feature.strand} strand)</b>`, value: ' ' })

      if (feature.attributes.annotated_junction) {
        if (feature.attributes.annotated_junction === 'true') {
          featureData.push({ name: 'Known Junction', value: '' })
        } else {
          featureData.push({ name: 'Novel Junction', value: '' })
        }
      }
      featureData.push('<hr />')

      featureData.push(
        { name: (feature.end - feature.start).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), value: 'bp length' })

      if (feature.attributes.uniquely_mapped) {
        featureData.push(
          { name: feature.attributes.uniquely_mapped, value: 'uniquely mapped reads' })
      }
      if (feature.attributes.multi_mapped) {
        featureData.push(
          { name: feature.attributes.multi_mapped, value: 'multi-mapped reads' })
      }
      if (feature.attributes.uniquely_mapped && feature.attributes.multi_mapped) {
        featureData.push(
          { name: parseInt(feature.attributes.uniquely_mapped) + parseInt(feature.attributes.multi_mapped), value: 'total reads' })
      }
      if (feature.attributes.maximum_spliced_alignment_overhang) {
        featureData.push({ name: feature.attributes.maximum_spliced_alignment_overhang, value: 'bp maximum overhang' })
      }

      if (feature.attributes.num_samples_with_this_junction) {
        featureData.push({
          name: feature.attributes.num_samples_with_this_junction,
          value: (feature.attributes.num_samples_total ? `out of ${feature.attributes.num_samples_total} ` : '') + 'samples have this junction',
        })
        if (feature.attributes.percent_samples_with_this_junction) {
          featureData.push({ name: feature.attributes.percent_samples_with_this_junction.toFixed(1), value: '% of samples have this junction' })
        }

      }
      if (feature.attributes.info) {
        featureData.push({ name: ' ', value: feature.attributes.info.replace('_', ' ') })
      }

      //add any other keys not already processed above
      Object.keys(feature.attributes).filter((key) => ![
        'line_width', 'color', 'left_shape', 'right_shape', 'info',
        'annotated_junction', 'uniquely_mapped', 'multi_mapped', 'maximum_spliced_alignment_overhang',
        'num_samples_with_this_junction', 'percent_samples_with_this_junction', 'num_samples_total',
      ].includes(key)).forEach((key) => {
        featureData.push({ name: key.replace(/_/g, ' '), value: feature.attributes[key].replace(/_/g, ' ') })
      })

      featureData = featureData.map((fd) => {
        if (fd.name && fd.value) {
          return { name: `<b>${fd.name}</b>`, value: fd.value }
        } else {
          return fd
        }
      })
    }
  })

  return featureData
}


const monkeyPatchPopupData = (track) => {
  if (!track) {
    console.warn('monkeyPatchPopupData: track arg is undefined')
    return
  }

  if (track.type === 'spliceJunctions') {
    track.popupData = popupData
  } else if (track.type === 'merged') {
    track.tracks.filter((subTrack) => subTrack.type === 'spliceJunctions').forEach((subTrack) => {
      subTrack.popupData = popupData
    })
  }
}


class IGV extends React.Component {

  constructor(props) {
    super(props)

    this.container = null
    this.browser = null
    this.ignoreNextLocusChangedEvent = false
    this.ignoreNextTrackRemovedEvent = false
    this.ignoreNextTrackPropsAfterOrderChangedEvent = false
  }

  setContainerElement = (element) => {
    this.container = element
  }

  render = () => <div><div ref={this.setContainerElement} /></div>

  async componentDidMount() {

    if (!this.container) {
      return
    }

    const {
      genome,
      locus,
      tracks,
      locusChangedHandler,
      trackRemovedHandler,
      trackOrderChangedHandler,
    } = this.props

    const igvBrowserOptions = {
      ...IGV_SETTINGS,
      locus,
      genome,
      tracks,
    }

    //console.log('Calling igv.createBrowser(..)', igvBrowserOptions)
    igv.createBrowser(this.container, igvBrowserOptions).then((browser) => {
      this.browser = browser
      window.igvBrowser = browser //for debugging

      browser.trackViews.forEach((trackView) => { monkeyPatchPopupData(trackView.track) })

      if (locusChangedHandler) {
        this.browser.on('locuschange', throttle(300, (event) => {
          if (!this.ignoreNextLocusChangedEvent) {
            locusChangedHandler(event)
          }
          this.ignoreNextLocusChangedEvent = false
        }))
      }

      if (trackRemovedHandler) {
        this.browser.on('trackremoved', (track) => {
          if (!this.ignoreNextTrackRemovedEvent) {
            trackRemovedHandler(track.config.categoryName, track.config.rowName)
          }
          this.ignoreNextTrackRemovedEvent = false
        })
      }

      if (trackOrderChangedHandler) {
        this.browser.on('trackorderchanged', (trackNamesInOrder) => {
          this.ignoreNextTrackPropsAfterOrderChangedEvent = true
          trackOrderChangedHandler(trackNamesInOrder)
        })
      }
    })
  }

  shouldTrackBeReloaded = (track, props, nextProps) => {
    const {
      selectedSamplesByCategoryNameAndRowName,
      enabledDataTypes,
      sjOptions,
      vcfOptions,
      bamOptions,
      gcnvOptions,
    } = props

    const junctionTrackDisplaySettingsChanged = ['merged', 'wig', 'spliceJunctions'].includes(track.type) && (
      nextProps.enabledDataTypes.includes('junctions') !== enabledDataTypes.includes('junctions')
      || nextProps.enabledDataTypes.includes('coverage') !== enabledDataTypes.includes('coverage')
      || nextProps.sjOptions !== sjOptions)
    const vcfTrackDisplaySettingsChanged = track.type === 'variant' && nextProps.vcfOptions !== vcfOptions
    const alignmentTrackDisplaySettingsChanged = track.type === 'alignment' && nextProps.bamOptions !== bamOptions
    const gcnvTrackDisplaySettingsChanged = track.type === 'gcnv' && nextProps.gcnvOptions !== gcnvOptions
    const gcnvTrackHighlightedSamplesChanged = track.type === 'gcnv' && (
      !_.isEqual(
        ((nextProps.selectedSamplesByCategoryNameAndRowName[track.categoryName] || {}).selectedSamples || {})[track.rowName],
        ((selectedSamplesByCategoryNameAndRowName[track.categoryName] || {}).selectedSamples || {})[track.rowName])
      || !_.isEqual(
        ((nextProps.selectedSamplesByCategoryNameAndRowName[track.categoryName] || {}).sampleSettings || {})[track.rowName],
        ((selectedSamplesByCategoryNameAndRowName[track.categoryName] || {}).sampleSettings || {})[track.rowName])
    )

    const result = junctionTrackDisplaySettingsChanged
      || vcfTrackDisplaySettingsChanged
      || alignmentTrackDisplaySettingsChanged
      || gcnvTrackDisplaySettingsChanged
      || gcnvTrackHighlightedSamplesChanged

    //console.log('Should track', track.name, track.order, 'be reloaded? ', result)

    return result
  }

  getTrackId = (track) => `${track.url}|${track.categoryName}|${track.rowName}`

  getIgvTrackView = (track) => {
    const trackId = this.getTrackId(track)

    const existingTrackViews = this.browser.trackViews.filter((existingTrackView) => {
      const existingTrackConfig = (existingTrackView.track || {}).config || {}
      return trackId === this.getTrackId(existingTrackConfig)
    })

    return existingTrackViews.length > 0 && existingTrackViews[0]
  }

  reloadRemoveAndAddTracks = (nextProps) => {
    if (this.ignoreNextTrackPropsAfterOrderChangedEvent) {
      this.ignoreNextTrackPropsAfterOrderChangedEvent = false
      return
    }
    const nextTrackByTrackNameAndType = nextProps.tracks.reduce((acc, track) => {
      return { [`${track.name}|${track.type}`]: track, ...acc }
    }, {})

    // reload or remove existing tracks
    if (this.props.tracks) {
      this.props.tracks.forEach(async (track) => {
        const nextTrack = nextTrackByTrackNameAndType[`${track.name}|${track.type}`]
        if (nextTrack) {
          if (this.shouldTrackBeReloaded(track, this.props, nextProps)) {
            const trackView = this.getIgvTrackView(track)
            console.log('Reloading track', track.name, nextTrack)
            trackView.track.updateConfig(nextTrack)
            await trackView.track.postInit()
            //await trackView.updateViews(true)
            trackView.repaintViews()
          }

          // delete track from nextTrackByTrackNameAndType to indicate that it's still selected
          delete nextTrackByTrackNameAndType[`${track.name}|${track.type}`]

        } else {
          // remove track that was de-selected
          try {
            console.log('Removing track', track.name)
            this.ignoreNextTrackRemovedEvent = true
            this.browser.removeTrackByName(track.name)
          } catch (e) {
            console.warn('Unable to remove track', track.name, e)
          }
        }
      })
    }
    // load any newly-selected track(s)
    const remainingTracks = Object.values(nextTrackByTrackNameAndType)
    remainingTracks.forEach((track) => {
      try {
        if (!this.getIgvTrackView(track)) { // double-check that the track isn't already loaded
          console.log('Loading new track', track.name)
          this.browser.loadTrack(track).then(monkeyPatchPopupData)
        }
      } catch (e) {
        console.warn('Unable to add track', track.name, e)
      }
    })
  }

  shouldComponentUpdate(nextProps) {
    if (!this.container || !this.browser) {
      return false
    }

    //console.log('Should component update', nextProps)
    //update locus
    const currentIGVLocus = this.browser.$searchInput.val()
    const nextIGVLocus = nextProps.locus
    if (nextProps.locus && (!currentIGVLocus || nextIGVLocus.replace(/,/g, '') !== currentIGVLocus.replace(/,/g, ''))) {
      this.ignoreNextLocusChangedEvent = true
      this.browser.search(nextIGVLocus)
    }

    this.reloadRemoveAndAddTracks(nextProps)

    return false
  }
}

IGV.propTypes = {
  genome: PropTypes.string.isRequired,
  locus: PropTypes.string.isRequired,
  tracks: PropTypes.array.isRequired,
  selectedSamplesByCategoryNameAndRowName: PropTypes.object.isRequired,
  enabledDataTypes: PropTypes.array.isRequired,
  locusChangedHandler: PropTypes.func,
  trackRemovedHandler: PropTypes.func,
  trackOrderChangedHandler: PropTypes.func,
  sjOptions: PropTypes.object,
  vcfOptions: PropTypes.object,
  bamOptions: PropTypes.object,
  gcnvOptions: PropTypes.object,
}

const mapStateToProps = (state) => ({
  genome: getGenome(state),
  locus: getLocus(state),
  tracks: getTracks(state),
  enabledDataTypes: getEnabledDataTypes(state),
  selectedSamplesByCategoryNameAndRowName: getSelectedSamplesByCategoryNameAndRowName(state),
  sjOptions: getSjOptions(state),
  vcfOptions: getVcfOptions(state),
  bamOptions: getBamOptions(state),
  gcnvOptions: getGcnvOptions(state),
})


const mapDispatchToProps = (dispatch) => ({
  locusChangedHandler: (event) => {
    if (event && event.label) {
      const newLocus = event.label.replace(/,/g, '')
      dispatch({
        type: 'UPDATE_LOCUS',
        newValue: newLocus,
      })
    }
  },

  trackRemovedHandler: (categoryName, trackName) => {
    dispatch({
      type: 'REMOVE_SELECTED_ROW_NAMES',
      categoryName,
      selectedRowNames: [trackName],
    })
  },

  trackOrderChangedHandler: (trackNames) => {
    dispatch({
      type: 'UPDATE_TRACK_ORDER',
      newValue: trackNames,
    })
  },
})


export default connect(mapStateToProps, mapDispatchToProps)(IGV)
