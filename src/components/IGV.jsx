import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import igv from 'igv/dist/igv.esm'
import { connect } from 'react-redux'

import { getGenome, getLocus, getTracks, getSjOptions, getVcfOptions, getBamOptions } from '../redux/selectors'
import { getGoogleUserEmail, googleSignIn, initGoogleClient } from '../utils/googleAuth'

const IGV_SETTINGS = {
  showIdeogram: true,
  showNavigation: true,
  showRuler: true,
  showCenterGuide: true,
  showCursorTrackingGuide: true,
  showCommandBar: true,
}

const StyledDiv = styled.div``

const throttle = (delay, fn) => {
  let timerId
  return (...args) => {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }
}

class IGV extends React.Component {

  static propTypes = {
    genome: PropTypes.string.isRequired,
    locus: PropTypes.string.isRequired,
    tracks: PropTypes.array.isRequired,
    locusChangedHandler: PropTypes.func,
    trackRemovedHandler: PropTypes.func,
    userChangedHandler: PropTypes.func,
    sjOptions: PropTypes.object,
    vcfOptions: PropTypes.object,
    bamOptions: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.container = null
    this.browser = null
    this.ignoreNextTrackRemovedEvent = false
  }

  setContainerElement = (element) => {
    this.container = element
  }

  render = () => <StyledDiv><div ref={this.setContainerElement} /></StyledDiv>

  async componentDidMount() {

    if (!this.container) {
      return
    }

    let igvBrowserOptions = {
      ...IGV_SETTINGS,
      locus: this.props.locus,
      genome: this.props.genome,
      tracks: this.props.tracks,
    }

    // TODO check if any tracks need google sign-in
    await initGoogleClient()
    await googleSignIn()
    let googleUserEmail = await getGoogleUserEmail()
    this.props.userChangedHandler(googleUserEmail)

    igv.createBrowser(this.container, igvBrowserOptions).then((browser) => {
      this.browser = browser

      if (this.props.locusChangedHandler) {
        this.browser.on('locuschange', throttle(300, this.props.locusChangedHandler)) //{chr, start, end, label}
      }

      if (this.props.trackRemovedHandler) {
        this.browser.on('trackremoved', track => {
          if (!this.ignoreNextTrackRemovedEvent) {
            this.props.trackRemovedHandler(track)
          }

          this.ignoreNextTrackRemovedEvent = false
        })
      }
    })
  }

  shouldComponentUpdate = nextProps => {
    if (!this.container) {
      return false
    }

    let nextTrackSettingsByTrackName = nextProps.tracks.reduce((acc, item) => {
      return {[item.name]: item, ...acc}
    }, {})

    console.log('IGV.nextProps:', nextProps )
    // update or remove existing tracks
    for (let track of this.props.tracks) {
      // TODO check if any tracks need google sign-in

      const nextTrackSettings = nextTrackSettingsByTrackName[track.name]
      if (nextTrackSettings) {
        if ( (nextProps.sjOptions !== this.props.sjOptions && ['merged', 'wig', 'junctions'].includes(track.type) ) ||
             (nextProps.vcfOptions !== this.props.vcfOptions && 'variant' === track.type) ||
             (nextProps.bamOptions !== this.props.bamOptions && 'alignment' === track.type)
        ) {
          this.ignoreNextTrackRemovedEvent = true
          this.browser.removeTrackByName(track.name)
          this.browser.loadTrack(nextTrackSettings)
        }

        // delete track from nextTrackSettingsByTrackName to indicate that it's still selected
        delete nextTrackSettingsByTrackName[track.name]

      } else {
        // remove track that was de-selected
        try {
          this.ignoreNextTrackRemovedEvent = true
          this.browser.removeTrackByName(track.name)
        } catch(e) {
          console.warn('Unable to remove track', track.name, e)
        }
      }
    }

    // load any newly-selected track(s)
    for (let track of Object.values(nextTrackSettingsByTrackName)) {
      try {
        this.browser.loadTrack(track)
      } catch(e) {
        console.warn('Unable to add track', track.name, e)
      }
    }

    return false
  }
}


const mapStateToProps = state => ({
  genome: getGenome(state),
  locus: getLocus(state),
  tracks: getTracks(state),
  sjOptions: getSjOptions(state),
  vcfOptions: getVcfOptions(state),
  bamOptions: getBamOptions(state),
})


const mapDispatchToProps = dispatch => ({
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
      updates: {googleUserEmail}
    })
  },

  trackRemovedHandler: (track) => {
    dispatch({
      type: 'REMOVE_SELECTED_SAMPLE_NAMES',
      values: [track.name],
    })
  },
})

export { IGV as IGVComponent }

export default connect(mapStateToProps, mapDispatchToProps)(IGV)

