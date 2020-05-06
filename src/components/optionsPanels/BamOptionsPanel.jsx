/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Checkbox } from 'semantic-ui-react'
import { CategoryH3, OptionDiv, OptionInputDiv, OptionInput } from '../SideBarUtils'
import { getBamOptions } from '../../redux/selectors'

const editedFields = {}

const BamOptionsPanel = ({ bamOptions, updateBamOptions }) => {
  const handleTextInput = (e, name, value = null) => {
    if (e.keyCode === 13) {
      updateBamOptions({ ...bamOptions, ...editedFields })
    } else {
      editedFields[name] = value
    }
  }

  const handleApplyButton = () => {
    updateBamOptions({ ...bamOptions, ...editedFields })
  }

  return (
    <div>
      <CategoryH3>BAM TRACK <br />OPTIONS</CategoryH3><br />
      <OptionDiv><Checkbox label="View as pairs" checked={bamOptions.viewAsPairs} onChange={(e, data) => updateBamOptions({ viewAsPairs: data.checked })} /></OptionDiv>
      <OptionDiv><Checkbox label="Show soft-clips" checked={bamOptions.showSoftClips} onChange={(e, data) => updateBamOptions({ showSoftClips: data.checked })} /></OptionDiv>
      <OptionDiv>
        Color by:
        <select value={bamOptions.colorBy} onChange={(e) => updateBamOptions({ colorBy: e.target.value })}>
          <option value="strand">Strand</option>
          <option value="firstOfPairStrand">First-of-pair strand</option>
          <option value="pairOrientation">Pair orientation</option>
          <option value="fragmentLength">Insert size (TLEN)</option>
          <option value="none">None</option>
        </select>
      </OptionDiv>
      <OptionInputDiv>Track height: <OptionInput key={`track-height-${bamOptions.trackHeight}`} type="text" defaultValue={bamOptions.trackHeight} onKeyUp={(e) => handleTextInput(e, 'trackHeight', parseInt(e.target.value, 10))} /> px</OptionInputDiv>
      <OptionInputDiv><Button compact size="small" onClick={handleApplyButton}>Apply</Button></OptionInputDiv>
    </div>)
}

BamOptionsPanel.propTypes = {
  bamOptions: PropTypes.object,
  updateBamOptions: PropTypes.func,
}

const mapStateToProps = (state) => ({
  bamOptions: getBamOptions(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateBamOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_BAM_OPTIONS',
      updates: newSettings,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(BamOptionsPanel)
