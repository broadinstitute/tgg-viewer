/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Button, Checkbox, Icon, Radio } from 'semantic-ui-react'
import { CategoryH3, ColorLegendIcon, OptionDiv, OptionInputDiv, OptionInput, StyledPopup } from '../SideBarUtils'
import { SJ_MOTIFS, SJ_DEFAULT_COLOR_BY_NUM_READS_THRESHOLD } from '../../constants'
import { getSjOptions } from '../../redux/selectors'


export const OptionBox = styled.div`
  margin-top: 5px;
`

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
      <OptionBox>
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
      </OptionBox>
      <OptionBox>
        <OptionDiv>Junction label #1:</OptionDiv>
        <OptionDiv>
          <StyledRadio label="# uniquely-mapped" name="junctionLabelButton" checked={sjOptions.labelWith === 'uniqueReadCount'} onChange={(e, data) => data.checked && updateSjOptions({ labelWith: 'uniqueReadCount' })} />
          <StyledRadio label="# total reads" name="junctionLabelButton" checked={sjOptions.labelWith === 'totalReadCount'} onChange={(e, data) => data.checked && updateSjOptions({ labelWith: 'totalReadCount' })} />
          <StyledRadio label="# samples with junction" name="junctionLabelButton" checked={sjOptions.labelWith === 'numSamplesWithThisJunction'} onChange={(e, data) => data.checked && updateSjOptions({ labelWith: 'numSamplesWithThisJunction' })} />
          <StyledRadio label="% samples with junction" name="junctionLabelButton" checked={sjOptions.labelWith === 'percentSamplesWithThisJunction'} onChange={(e, data) => data.checked && updateSjOptions({ labelWith: 'percentSamplesWithThisJunction' })} />
          <StyledRadio label="motif" name="junctionLabelButton" checked={sjOptions.labelWith === 'motif'} onChange={(e, data) => data.checked && updateSjOptions({ labelWith: 'motif' })} />
        </OptionDiv>
      </OptionBox>
      <OptionBox>
        <OptionDiv>Junction label #2:</OptionDiv>
        <OptionDiv>
          <StyledRadio label="none" name="junctionLabel2Button" checked={!sjOptions.labelWithInParen} onChange={(e, data) => data.checked && updateSjOptions({ labelWithInParen: null })} />
          <StyledRadio label="# uniquely-mapped" name="junctionLabel2Button" checked={sjOptions.labelWithInParen === 'uniqueReadCount'} onChange={(e, data) => data.checked && updateSjOptions({ labelWithInParen: 'uniqueReadCount' })} />
          <StyledRadio label="# total reads" name="junctionLabel2Button" checked={sjOptions.labelWithInParen === 'totalReadCount'} onChange={(e, data) => data.checked && updateSjOptions({ labelWithInParen: 'totalReadCount' })} />
          <StyledRadio label="# multi-mapped" name="junctionLabel2Button" checked={sjOptions.labelWithInParen === 'multiMappedReadCount'} onChange={(e, data) => data.checked && updateSjOptions({ labelWithInParen: 'multiMappedReadCount' })} />
          <StyledRadio label="# samples with junction" name="junctionLabel2Button" checked={sjOptions.labelWithInParen === 'numSamplesWithThisJunction'} onChange={(e, data) => data.checked && updateSjOptions({ labelWithInParen: 'numSamplesWithThisJunction' })} />
          <StyledRadio label="% samples with junction" name="junctionLabel2Button" checked={sjOptions.labelWithInParen === 'percentSamplesWithThisJunction'} onChange={(e, data) => data.checked && updateSjOptions({ labelWithInParen: 'percentSamplesWithThisJunction' })} />
          <StyledRadio label="motif" name="junctionLabel2Button" checked={sjOptions.labelWithInParen === 'motif'} onChange={(e, data) => data.checked && updateSjOptions({ labelWithInParen: 'motif' })} />
        </OptionDiv>
      </OptionBox>
      <OptionBox>
        <OptionDiv>Junction bounce height:</OptionDiv>
        <OptionDiv>
          <select value={sjOptions.bounceHeightBasedOn} onChange={(e) => updateSjOptions({ bounceHeightBasedOn: e.target.value })}>
            <option value="random">random</option>
            <option value="distance">distance</option>
            <option value="thickness">thickness</option>
          </select>
        </OptionDiv>
      </OptionBox>
      <OptionBox>
        <OptionDiv>Junction thickness:</OptionDiv>
        <OptionDiv>
          <select value={sjOptions.thicknessBasedOn} onChange={(e) => updateSjOptions({ thicknessBasedOn: e.target.value })}>
            <option value="numUniqueReads"># uniquely-mapped reads</option>
            <option value="numReads"># total reads</option>
            <option value="isAnnotatedJunction">is known junction</option>
            <option value="numSamplesWithThisJunction"># samples with this junction</option>
          </select>
        </OptionDiv>
      </OptionBox>
      <CategoryH3>Junctions Track Filters</CategoryH3><br />
      <OptionBox>
        <OptionDiv>
          Show: <br />
          <StyledRadio label="only local junctions" name="minJunctionEndsVisibleButton" checked={sjOptions.minJunctionEndsVisible === 2} onChange={(e, data) => data.checked && updateSjOptions({ minJunctionEndsVisible: 2 })} />
          <StyledPopup
            content="Only show splice junctions that start and end within the current view."
            position="left center"
            trigger={
              <Icon style={{ marginLeft: '8px' }} name="question circle outline" />
            }
          /><br />
          <StyledRadio label="semi-local junctions" name="minJunctionEndsVisibleButton" checked={sjOptions.minJunctionEndsVisible === 1} onChange={(e, data) => data.checked && updateSjOptions({ minJunctionEndsVisible: 1 })} />
          <StyledPopup
            content="Hide splice junctions that span the current view (start to the left of the current view and end to the right of it)."
            position="left center"
            trigger={
              <Icon style={{ marginLeft: '8px' }} name="question circle outline" />
            }
          /><br />
          <StyledRadio label="all junctions" name="minJunctionEndsVisibleButton" checked={sjOptions.minJunctionEndsVisible === 0} onChange={(e, data) => data.checked && updateSjOptions({ minJunctionEndsVisible: 0 })} />
          <StyledPopup
            content="Show all splice junctions"
            position="left center"
            trigger={
              <Icon style={{ marginLeft: '8px' }} name="question circle outline" />
            }
          />
        </OptionDiv>
      </OptionBox>
      <OptionBox>
        <OptionDiv>
          Show Strands:
          <StyledRadio label="both" name="strandButton" checked={!sjOptions.showOnlyPlusStrand && !sjOptions.showOnlyMinusStrand} onChange={(e, data) => data.checked && updateSjOptions({ showOnlyPlusStrand: false, showOnlyMinusStrand: false })} />
          <StyledRadio label="plus" name="strandButton" checked={sjOptions.showOnlyPlusStrand} onChange={(e, data) => data.checked && updateSjOptions({ showOnlyPlusStrand: true, showOnlyMinusStrand: false })} />
          <StyledRadio label="minus" name="strandButton" checked={sjOptions.showOnlyMinusStrand} onChange={(e, data) => data.checked && updateSjOptions({ showOnlyPlusStrand: false, showOnlyMinusStrand: true })} />
        </OptionDiv>
      </OptionBox>
      <OptionBox>
        <OptionDiv><Checkbox label="Show known junctions" checked={!sjOptions.hideAnnotated} onChange={(e, data) => updateSjOptions({ hideAnnotated: !data.checked })} /></OptionDiv>
        <OptionDiv><Checkbox label="Show novel junctions" checked={!sjOptions.hideUnannotated} onChange={(e, data) => updateSjOptions({ hideUnannotated: !data.checked })} /></OptionDiv>
      </OptionBox>
      <OptionBox>
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
            <StyledPopup
              content="Allows filtering of junctions where most reads that span the junction are multi-mapped reads. For example, setting this to 0.79 will hide junctions where 8 out of 10 (or more) reads that span the junction are not uniquely mapped reads."
              position="left center"
              trigger={
                <Icon style={{ marginLeft: '8px' }} name="question circle outline" />
              }
            />
          </OptionDiv>
          at most <OptionInput key={`fraction-multi-mapped-${sjOptions.maxFractionMultiMappedReads}`} type="text" defaultValue={sjOptions.maxFractionMultiMappedReads} onKeyUp={(e) => handleTextInput(e, 'maxFractionMultiMappedReads', parseInt(e.target.value, 10))} />
        </div>
      </OptionBox>
      <OptionBox>
        <div>
          <OptionDiv>Splice overhang base-pairs:</OptionDiv>
          at least <OptionInput key={`spliced-alignment-overhang-${sjOptions.minSplicedAlignmentOverhang}`} type="text" defaultValue={sjOptions.minSplicedAlignmentOverhang} onKeyUp={(e) => handleTextInput(e, 'minSplicedAlignmentOverhang', parseInt(e.target.value, 10))} />
        </div>
        <div>
          <OptionDiv># samples with junction:
            <StyledPopup
              content="Filter junctions based on how many samples in the batch have this junction. A sample is counted as having the junction as long as the junction is supported by at least one read."
              position="left center"
              trigger={
                <Icon style={{ marginLeft: '8px' }} name="question circle outline" />
              }
            />
          </OptionDiv>
          <OptionInput key={`samples-with-junction-more-than-${sjOptions.minSamplesWithThisJunction}`} type="text" defaultValue={sjOptions.minSamplesWithThisJunction} onKeyUp={(e) => handleTextInput(e, 'minSamplesWithThisJunction', parseInt(e.target.value, 10))} /> &nbsp;≤ n ≤ <OptionInput key={`samples-with-junction-less-than-${sjOptions.maxSamplesWithThisJunction}`} type="text" defaultValue={sjOptions.maxSamplesWithThisJunction} onKeyUp={(e) => handleTextInput(e, 'maxSamplesWithThisJunction', parseInt(e.target.value, 10))} />
        </div>
        <div>
          <OptionDiv>% samples with junction:
            <StyledPopup
              content="Filter junctions based on what percentage of samples in the batch have this junction. A sample is counted as having the junction as long as the junction is supported by at least one read."
              position="left center"
              trigger={
                <Icon style={{ marginLeft: '8px' }} name="question circle outline" />
              }
            />
          </OptionDiv>
          <OptionInput key={`percent-samples-with-junction-more-than-${sjOptions.minPercentSamplesWithThisJunction}`} type="text" defaultValue={sjOptions.minPercentSamplesWithThisJunction} onKeyUp={(e) => handleTextInput(e, 'minPercentSamplesWithThisJunction', parseInt(e.target.value, 10))} /> &nbsp;≤ % ≤ <OptionInput key={`percent-samples-with-junction-less-than-${sjOptions.maxPercentSamplesWithThisJunction}`} type="text" defaultValue={sjOptions.maxPercentSamplesWithThisJunction} onKeyUp={(e) => handleTextInput(e, 'maxPercentSamplesWithThisJunction', parseInt(e.target.value, 10))} />
        </div>
      </OptionBox>
      <OptionBox>
        <div>
          <OptionDiv>Donor/Acceptor Motifs:</OptionDiv>
          {
            SJ_MOTIFS.map((motif) => <OptionDiv key={motif}><Checkbox label={`Show ${motif}`} checked={!sjOptions[`hideMotif${motif}`]} onChange={(e, data) => updateSjOptions({ [`hideMotif${motif}`]: !data.checked })} /></OptionDiv>)
          }
        </div>
        <OptionInputDiv>Track height: <OptionInput key={`track-height-${sjOptions.trackHeight}`} type="text" defaultValue={sjOptions.trackHeight} onKeyUp={(e) => handleTextInput(e, 'trackHeight', parseInt(e.target.value, 10))} /> px</OptionInputDiv>
        <OptionInputDiv><Button compact size="small" onClick={handleApplyButton}>Apply</Button></OptionInputDiv>
      </OptionBox>
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
