/* eslint-disable no-multiple-empty-lines */

import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon } from 'semantic-ui-react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import ColorPicker from './optionsPanels/ColorPicker'
import { GCNV_DEFAULT_HIGHLIGHT_COLOR } from '../constants'
import { getSelectedSamplesByCategoryNameAndRowName } from '../redux/selectors'

const SelectedDataCategory = styled.span`
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

const SamplePanel = ({ categoryName, rowName, sample, sampleSettings, hideSample, updateSampleSettings, numSelectedSamplesInRow }) => (
  <div style={{ whiteSpace: 'nowrap' }}>
    <DeleteButton onClick={() => hideSample(categoryName, rowName, sample, numSelectedSamplesInRow)}>
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
  numSelectedSamplesInRow: PropTypes.number,
}

const SelectedDataPanel = ({ selectedSamplesByCategoryNameAndRowName, hideRow, hideSample, updateSampleSettings }) => {
  const result = []
  Object.entries(selectedSamplesByCategoryNameAndRowName).forEach(([categoryName, categoryObj]) => {
    Object.entries(categoryObj.selectedSamples || {}).forEach(([rowName, selectedSamples]) => {
      result.push(
        <div key={`${categoryName}!!${rowName}`}>
          <div style={{ whiteSpace: 'nowrap', margin: '15px 0px 7px 0px' }}>
            {
              /*<DeleteButton onClick={() => hideRow(categoryName, rowName)}>
                <Icon name="delete" />
              </DeleteButton>
              */
            }
            <SelectedDataCategory>{`${categoryName}: ${rowName}`}</SelectedDataCategory>
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
                numSelectedSamplesInRow={selectedSamples.length}
              />),
            )
          }
        </div>)
    })
  })

  return result.length > 0 ? result : null
}

SelectedDataPanel.propTypes = {
  selectedSamplesByCategoryNameAndRowName: PropTypes.object,
  hideRow: PropTypes.func,
  hideSample: PropTypes.func,
  updateSampleSettings: PropTypes.func,
}


const mapStateToProps = (state) => ({
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
  hideSample: (categoryName, rowName, sample, numSelectedSamplesInRow) => {
    if (numSelectedSamplesInRow <= 1) {
      // if the last sample is being hidden, hide the row as well
      dispatch({
        type: 'REMOVE_SELECTED_ROW_NAMES',
        categoryName,
        selectedRowNames: [rowName],
      })
    }

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

export default connect(mapStateToProps, mapDispatchToProps)(SelectedDataPanel)
