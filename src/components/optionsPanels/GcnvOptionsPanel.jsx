/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Button, Checkbox, Icon } from 'semantic-ui-react'
import ColorPicker from './ColorPicker'
import { CategoryH3, OptionInputDiv, OptionInput } from '../SideBarUtils'
import { getGcnvOptions, getSelectedSamplesByCategoryNameAndRowName } from '../../redux/selectors'
import { GCNV_DEFAULT_HIGHLIGHT_COLOR } from '../../constants'

const GrayText = styled.span`
  color: gray;
`

const HighlightedSamplesSectionHeading = styled.div`
  font-weight: 700;
  margin: 8px 0px;
`

const HighlightedSamplesCategory = styled.span`
  margin: 10px 0px 8px 0px;
  font-style: italic;
`

const DeleteButton = styled(Button).attrs({ basic: true, icon: true })`
  padding: 0px !important;
  box-shadow: none !important;
`

const SampleNameText = styled.span`
  word-wrap: break-word;
  word-break: break-all;  
  white-space: normal;
`

const NONE_HIGHLIGHTED_MESSAGE = <GrayText>Use search box in left side-bar to select which samples to highlight.</GrayText>

const SamplePanel = ({ categoryName, rowName, sample, sampleSettings, hideSample, updateSampleSettings }) => (
  <div style={{ whiteSpace: 'nowrap' }}>
    <DeleteButton onClick={() => hideSample(categoryName, rowName, sample)}>
      <Icon name="delete" />
    </DeleteButton>
    <SampleNameText>{sample}</SampleNameText>
    <span style={{ marginLeft: '8px' }}>
      <ColorPicker
        key={sampleSettings.color}
        color={sampleSettings.color || GCNV_DEFAULT_HIGHLIGHT_COLOR}
        colorChangedHandler={(newColor) => updateSampleSettings(categoryName, rowName, sample, { color: newColor })}
      />
    </span>
  </div>)


SamplePanel.propTypes = {
  categoryName: PropTypes.string,
  rowName: PropTypes.string,
  sample: PropTypes.string,
  sampleSettings: PropTypes.object,
  hideSample: PropTypes.func,
  updateSampleSettings: PropTypes.func,
}

const HighlighedSamplesPanel = ({ selectedSamplesByCategoryNameAndRowName, hideRow, hideSample, updateSampleSettings }) => {
  const result = []
  Object.entries(selectedSamplesByCategoryNameAndRowName).forEach(([categoryName, categoryObj]) => {
    Object.entries(categoryObj.selectedSamples || {}).forEach(([rowName, selectedSamples]) => {
      result.push(
        <div key={`${categoryName}!!${rowName}`}>
          <div style={{ whiteSpace: 'nowrap', margin: '15px 0px 7px 0px' }}>
            <DeleteButton onClick={() => hideRow(categoryName, rowName)}>
              <Icon name="delete" />
            </DeleteButton>
            <HighlightedSamplesCategory>{categoryName}: {rowName}</HighlightedSamplesCategory>
          </div>
          {
            selectedSamples.map((sample) => (
              <SamplePanel
                key={sample}
                categoryName={categoryName}
                rowName={rowName}
                sample={sample}
                sampleSettings={((categoryObj.sampleSettings || {})[rowName] || {})[sample] || {}}
                hideRow={hideRow}
                hideSample={hideSample}
                updateSampleSettings={updateSampleSettings}
              />),
            )
          }
        </div>)
    })
  })

  return result.length > 0 ? result : NONE_HIGHLIGHTED_MESSAGE
}

HighlighedSamplesPanel.propTypes = {
  selectedSamplesByCategoryNameAndRowName: PropTypes.object,
  hideRow: PropTypes.func,
  hideSample: PropTypes.func,
  updateSampleSettings: PropTypes.func,
}

const editedFields = {}

const GcnvOptionsPanel = ({ gcnvOptions, selectedSamplesByCategoryNameAndRowName, updateGcnvOptions, updateSampleSettings, hideRow, hideSample }) => {
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
      <OptionInputDiv>
        <HighlightedSamplesSectionHeading>Selected data:</HighlightedSamplesSectionHeading>
        <HighlighedSamplesPanel
          selectedSamplesByCategoryNameAndRowName={selectedSamplesByCategoryNameAndRowName}
          hideRow={hideRow}
          hideSample={hideSample}
          updateSampleSettings={updateSampleSettings}
        />
      </OptionInputDiv>
    </div>)
}

GcnvOptionsPanel.propTypes = {
  gcnvOptions: PropTypes.object,
  selectedSamplesByCategoryNameAndRowName: PropTypes.object,
  updateGcnvOptions: PropTypes.func,
  hideRow: PropTypes.func,
  hideSample: PropTypes.func,
  updateSampleSettings: PropTypes.func,
}

const mapStateToProps = (state) => ({
  gcnvOptions: getGcnvOptions(state),
  selectedSamplesByCategoryNameAndRowName: getSelectedSamplesByCategoryNameAndRowName(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateGcnvOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_GCNV_OPTIONS',
      updates: newSettings,
    })
  },
  hideRow: (categoryName, rowName) => {
    dispatch({
      type: 'REMOVE_SELECTED_ROW_NAMES',
      categoryName,
      selectedRowNames: [rowName],
    })
  },
  hideSample: (categoryName, rowName, sample) => {
    dispatch({
      type: 'REMOVE_SELECTED_SAMPLES',
      categoryName,
      selectedSamplesByRowName: {
        [rowName]: [sample],
      },
    })
  },
  updateSampleSettings: (categoryName, rowName, sample, newSettings) => {
    dispatch({
      type: 'UPDATE_SAMPLE_SETTINGS',
      categoryName,
      sampleSettingsByRowNameAndSampleName: {
        [rowName]: {
          [sample]: newSettings,
        },
      },
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(GcnvOptionsPanel)
