/* eslint-disable eqeqeq */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-prop-types */

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


class IGV extends React.Component {

  constructor(props) {
    super(props)

    this.container = null
    this.browser = null
    this.ignoreNextTrackRemovedEvent = false
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

      if (locusChangedHandler) {
        this.browser.on('locuschange', throttle(300, locusChangedHandler))
      }

      if (trackRemovedHandler) {
        this.browser.on('trackremoved', (track) => {
          if (!this.ignoreNextTrackRemovedEvent) {
            trackRemovedHandler(track.config.categoryName, track.config.rowName)
          }
          this.ignoreNextTrackRemovedEvent = false
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

    return junctionTrackDisplaySettingsChanged
      || vcfTrackDisplaySettingsChanged
      || alignmentTrackDisplaySettingsChanged
      || gcnvTrackDisplaySettingsChanged
      || gcnvTrackHighlightedSamplesChanged
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

    const nextTrackByTrackName = nextProps.tracks.reduce((acc, track) => {
      return { [track.name]: track, ...acc }
    }, {})

    // reload or remove existing tracks
    this.props.tracks.forEach((track) => {
      const nextTrack = nextTrackByTrackName[track.name]
      if (nextTrack) {
        if (this.shouldTrackBeReloaded(track, this.props, nextProps))
        {
          console.log('Reloading track', track.name)
          this.ignoreNextTrackRemovedEvent = true
          this.browser.removeTrackByName(track.name)
          if (!this.getIgvTrackView(track)) { // double-check that the track isn't already loaded
            //console.log('calling this.browser.loadTrack for', track.name)
            this.browser.loadTrack(nextTrack)
          }
        }

        // delete track from nextTrackByTrackName to indicate that it's still selected
        delete nextTrackByTrackName[track.name]

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

    // load any newly-selected track(s)
    const remainingTracks = Object.values(nextTrackByTrackName)
    remainingTracks.forEach((track) => {
      try {
        if (!this.getIgvTrackView(track)) { // double-check that the track isn't already loaded
          console.log('Loading new track', track.name)
          this.browser.loadTrack(track)
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
    const newLocus = event.label.replace(/,/g, '')

    dispatch({
      type: 'UPDATE_LOCUS',
      newValue: newLocus,
    })
  },

  trackRemovedHandler: (categoryName, trackName) => {
    dispatch({
      type: 'REMOVE_SELECTED_ROW_NAMES',
      categoryName,
      selectedRowNames: [trackName],
    })
  },
})


export default connect(mapStateToProps, mapDispatchToProps)(IGV)
