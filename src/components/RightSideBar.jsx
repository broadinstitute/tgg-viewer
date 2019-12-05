import React from 'react'
import PropTypes from 'prop-types'
import styled from "styled-components"
import { Checkbox, Icon, Popup } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { getSamplesInfo, getSelectedSampleNames, getSjOptions, getVcfOptions, getBamOptions } from '../redux/selectors'
import { MOTIFS } from '../constants'


const CategoryH3 = styled.h3` 
  display: inline-block;
  margin: 12px 0px 0px 0px !important;
`

const OptionDiv = styled.div`
  padding-top:3px;
`

const OptionInput = styled.input`
  display: inline;
  width: 50px;
  margin-left: 5px;
  padding-left: 5px;
`

const StyledPopup = styled(Popup)`
  opacity: 0.95;
`

const SjOptionsPanel = ({ sjOptions, updateSjOptions }) => {
  const handleTextInput = (e, name, value=null) => {
    if (e.keyCode === 13) {
      updateSjOptions({ [name]: value || e.target.value })
    }
  }

  return <div>
    <CategoryH3>JUNCTION TRACK OPTIONS</CategoryH3><br />
    <OptionDiv>Track height: <OptionInput type="text" defaultValue={sjOptions.trackHeight} onKeyUp={e => handleTextInput(e, 'trackHeight', parseInt(e.target.value))} /> px</OptionDiv>
    <OptionDiv><Checkbox label="Show coverage" defaultChecked={!sjOptions.hideCoverage} onChange={(e, data) => updateSjOptions({ hideCoverage: !data.checked })} /></OptionDiv>
    <OptionDiv><Checkbox label="Show known junctions" defaultChecked={!sjOptions.hideAnnotated} onChange={(e, data) => updateSjOptions({ hideAnnotated: !data.checked })} /></OptionDiv>
    <OptionDiv><Checkbox label="Show unknown junctions" defaultChecked={!sjOptions.hideUnannotated} onChange={(e, data) => updateSjOptions({ hideUnannotated: !data.checked })} /></OptionDiv>

    <OptionDiv>Color by:</OptionDiv>
    <OptionDiv>
      <select defaultValue={sjOptions.colorBy} onChange={e => updateSjOptions({ colorBy: e.target.value })}>
        <option value="strand">strand</option>
        <option value="motif">donor/acceptor motif</option>
        <option value="numUniqueReads"># uniquely-mapped reads</option>
        <option value="numReads"># total reads</option>
        <option value="isAnnotatedJunction">is known junction</option>
      </select>
    </OptionDiv>
    <OptionDiv>Junction thickness:</OptionDiv>
    <OptionDiv>
      <select defaultValue={sjOptions.thicknessBasedOn} onChange={e => updateSjOptions({ thicknessBasedOn: e.target.value })}>
        <option value="numUniqueReads"># uniquely-mapped reads</option>
        <option value="numReads"># total reads</option>
        <option value="isAnnotatedJunction">is known junction</option>
      </select>
    </OptionDiv>
    <OptionDiv>Junction bounce height:</OptionDiv>
    <OptionDiv>
      <select defaultValue={sjOptions.bounceHeightBasedOn} onChange={e => updateSjOptions({ bounceHeightBasedOn: e.target.value })}>
        <option value="random">random</option>
        <option value="distance">distance</option>
        <option value="thickness">thickness</option>
      </select>
    </OptionDiv>
    <OptionDiv>Junction label:</OptionDiv>
    <OptionDiv><Checkbox label="# uniquely-mapped" defaultChecked={sjOptions.labelUniqueReadCount} onChange={(e, data) => updateSjOptions({ labelUniqueReadCount: data.checked })} /></OptionDiv>
    <OptionDiv><Checkbox label="# multi-mapped" defaultChecked={sjOptions.labelMultiMappedReadCount} onChange={(e, data) => updateSjOptions({ labelMultiMappedReadCount: data.checked })} /></OptionDiv>
    <OptionDiv><Checkbox label="# total reads" defaultChecked={sjOptions.labelTotalReadCount} onChange={(e, data) => updateSjOptions({ labelTotalReadCount: data.checked })} /></OptionDiv>
    <OptionDiv><Checkbox label="donor/acceptor motif" defaultChecked={sjOptions.labelMotif} onChange={(e, data) => updateSjOptions({ labelMotif: data.checked })} /></OptionDiv>
    <OptionDiv>
      <Checkbox label="known junction:" defaultChecked={sjOptions.labelIsAnnotatedJunction} onChange={(e, data) => updateSjOptions({ labelIsAnnotatedJunction: data.checked })} />
      <OptionInput type="text" defaultValue={sjOptions.labelIsAnnotatedJunctionValue} onKeyUp={e => handleTextInput(e, 'labelIsAnnotatedJunctionValue')} style={{ width: '35px'}}  />
    </OptionDiv>

    <CategoryH3>JUNCTION TRACK FILTERS</CategoryH3><br />
    <div>
      <OptionDiv>Uniquely-mapped reads:</OptionDiv>
      at least <OptionInput type="text" defaultValue={sjOptions.minUniquelyMappedReads} onKeyUp={e => handleTextInput(e, 'minUniquelyMappedReads', parseInt(e.target.value))} />
    </div>
    <div>
      <OptionDiv>Total reads:</OptionDiv>
      at least <OptionInput type="text"  defaultValue={sjOptions.minTotalReads} onKeyUp={e => handleTextInput(e, 'minTotalReads', parseInt(e.target.value))} />
    </div>
    <div>
      <OptionDiv>Fraction multi-mapped:
        <StyledPopup inverted
          content="Allows filtering of junctions where most reads that span the junction are multi-mapped reads. For example, setting this to 0.79 will hide junctions where 8 out of 10 (or more) reads that span the junction are not uniquely mapped reads."
          position="left center"
          on="click"
          trigger={
            <Icon style={{marginLeft: '8px'}} name="question circle outline" />
          } />
      </OptionDiv>
      at most <OptionInput type="text" defaultValue={sjOptions.maxFractionMultiMappedReads} onKeyUp={e => handleTextInput(e, 'maxFractionMultiMappedReads', parseInt(e.target.value))} />
    </div>
    <div>
      <OptionDiv>Splice overhang base-pairs:</OptionDiv>
      at least <OptionInput type="text" defaultValue={sjOptions.minSplicedAlignmentOverhang} onKeyUp={e => handleTextInput(e, 'minSplicedAlignmentOverhang', parseInt(e.target.value))} />
    </div>
    <div>
      <OptionDiv>Donor/Acceptor Motifs:</OptionDiv>
      {
        MOTIFS.map(motif =>
          <OptionDiv key={motif}><Checkbox label={`Show ${motif}`} defaultChecked={!sjOptions[`hideMotif${motif}`]} onChange={(e, data) => updateSjOptions({ [`hideMotif${motif}`]: !data.checked })} /></OptionDiv>
        )
      }
    </div>
  </div>
}

