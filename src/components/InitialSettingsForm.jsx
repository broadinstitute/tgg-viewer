/* eslint-disable react/no-find-dom-node */
/* eslint-disable react/destructuring-assignment */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Button, Input } from 'semantic-ui-react'
import yaml from 'js-yaml'
import { getInitialSettingsUrl } from '../redux/selectors'
import { HttpRequestHelper } from '../redux/utils/httpRequestHelper'
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
      errorMessage: '',
    }
  }

  async componentDidMount() {
    const {
      initialSettingsUrl,
      globalState,
    } = this.props

    if (initialSettingsUrl && (!globalState.initialSettings || globalState.initialSettings.initialSettingsUrl !== initialSettingsUrl)) {
      // download url
      console.log('Loading settings from url', initialSettingsUrl)
      //await this.loadSettingsFromUrl()
    }
  }

  loadSettingsFromUrl = async () => {
    const {
      updateInitialSettingsUrl,
      globalState,
      resetGlobalState,
    } = this.props

    const url = this.textInputValue

    if (!url) {
      //reset url to empty
      resetGlobalState(DEFAULT_STATE)
      updateInitialSettingsUrl('')
      return
    }

    //validate url
    if (url.search(':') === -1 || url.search('/') === -1) {
      this.setState({ requestStatus: RequestStatus.ERROR, errorMessage: `Invalid url: "${url}"` })
      return
    }

    const isYamlURL = url.search('.yaml') !== -1 || url.search('.yml') !== -1
    const isJsonURL = url.search('.json') !== -1
    if (!isYamlURL && !isJsonURL) {
      this.setState({ requestStatus: RequestStatus.ERROR, errorMessage: 'Expected file extensions (".yaml", ".yml", or ".json") not found in the URL' })
      return
    }

    const http = new HttpRequestHelper(
      url,
      (fileContents) => {
        let settings

        if (isYamlURL) {
          try {
            settings = yaml.safeLoad(fileContents)
          } catch (e) {
            this.setState({ requestStatus: RequestStatus.ERROR, errorMessage: `Unable to parse YAML file: ${e}` })
            return
          }
        }

        if (isJsonURL) {
          try {
            settings = JSON.parse(fileContents)
          } catch (e) {
            this.setState({ requestStatus: RequestStatus.ERROR, errorMessage: `Unable to parse JSON file: ${e}` })
            return
          }
        }

        // TODO validate settings

        // filter settings to keys in globalState
        const filteredSettings = Object.keys(globalState).reduce((acc, key) => {
          if (key in settings) {
            return { ...acc, [key]: settings[key] }
          }
          return acc
        }, {})

        filteredSettings.initialSettings = JSON.parse(JSON.stringify(filteredSettings)) // deep-copy just in case

        resetGlobalState({ ...globalState, ...filteredSettings })
        updateInitialSettingsUrl(url)

        this.setState({ requestStatus: RequestStatus.SUCCEEDED })
      },
      (e) => {
        this.setState({ requestStatus: RequestStatus.ERROR, errorMessage: e.toString() })
      },
      () => {
        this.setState({ requestStatus: RequestStatus.NONE, errorMessage: '' })
      },
    )

    this.setState({ requestStatus: RequestStatus.IN_PROGRESS })

    http.get()
    //return http.get()
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
          placeholder="URL of .yaml or .json settings file (eg. http://.../settings.json)"
          onChange={(e) => {
            this.textInputValue = e.target.value
          }}
        />
        <StyledButton
          content="Apply"
          onClick={this.loadSettingsFromUrl}
        />
        <RequestStatus
          status={this.state.requestStatus}
          errorMessage={this.state.errorMessage}
          successMessage="Successfully loaded and applied settings from URL"
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

export { InitialSettingsForm as InitialSettingsFormComponent }

export default connect(mapStateToProps, mapDispatchToProps)(InitialSettingsForm)
