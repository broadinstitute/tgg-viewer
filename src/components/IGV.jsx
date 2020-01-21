import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import igv from 'igv/dist/igv.esm'
import { connect } from 'react-redux'

import { getGenome, getLocus, getTracks, getSjOptions, getVcfOptions, getBamOptions } from '../redux/selectors'
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

const StyledDiv = styled.div``


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

  render = () => <StyledDiv><div ref={this.setContainerElement} /></StyledDiv>

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

    igv.createBrowser(this.container, igvBrowserOptions).then((browser) => {
      this.browser = browser

      if (locusChangedHandler) {
        this.browser.on('locuschange', throttle(300, locusChangedHandler)) //{chr, start, end, label}
      }

      if (trackRemovedHandler) {
        this.browser.on('trackremoved', (track) => {
          if (!this.ignoreNextTrackRemovedEvent) {
            trackRemovedHandler(track)
          }

          this.ignoreNextTrackRemovedEvent = false
        })
      }
    })
  }

  shouldComponentUpdate(nextProps) {
    if (!this.container) {
      return false
    }

    const {
      locus,
      tracks,
      sjOptions,
      vcfOptions,
      bamOptions,
    } = this.props


    if (nextProps.locus && nextProps.locus !== locus) {
      this.browser.search(nextProps.locus)
    }

    const nextTrackSettingsByTrackName = nextProps.tracks.reduce((acc, item) => {
      return { [item.name]: item, ...acc }
    }, {})

    //console.log('IGV.nextProps:', nextProps)

    // update or remove existing tracks
    tracks.forEach((track) => {
      // TODO check if any tracks need google sign-in

      const nextTrackSettings = nextTrackSettingsByTrackName[track.name]
      if (nextTrackSettings) {
        if ((nextProps.sjOptions !== sjOptions && ['merged', 'wig', 'spliceJunctions'].includes(track.type))
          || (nextProps.vcfOptions !== vcfOptions && track.type === 'variant')
          || (nextProps.bamOptions !== bamOptions && track.type === 'alignment')
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
        } catch (e) {
          console.warn('Unable to remove track', track.name, e)
        }
      }
    })

    // load any newly-selected track(s)
    Object.values(nextTrackSettingsByTrackName).forEach((track) => {
      try {
        this.browser.loadTrack(track)
      } catch (e) {
        console.warn('Unable to add track', track.name, e)
      }
    })

    return false
  }
}


const mapStateToProps = (state) => ({
  genome: getGenome(state),
  locus: getLocus(state),
  tracks: getTracks(state),
  sjOptions: getSjOptions(state),
  vcfOptions: getVcfOptions(state),
  bamOptions: getBamOptions(state),
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

  trackRemovedHandler: (track) => {
    console.log('Removing track', track.config.categoryName, track.config.name)

    dispatch({
      type: 'REMOVE_SELECTED_SAMPLE_NAMES',
      categoryName: [track.config.categoryName],
      selectedSampleNames: [track.config.name],
    })
  },
})

IGV.propTypes = {
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

export { IGV as IGVComponent }

export default connect(mapStateToProps, mapDispatchToProps)(IGV)
