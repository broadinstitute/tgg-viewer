/* eslint-disable react/no-find-dom-node */
/* eslint-disable react/destructuring-assignment */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Button, Input } from 'semantic-ui-react'
import delay from 'timeout-as-promise'
import yaml from 'js-yaml'
import { getInitialSettingsUrl, getInitialSettingsUrlHasBeenApplied } from '../redux/selectors'
import RequestStatus from './RequestStatus'
import { DEFAULT_STATE } from '../redux/initialState'

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
    const {
      initialSettingsUrl,
      initialSettingsUrlHasBeenApplied,
    } = this.props

    if (initialSettingsUrl && !initialSettingsUrlHasBeenApplied) {
      // download url
      console.log('Loading settings from url', initialSettingsUrl)
      await this.applyInitialSettingsUrl(initialSettingsUrl)
    }
  }

  loadInitialSettingsUrl = async (url) => {
    const {
      globalState,
      updateInitialSettingsUrl,
      setInitialSettingsUrlHasBeenApplied,
      resetGlobalState,
    } = this.props

    if (!url) {
      //reset url to empty
      resetGlobalState(DEFAULT_STATE)
      updateInitialSettingsUrl('')
      setInitialSettingsUrlHasBeenApplied()
      return
    }

    //validate url
    if (url.search(':') === -1 || url.search('/') === -1) {
      throw new Error(`Invalid url: "${url}"`)
    }

    const isYamlURL = url.search('.yaml') !== -1 || url.search('.yml') !== -1
    const isJsonURL = url.search('.json') !== -1
    if (!isYamlURL && !isJsonURL) {
      throw new Error('Expected file extensions (".yaml", ".yml", or ".json") not found in the URL')
    }


    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Couldn't load URL. Error: ${response.statusText.toLowerCase()} (${response.status})`)
    }

    const fileContents = await response.text()

    let settings
    if (isYamlURL) {
      try {
        settings = yaml.safeLoad(fileContents)
      } catch (e) {
        throw new Error(`Unable to parse YAML file: ${e}`)
      }
    }

    if (isJsonURL) {
      try {
        settings = JSON.parse(fileContents)
      } catch (e) {
        throw new Error(`Unable to parse JSON file: ${e}`)
      }
    }

    // TODO validate settings more

    // filter settings to keys in globalState
    const filteredSettings = Object.keys(globalState).reduce((acc, key) => {
      if (key in settings) {
        return { ...acc, [key]: settings[key] }
      }
      return acc
    }, {})

    filteredSettings.initialSettings = JSON.parse(JSON.stringify(filteredSettings)) // deep-copy just in case

    // apply settings
    resetGlobalState({ ...globalState, ...filteredSettings })
    updateInitialSettingsUrl(url)
    setInitialSettingsUrlHasBeenApplied()
  }

  applyInitialSettingsUrl = async (url) => {

    this.setState({ requestStatus: RequestStatus.IN_PROGRESS })

    try {
      await this.loadInitialSettingsUrl(url)

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
          onChange={(e) => {
            this.textInputValue = e.target.value
          }}
        />
        <StyledButton
          content="Apply"
          onClick={() => this.applyInitialSettingsUrl(this.textInputValue)}
        />
        <RequestStatus
          status={this.state.requestStatus}
          errorMessage={this.state.errorMessage}
          successMessage={this.state.successMessage}
        />
      </StyledDiv>)
  }
}

InitialSettingsForm.propTypes = {
  initialSettingsUrl: PropTypes.string.isRequired,
  initialSettingsUrlHasBeenApplied: PropTypes.bool.isRequired,
  globalState: PropTypes.object,
  updateInitialSettingsUrl: PropTypes.func,
  setInitialSettingsUrlHasBeenApplied: PropTypes.func,
  resetGlobalState: PropTypes.func,
}

const mapStateToProps = (state) => ({
  globalState: state,
  initialSettingsUrl: getInitialSettingsUrl(state),
  initialSettingsUrlHasBeenApplied: getInitialSettingsUrlHasBeenApplied(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateInitialSettingsUrl: (newUrl) => {
    dispatch({
      type: 'UPDATE_INITIAL_SETTINGS_URL',
      newValue: newUrl,
    })
  },
  setInitialSettingsUrlHasBeenApplied: () => {
    dispatch({
      type: 'UPDATE_INITIAL_SETTINGS_URL_HAS_BEEN_APPLIED',
      newValue: true,
    })
  },
  resetGlobalState: (state) => {
    dispatch({
      type: 'RESET_GLOBAL_STATE',
      newState: state,
    })
  },
})

export { InitialSettingsForm as InitialSettingsFormComponent }

export default connect(mapStateToProps, mapDispatchToProps)(InitialSettingsForm)
