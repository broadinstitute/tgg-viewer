import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Button, Input } from 'semantic-ui-react'
import { getInitialSettingsUrl } from '../redux/selectors'

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
  margin-top: 50px;
  width: calc(100% - 300px);
`

const StyledButton = styled(Button)`
  margin-left: 20px !important;
`

class InitialSettingsForm extends React.PureComponent
{
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
        />
        <StyledButton content="Save URL" />
      </StyledDiv>)
  }
}

InitialSettingsForm.propTypes = {
  initialSettingsUrl: PropTypes.string.isRequired,
}

const mapStateToProps = (state) => ({
  initialSettingsUrl: getInitialSettingsUrl(state),
})

export { InitialSettingsForm as InitialSettingsFormComponent }

export default connect(mapStateToProps)(InitialSettingsForm)
