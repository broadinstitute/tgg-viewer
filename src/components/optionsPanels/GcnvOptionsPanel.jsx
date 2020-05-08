/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
//import styled from 'styled-components'
import { Button, Checkbox } from 'semantic-ui-react'
import { CategoryH3, OptionInputDiv, OptionInput } from '../SideBarUtils'
import { getGcnvOptions } from '../../redux/selectors'

const editedFields = {}

const GcnvOptionsPanel = ({ gcnvOptions, updateGcnvOptions }) => {
  const handleTextInput = (e, name, value = null) => {
    if (e.keyCode === 13) {
      updateGcnvOptions({ ...gcnvOptions, ...editedFields })
    } else {
      editedFields[name] = value
    }
  }

  const handleApplyButton = () => {
    updateGcnvOptions({ ...gcnvOptions, ...editedFields })
  }

  return (
    <div>
      <CategoryH3>gCNV Options</CategoryH3><br />
      <OptionInputDiv><Checkbox label="Enable clicking background samples" checked={!gcnvOptions.onlyHandleClicksForHighlightedSamples} onChange={(e, data) => updateGcnvOptions({ ...gcnvOptions, onlyHandleClicksForHighlightedSamples: !data.checked })} /></OptionInputDiv>
      <OptionInputDiv>Y-min: <OptionInput key={`y-max-${gcnvOptions.trackMin}`} type="text" defaultValue={gcnvOptions.trackMin} onKeyUp={(e) => handleTextInput(e, 'trackMin', parseInt(e.target.value, 10))} /> copies</OptionInputDiv>
      <OptionInputDiv>Y-max: <OptionInput key={`y-max-${gcnvOptions.trackMax}`} type="text" defaultValue={gcnvOptions.trackMax} onKeyUp={(e) => handleTextInput(e, 'trackMax', parseInt(e.target.value, 10))} /> copies</OptionInputDiv>
      <OptionInputDiv>Track height: <OptionInput key={`track-height-${gcnvOptions.trackHeight}`} type="text" defaultValue={gcnvOptions.trackHeight} onKeyUp={(e) => handleTextInput(e, 'trackHeight', parseInt(e.target.value, 10))} /> px</OptionInputDiv>
      <OptionInputDiv><Button compact size="small" onClick={handleApplyButton}>Apply</Button></OptionInputDiv>
    </div>)
}

GcnvOptionsPanel.propTypes = {
  gcnvOptions: PropTypes.object,
  updateGcnvOptions: PropTypes.func,
}

const mapStateToProps = (state) => ({
  gcnvOptions: getGcnvOptions(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateGcnvOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_GCNV_OPTIONS',
      updates: newSettings,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(GcnvOptionsPanel)
