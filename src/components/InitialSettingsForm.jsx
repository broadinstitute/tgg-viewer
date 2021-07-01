/* eslint-disable react/no-find-dom-node */
/* eslint-disable react/destructuring-assignment */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Button, Input, Popup } from 'semantic-ui-react'
import delay from 'timeout-as-promise'
import yaml from 'js-yaml'
import { getInitialSettingsUrl } from '../redux/selectors'
import RequestStatus from './RequestStatus'
import { DEFAULT_STATE, getStateFromLocalStorage, getStateFromUrlHash } from '../redux/initialState'

const StyledDiv = styled.div`
  color: #999;
  width: 100%;
  text-align: center;
  
  .ui.label {
    color: #444;
    background-color: #f3f3f3;
  }
`

const StyledInput = styled(Input)`
  margin-top: 100px;
  width: calc(100% - 350px);
`

const StyledButton = styled(Button)`
  margin-left: 20px !important;
  margin-right: 15px !important;
`

const StyledButton2 = styled(Button)`
  margin-left: 10px !important;
`

class InitialSettingsForm extends React.PureComponent
{
  constructor(props) {
    super(props)
    this.textInputValue = props.initialSettingsUrl || ''
    this.state = {
      requestStatus: RequestStatus.NONE,
      successMessage: '',
      errorMessage: '',
    }
  }

  async componentDidMount() {
    const { initialSettingsUrl } = this.props
    if (initialSettingsUrl) {
      // download url
      console.log('Loading settings from', initialSettingsUrl)
      await this.applyInitialSettingsUrl(initialSettingsUrl, false)
    }
  }

  loadInitialSettingsUrl = async (url, overrideLocalSettings) => {
    const {
      globalState,
      updateInitialSettingsUrl,
      resetGlobalState,
    } = this.props

    if (!url) {
      //reset url to empty
      resetGlobalState({ ...DEFAULT_STATE, ...{ user: globalState.user } })
      updateInitialSettingsUrl('')
      return
    }

    let stateFromLocalStorage
    let stateFromUrlHash
    if (!overrideLocalSettings) {
      stateFromLocalStorage = getStateFromLocalStorage()
      stateFromUrlHash = getStateFromUrlHash()
    }

    //validate url
    if (url.search(':') === -1 || url.search('/') === -1) {
      throw new Error(`Invalid url: "${url}"`)
    }

    const isYaml = url.search('.yaml') !== -1 || url.search('.yml') !== -1
    const isJson = url.search('.json') !== -1
    const isUnknown = !isYaml && !isJson

    //NOTE: changed my mind about requiring a .yaml or .json extension to allow for more flexibility.
    //if (!isYamlURL && !isJsonURL) {
    //  throw new Error('Expected file extensions (".yaml", ".yml", or ".json") not found in the URL')
    //}

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Couldn't load URL. Error: ${response.statusText.toLowerCase()} (${response.status})`)
    }

    const fileContents = await response.text()

    let settings = null
    if (!settings && (isYaml || isUnknown)) {
      try {
        settings = yaml.safeLoad(fileContents)
      } catch (e) {
        throw new Error(`Unable to parse YAML file: ${url}  ${e}`)
      }
    }

    if (!settings && (isJson || isUnknown)) {
      try {
        settings = JSON.parse(fileContents)
      } catch (e) {
        throw new Error(`Unable to parse JSON file: ${url}  ${e}`)
      }
    }

    if (!settings) {
      throw new Error(`Unable to parse settings from file: ${url}`)
    }

    // TODO validate settings more

    // filter settings to keys in globalState
    const filteredSettings = Object.keys(globalState).reduce((acc, key) => {
      if (key in settings) {
        return { ...acc, [key]: settings[key] }
      }
      return acc
    }, {})

    console.log('Retrieved state from config file:', filteredSettings)

    // apply settings
    let newState = { ...globalState, ...filteredSettings }
    if (!overrideLocalSettings) {
      console.log('Applying settings from local storage', stateFromLocalStorage)
      console.log('Applying settings from url hash', stateFromUrlHash)
      newState = { ...newState, ...stateFromLocalStorage, ...stateFromUrlHash }
    }

