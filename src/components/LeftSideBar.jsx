import React from 'react'
import PropTypes from 'prop-types'
import styled from "styled-components"
import { Checkbox, Icon, Popup } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { getSamplesInfo, getSelectedSampleNames, getSjOptions, getVcfOptions, getBamOptions } from '../redux/selectors'



const CategoryH3 = styled.h3` 
  display: inline-block;
  margin: 12px 0px 0px 0px !important;
`
const CategoryDetails = styled.div`
  display: inline-block;
  margin: 0px 0px 0px 15px;
  color: #999;
  white-space: nowrap;
`

const StyledPopup = styled(Popup)`
  opacity: 0.95;
`

const CategoryPanel = ({category}) =>
  <div>
    <CategoryH3>{category.name.toUpperCase()}</CategoryH3>
    {
      category.samples.length >= 10 && <CategoryDetails>{`(N=${category.samples.length}) `}</CategoryDetails>
    }
  </div>


const SamplesPanel = ({samplesInfo, selectedSampleNames, updateSelectedSampleNames}) =>
  samplesInfo.map(category =>
    <div key={category.name}>
      <CategoryPanel category={category} />
      {
        category.samples.map(sample =>
          <SamplePanel key={sample.name} sample={sample} selectedSampleNames={selectedSampleNames} updateSelectedSampleNames={updateSelectedSampleNames}/>
        )
      }
    </div>,
  )

const SamplePanel = ({sample, selectedSampleNames, updateSelectedSampleNames}) =>
  <div>
    <Checkbox
      label={sample.name}
      defaultChecked={selectedSampleNames.includes(sample.name)}
      onChange={(e, data) =>
        updateSelectedSampleNames(
          data.checked ? [...selectedSampleNames, data.label] : selectedSampleNames.filter(x => x !== data.label),
        )
      }
    />
    <SampleDetails sample={sample} />
  </div>

const SampleDetails = ({sample}) => {
  return (sample.description ?
    <StyledPopup inverted
      content={sample.description}
      position="right center"
      trigger={
        <Icon style={{marginLeft: '10px'}} name="question circle outline" />
      } /> : null)
}

class LeftSideBar extends React.Component
{
  static propTypes = {
    samplesInfo: PropTypes.array,
    selectedSampleNames: PropTypes.array,
    sjOptions: PropTypes.object,
    vcfOptions: PropTypes.object,
    bamOptions: PropTypes.object,
    updateSelectedSampleNames: PropTypes.func,
    updateSjOptions: PropTypes.func,
    updateVcfOptions: PropTypes.func,
    updateBamOptions: PropTypes.func,
  }

  render() {
    //const params = new URLSearchParams(window.location.search)
    return (
      <div>
        <Checkbox label="show VCF tracks" defaultChecked={this.props.vcfOptions.showVcfs} onChange={(e, data) => this.props.updateVcfOptions({ showVcfs: data.checked })} />
        <Checkbox label="show BAM tracks" defaultChecked={this.props.bamOptions.showBams} onChange={(e, data) => this.props.updateBamOptions({ showBams: data.checked })} />

        <SamplesPanel
          samplesInfo={this.props.samplesInfo}
          selectedSampleNames={this.props.selectedSampleNames}
          updateSelectedSampleNames={this.props.updateSelectedSampleNames}
        />
      </div>)
  }
}

const mapStateToProps = state => ({
  selectedSampleNames: getSelectedSampleNames(state),
  samplesInfo: getSamplesInfo(state),
  sjOptions: getSjOptions(state),
  vcfOptions: getVcfOptions(state),
  bamOptions: getBamOptions(state),

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
  updateVcfOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_VCF_OPTIONS',
      updates: newSettings,
    })
  },
  updateBamOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_BAM_OPTIONS',
      updates: newSettings,
    })
  },
})


export { LeftSideBar as LeftSideBarComponent }

export default connect(mapStateToProps, mapDispatchToProps)(LeftSideBar)
