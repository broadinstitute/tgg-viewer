/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Button, Checkbox, Icon, Radio } from 'semantic-ui-react'
import { CategoryH3, ColorLegendIcon, OptionDiv, OptionInputDiv, OptionInput, StyledPopup } from '../SideBarUtils'
import { SJ_MOTIFS, SJ_DEFAULT_COLOR_BY_NUM_READS_THRESHOLD } from '../../constants'
import { getSjOptions } from '../../redux/selectors'


const StyledRadio = styled(Radio)`
  label {
    margin-left: 10px;
    margin-bottom: 10px;
    padding-left: 1.4em !important;
  }
`

const ColorByLegend = ({ sjOptions, handleTextInput }) => {
  if (sjOptions.colorBy === 'strand') {
    return (
      <div>
        <ColorLegendIcon name="stop" style={{ color: '#b0b0ec' }} /> plus
        <ColorLegendIcon name="stop" style={{ color: '#ecb0b0', marginLeft: '10px' }} /> minus
      </div>)
  }

  if (sjOptions.colorBy === 'motif') {
    // IGV.js Dark2 color palette
    return (
      <div>
        <ColorLegendIcon name="stop" style={{ color: 'rgb(27,158,119)' }} /> GT/AG <br />
        <ColorLegendIcon name="stop" style={{ color: 'rgb(217,95,2)' }} /> CT/AC <br />
        <ColorLegendIcon name="stop" style={{ color: 'rgb(117,112,179)' }} /> GC/AG <br />
        <ColorLegendIcon name="stop" style={{ color: 'rgb(231,41,138)' }} /> CT/GC <br />
        <ColorLegendIcon name="stop" style={{ color: 'rgb(102,166,30)' }} /> AT/AC <br />
        <ColorLegendIcon name="stop" style={{ color: 'rgb(230,171,2)' }} /> GT/AT <br />
        <ColorLegendIcon name="stop" style={{ color: 'rgb(166,118,29)' }} /> non-canonical <br />
      </div>)
  }

  if (sjOptions.colorBy === 'numUniqueReads' || sjOptions.colorBy === 'numReads') {
    return (
      <div>
        # reads<ColorLegendIcon name="stop" style={{ color: '#AAAAAA', marginLeft: '10px' }} />
        &nbsp;≤ &nbsp;
        <OptionInput
          type="text"
          key={`num-reads-${sjOptions.colorByNumReadsThreshold}`}
          defaultValue={sjOptions.colorByNumReadsThreshold !== undefined ? sjOptions.colorByNumReadsThreshold : SJ_DEFAULT_COLOR_BY_NUM_READS_THRESHOLD}
          onKeyUp={(e) => handleTextInput(e, 'colorByNumReadsThreshold')}
          style={{ width: '35px' }}
        />
        &nbsp; &lt; &nbsp;
        <ColorLegendIcon name="stop" style={{ color: 'blue' }} />
      </div>)
  }
  if (sjOptions.colorBy === 'isAnnotatedJunction') {
    return (
      <div>
        <ColorLegendIcon name="stop" style={{ color: '#b0b0ec' }} /> known junction <br />
        <ColorLegendIcon name="stop" style={{ color: 'orange' }} /> novel junction
      </div>)
  }

  return <div />
}

ColorByLegend.propTypes = {
  sjOptions: PropTypes.object,
  handleTextInput: PropTypes.func,
}

const editedFields = {}

