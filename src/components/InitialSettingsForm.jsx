import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { getInitialSettingsUrl } from '../redux/selectors'
import { connect } from 'react-redux'
import { Form, Label, Button, Input } from 'semantic-ui-react'

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

class InitialSettingsForm extends React.Component
{
  static propTypes = {
    initialSettingsUrl: PropTypes.object.isRequired,
  }

  render() {
    return <StyledDiv align="center">
        <StyledInput
          label="Initial settings:"
          defaultValue={this.props.initialSettingsUrl}
          placeholder="URL of .yaml or .json settings file (eg. http://.../template.json)"
        />
        <StyledButton content='Save URL' />
    </StyledDiv>


  }
}

const mapStateToProps = state => ({
  initialSettingsUrl: getInitialSettingsUrl(state),
})

export { InitialSettingsForm as InitialSettingsFormComponent }

export default connect(mapStateToProps)(InitialSettingsForm)
