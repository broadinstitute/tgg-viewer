/* eslint-disable eqeqeq */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-prop-types */

import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
//import styled from 'styled-components'
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
import { getGoogleUserEmail, googleSignIn, initGoogleClient } from '../utils/googleAuth'
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
      userChangedHandler,
    } = this.props

    const igvBrowserOptions = {
      ...IGV_SETTINGS,
      locus,
      genome,
      tracks,
    }

    // TODO check if any tracks need google sign-in
    await initGoogleClient()
    await googleSignIn()
    const googleUserEmail = await getGoogleUserEmail()
    userChangedHandler(googleUserEmail)

    console.log('Calling igv.createBrowser(..)', igvBrowserOptions)
    igv.createBrowser(this.container, igvBrowserOptions).then((browser) => {
      this.browser = browser
      window.igvBrowser = browser //for debugging

      if (locusChangedHandler) {
        this.browser.on('locuschange', throttle(300, locusChangedHandler)) //{chr, start, end, label}
      }

      if (trackRemovedHandler) {
        this.browser.on('trackremoved', (track) => {
          trackRemovedHandler(track.config.categoryName, track.config.name)
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

  isTrackAlreadyLoaded = (trackSettings) => {
    const trackId = `${trackSettings.url}|${trackSettings.name}`

    const existingTracks = this.browser.trackViews.filter((existingTrackView) => {
      const config = (existingTrackView.track || {}).config || {}
      const existingTrackId = `${config.url}|${config.name}`

      return trackId === existingTrackId
    })

    return existingTracks.length > 0
  }

  reloadRemoveAndAddTracks = (nextProps) => {

    const nextTrackSettingsByTrackName = nextProps.tracks.reduce((acc, track) => {
      return { [track.name]: track, ...acc }
    }, {})

    //console.log('IGV.nextProps:', nextProps)

    // reload or remove existing tracks
    this.props.tracks.forEach((track) => {
      const nextTrackSettings = nextTrackSettingsByTrackName[track.name]
      if (nextTrackSettings) {
        if (this.shouldTrackBeReloaded(track, this.props, nextProps))
        {
          console.log('Reloading track', track.name)
          this.browser.removeTrackByName(track.name)
          if (!this.isTrackAlreadyLoaded(track)) {
            this.browser.loadTrack(nextTrackSettings)
          }
        }

        // delete track from nextTrackSettingsByTrackName to indicate that it's still selected
        delete nextTrackSettingsByTrackName[track.name]

      } else {
        // remove track that was de-selected
        try {
          //console.log('Removing track', track.name)
          this.browser.removeTrackByName(track.name)
        } catch (e) {
          console.warn('Unable to remove track', track.name, e)
        }
      }
    })

    // load any newly-selected track(s)
    const remainingTracks = Object.values(nextTrackSettingsByTrackName)
    remainingTracks.forEach((trackSettings) => {
      try {
        if (!this.isTrackAlreadyLoaded(trackSettings)) {
          console.log('Loading new track', trackSettings.name)
          this.browser.loadTrack(trackSettings)
        }
      } catch (e) {
        console.warn('Unable to add track', trackSettings.name, e)
      }
    })
  }

  shouldComponentUpdate(nextProps) {
    if (!this.container || !this.browser) {
      return false
    }

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
  userChangedHandler: PropTypes.func,
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

  userChangedHandler: (googleUserEmail) => {
    dispatch({
      type: 'UPDATE_USER',
      updates: { googleUserEmail },
    })
  },

  trackRemovedHandler: (categoryName, trackName) => {
    console.log('Removing track', categoryName, trackName)

    dispatch({
      type: 'REMOVE_SELECTED_ROW_NAMES',
      categoryName: [categoryName],
      selectedRowNames: [trackName],
    })
  },
})


export default connect(mapStateToProps, mapDispatchToProps)(IGV)