const SpliceJunctionsOptionsPanel = ({ sjOptions, updateSjOptions }) => {
  const handleTextInput = (e, name, value = null) => {
    if (e.keyCode === 13) {
      updateSjOptions({ ...sjOptions, ...editedFields })
    } else {
      editedFields[name] = value
    }
  }
  const handleApplyButton = () => {
    updateSjOptions({ ...sjOptions, ...editedFields })
  }

  return (
    <div>
      <CategoryH3>Junctions Track <br />Options</CategoryH3><br />
      <OptionDiv>Color by:</OptionDiv>
      <OptionDiv>
        <select value={sjOptions.colorBy} onChange={(e) => updateSjOptions({ colorBy: e.target.value })}>
          <option value="strand">strand</option>
          <option value="motif">donor/acceptor motif</option>
          <option value="numUniqueReads"># uniquely-mapped reads</option>
          <option value="numReads"># total reads</option>
          <option value="isAnnotatedJunction">is known junction</option>
        </select>
        <ColorByLegend sjOptions={sjOptions} handleTextInput={handleTextInput} />
      </OptionDiv>
      <OptionDiv>Junction thickness:</OptionDiv>
      <OptionDiv>
        <select value={sjOptions.thicknessBasedOn} onChange={(e) => updateSjOptions({ thicknessBasedOn: e.target.value })}>
          <option value="numUniqueReads"># uniquely-mapped reads</option>
          <option value="numReads"># total reads</option>
          <option value="isAnnotatedJunction">is known junction</option>
        </select>
      </OptionDiv>
      <OptionDiv>Junction bounce height:</OptionDiv>
      <OptionDiv>
        <select value={sjOptions.bounceHeightBasedOn} onChange={(e) => updateSjOptions({ bounceHeightBasedOn: e.target.value })}>
          <option value="random">random</option>
          <option value="distance">distance</option>
          <option value="thickness">thickness</option>
        </select>
      </OptionDiv>
      <OptionDiv>Junction label:</OptionDiv>
      <OptionDiv><Checkbox label="# uniquely-mapped" checked={sjOptions.labelUniqueReadCount} onChange={(e, data) => updateSjOptions({ labelUniqueReadCount: data.checked })} /></OptionDiv>
      <OptionDiv><Checkbox label="# multi-mapped" checked={sjOptions.labelMultiMappedReadCount} onChange={(e, data) => updateSjOptions({ labelMultiMappedReadCount: data.checked })} /></OptionDiv>
      <OptionDiv><Checkbox label="# total reads" checked={sjOptions.labelTotalReadCount} onChange={(e, data) => updateSjOptions({ labelTotalReadCount: data.checked })} /></OptionDiv>
      <OptionDiv><Checkbox label="donor/acceptor motif" checked={sjOptions.labelMotif} onChange={(e, data) => updateSjOptions({ labelMotif: data.checked })} /></OptionDiv>
      <OptionDiv>
        <Checkbox label="known junction:" checked={sjOptions.labelAnnotatedJunction} onChange={(e, data) => updateSjOptions({ labelAnnotatedJunction: data.checked })} />
        <OptionInput key={`junction-label-${sjOptions.labelAnnotatedJunctionValue}`} type="text" defaultValue={sjOptions.labelAnnotatedJunctionValue} onKeyUp={(e) => handleTextInput(e, 'labelAnnotatedJunctionValue')} style={{ width: '35px' }} />
      </OptionDiv>

      <CategoryH3>Junctions Track Filters</CategoryH3><br />
      <OptionDiv>
        Show Strands:
        <StyledRadio label="both" name="strandButton" checked={!sjOptions.showOnlyPlusStrand && !sjOptions.showOnlyMinusStrand} onChange={(e, data) => data.checked && updateSjOptions({ showOnlyPlusStrand: false, showOnlyMinusStrand: false })} />
        <StyledRadio label="plus" name="strandButton" checked={sjOptions.showOnlyPlusStrand} onChange={(e, data) => data.checked && updateSjOptions({ showOnlyPlusStrand: true, showOnlyMinusStrand: false })} />
        <StyledRadio label="minus" name="strandButton" checked={sjOptions.showOnlyMinusStrand} onChange={(e, data) => data.checked && updateSjOptions({ showOnlyPlusStrand: false, showOnlyMinusStrand: true })} />
      </OptionDiv>
      <OptionDiv><Checkbox label="Show known junctions" checked={!sjOptions.hideAnnotated} onChange={(e, data) => updateSjOptions({ hideAnnotated: !data.checked })} /></OptionDiv>
      <OptionDiv><Checkbox label="Show novel junctions" checked={!sjOptions.hideUnannotated} onChange={(e, data) => updateSjOptions({ hideUnannotated: !data.checked })} /></OptionDiv>
      <div>
        <OptionDiv>Uniquely-mapped reads:</OptionDiv>
        at least <OptionInput key={`uniquely-mapped-reads-${sjOptions.minUniquelyMappedReads}`} type="text" defaultValue={sjOptions.minUniquelyMappedReads} onKeyUp={(e) => handleTextInput(e, 'minUniquelyMappedReads', parseInt(e.target.value, 10))} />
      </div>
      <div>
        <OptionDiv>Total reads:</OptionDiv>
        at least <OptionInput key={`total-reads-${sjOptions.minTotalReads}`} type="text" defaultValue={sjOptions.minTotalReads} onKeyUp={(e) => handleTextInput(e, 'minTotalReads', parseInt(e.target.value, 10))} />
      </div>
      <div>
        <OptionDiv>Fraction multi-mapped:
          <StyledPopup inverted
            content="Allows filtering of junctions where most reads that span the junction are multi-mapped reads. For example, setting this to 0.79 will hide junctions where 8 out of 10 (or more) reads that span the junction are not uniquely mapped reads."
            position="left center"
            on="click"
            trigger={
              <Icon style={{ marginLeft: '8px' }} name="question circle outline" />
            }
          />
        </OptionDiv>
        at most <OptionInput key={`fraction-multi-mapped-${sjOptions.maxFractionMultiMappedReads}`} type="text" defaultValue={sjOptions.maxFractionMultiMappedReads} onKeyUp={(e) => handleTextInput(e, 'maxFractionMultiMappedReads', parseInt(e.target.value, 10))} />
      </div>
      <div>
        <OptionDiv>Splice overhang base-pairs:</OptionDiv>
        at least <OptionInput key={`spliced-alignment-overhang-${sjOptions.minSplicedAlignmentOverhang}`} type="text" defaultValue={sjOptions.minSplicedAlignmentOverhang} onKeyUp={(e) => handleTextInput(e, 'minSplicedAlignmentOverhang', parseInt(e.target.value, 10))} />
      </div>
      <div>
        <OptionDiv>Donor/Acceptor Motifs:</OptionDiv>
        {
          SJ_MOTIFS.map((motif) => <OptionDiv key={motif}><Checkbox label={`Show ${motif}`} checked={!sjOptions[`hideMotif${motif}`]} onChange={(e, data) => updateSjOptions({ [`hideMotif${motif}`]: !data.checked })} /></OptionDiv>)
        }
      </div>
      <OptionInputDiv>Track height: <OptionInput key={`track-height-${sjOptions.trackHeight}`} type="text" defaultValue={sjOptions.trackHeight} onKeyUp={(e) => handleTextInput(e, 'trackHeight', parseInt(e.target.value, 10))} /> px</OptionInputDiv>
      <OptionInputDiv><Button compact size="small" onClick={handleApplyButton}>Apply</Button></OptionInputDiv>
    </div>)
}

SpliceJunctionsOptionsPanel.propTypes = {
  sjOptions: PropTypes.object,
  updateSjOptions: PropTypes.func,
}

const mapStateToProps = (state) => ({
  sjOptions: getSjOptions(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateSjOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_SJ_OPTIONS',
      updates: newSettings,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(SpliceJunctionsOptionsPanel)