    console.log('Setting global state to', newState)
    resetGlobalState(newState)
    updateInitialSettingsUrl(url)
  }

  applyInitialSettingsUrl = async (url, overrideLocalSettings = false) => {

    this.setState({ requestStatus: RequestStatus.IN_PROGRESS })

    if (url.startsWith('https://github.com/')) {
      // switch to the github raw url
      url = url.replace('https://github.com', 'https://raw.githubusercontent.com').replace('blob/', '')
    } else if (url.startsWith('https://storage.googleapis.com') || url.startsWith('gs://')) {
      // switch to the url that supports CORS (https://stackoverflow.com/questions/66934689/getting-cors-issue-on-wildcard-cors-enabled-gcs-bucket-with-fetch)
      const urlParts = url.replace('gs://', '').replace('https://storage.googleapis.com/', '').split('/')
      const bucketName = urlParts[0]
      const objectPath = urlParts.slice(1).join('/')
      url = `https://${bucketName}.storage.googleapis.com/${objectPath}`
    }


    try {
      await this.loadInitialSettingsUrl(url, overrideLocalSettings)

      this.setState({ requestStatus: RequestStatus.SUCCEEDED, successMessage: url ? 'Successfully loaded URL and applied settings' : 'Reset all settings to defaults' })
    } catch (e) {
      this.setState({ requestStatus: RequestStatus.ERROR, errorMessage: e.toString() })
    }

    // wait and then clear the message
    await delay(10000)
    if (this.state.requestStatus !== RequestStatus.IN_PROGRESS) {
      this.setState({ requestStatus: RequestStatus.NONE, errorMessage: '' })
    }
  }

  exportCurrentSettings = () => {
    //convert global state to a JSON string
    const EXCLUDED_KEYS = ['user', 'modals']
    const globalStateForExport = Object.keys(this.props.globalState).reduce((acc, key) => {
      if (!EXCLUDED_KEYS.includes(key)) {
        acc[key] = this.props.globalState[key]
      }
      return acc
    }, {})

    return encodeURIComponent(JSON.stringify(globalStateForExport, null, 5))
  }

  render() {
    const {
      initialSettingsUrl,
    } = this.props

    return (
      <StyledDiv align="center">
        <StyledInput
          label="Initial settings:"
          defaultValue={initialSettingsUrl}
          placeholder="URL of .yaml or .json settings file (eg. http://.../settings.json), or blank to reset all settings to defaults."
          onChange={(e) => { this.textInputValue = e.target.value }}
          onKeyUp={(e) => e.keyCode === 13 && this.applyInitialSettingsUrl(e.target.value, true)}
        />
        <StyledButton
          content="Apply"
          onClick={() => this.applyInitialSettingsUrl(this.textInputValue, true)}
        />
        <RequestStatus
          status={this.state.requestStatus}
          errorMessage={this.state.errorMessage}
          successMessage={this.state.successMessage}
        />
        <Popup
          content="Export current settings to a .json file. If you then upload this file to a public url (for example to github) and then paste the url here, the current settings will be restored."
          position="right center"
          trigger={
            <a download="settings.json" href={`data:text/json;charset=utf-8,${this.exportCurrentSettings()}`}>
              <StyledButton2 icon="download" />
            </a>
          }
        />
      </StyledDiv>)
  }
}

InitialSettingsForm.propTypes = {
  initialSettingsUrl: PropTypes.string.isRequired,
  globalState: PropTypes.object,
  updateInitialSettingsUrl: PropTypes.func,
  resetGlobalState: PropTypes.func,
}

const mapStateToProps = (state) => ({
  globalState: state,
  initialSettingsUrl: getInitialSettingsUrl(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateInitialSettingsUrl: (newUrl) => {
    dispatch({
      type: 'UPDATE_INITIAL_SETTINGS_URL',
      newValue: newUrl,
    })
  },
  resetGlobalState: (state) => {
    dispatch({
      type: 'RESET_GLOBAL_STATE',
      newState: state,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(InitialSettingsForm)