const BamOptionsPanel = ( { bamOptions, updateBamOptions }) => {
  const handleTextInput = (e, name, value=null) => {
    if (e.keyCode === 13) {
      updateBamOptions({ [name]: value || e.target.value })
    }
  }

  return <div>
    <CategoryH3>BAM TRACK OPTIONS</CategoryH3><br />
    <OptionDiv>Track height: <OptionInput type="text" defaultValue={bamOptions.trackHeight} onKeyUp={e => handleTextInput(e, 'trackHeight', parseInt(e.target.value))} /> px</OptionDiv>
    <OptionDiv>Color by:</OptionDiv>
    <OptionDiv>
      <select defaultValue={bamOptions.colorBy} onChange={e => updateBamOptions({ colorBy: e.target.value })}>
        <option value="strand">Strand</option>
        <option value="firstOfPairStrand">First-of-pair strand</option>
        <option value="pairOrientation">Pair orientation</option>
        <option value="fragmentLength">Insert size (TLEN)</option>
        <option value="none">None</option>
      </select>
    </OptionDiv>
    <OptionDiv><Checkbox label="View as pairs" defaultChecked={bamOptions.viewAsPairs} onChange={(e, data) => updateBamOptions({ viewAsPairs: data.checked })} /></OptionDiv>
    <OptionDiv><Checkbox label="Show soft-clips" defaultChecked={bamOptions.showSoftClips} onChange={(e, data) => updateBamOptions({ showSoftClips: data.checked })} /></OptionDiv>
  </div>
}



const VcfOptionsPanel = ( { vcfOptions, updateVcfOptions }) => {
  const handleTextInput = (e, name, value=null) => {
    if (e.keyCode === 13) {
      updateVcfOptions({ [name]: value || e.target.value })
    }
  }

  return <div>
    <CategoryH3>VCF TRACK OPTIONS</CategoryH3><br />
    <OptionDiv>Track height: <OptionInput type="text" defaultValue={vcfOptions.trackHeight} onKeyUp={e => handleTextInput(e, 'trackHeight', parseInt(e.target.value))} /> px</OptionDiv>
  </div>
}


class RightSideBar extends React.Component
{
  static propTypes = {
    sjOptions: PropTypes.object,
    vcfOptions: PropTypes.object,
    bamOptions: PropTypes.object,
    samplesInfo: PropTypes.array,
    selectedSampleNames: PropTypes.array,
    updateSjOptions: PropTypes.func,
    updateVcfOptions: PropTypes.func,
    updateBamOptions: PropTypes.func,
    updateSelectedSampleNames: PropTypes.func,
  }

  render() {
    return <div>
      <SjOptionsPanel
        sjOptions={this.props.sjOptions}
        updateSjOptions={this.props.updateSjOptions}
      />
      <BamOptionsPanel
        bamOptions={this.props.bamOptions}
        updateBamOptions={this.props.updateBamOptions}
      />
      <VcfOptionsPanel
        vcfOptions={this.props.vcfOptions}
        updateVcfOptions={this.props.updateVcfOptions}
      />
    </div>
  }
}

const mapStateToProps = state => ({
  sjOptions: getSjOptions(state),
  vcfOptions: getVcfOptions(state),
  bamOptions: getBamOptions(state),
  selectedSampleNames: getSelectedSampleNames(state),
  samplesInfo: getSamplesInfo(state),
})

const mapDispatchToProps = dispatch => ({
  updateSelectedSampleNames: (selectedSampleNames) => {
    dispatch({
      type: 'UPDATE_SELECTED_SAMPLES',
      newValue: selectedSampleNames,
    })
  },
  updateSjOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_SJ_OPTIONS',
      updates: newSettings,
    })
  },
  updateBamOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_BAM_OPTIONS',
      updates: newSettings,
    })
  },
  updateVcfOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_VCF_OPTIONS',
      updates: newSettings,
    })
  },
})


export { RightSideBar as RightSideBarComponent }

export default connect(mapStateToProps, mapDispatchToProps)(RightSideBar)
