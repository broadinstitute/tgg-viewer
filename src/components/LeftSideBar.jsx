import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Checkbox, Icon, Popup } from 'semantic-ui-react'
import { EditLocusList } from './EditLocusList'
import AddOrEditSamplePaths from './EditSamplePaths'
import { getLeftSideBarLocusList, getSamplesInCategories, getSelectedSampleNamesByCategoryName, getSjOptions, getVcfOptions, getBamOptions } from '../redux/selectors'


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

const OptionDiv = styled.div`
  padding-top: 3px;
`

const StyledPopup = styled(Popup)`
  opacity: 0.95;
`

const StyledIcon = styled.div.attrs({ name: "stop" })`
  display: inline-block;
  width: 6px;
  border-radius: 1px;
  height: 10px;
  cursor: pointer;
`

const JunctionsIcon = styled(StyledIcon)`
   color: #B0B0EC;
   border: 3px solid #B0B0EC;
`

const CoverageIcon = styled(StyledIcon)`
   color: #B5D29A;
   border: 3px solid #B5D29A;
`

const BamIcon = styled(StyledIcon)`
   color: #5CB6EA;
   border: 3px solid #5CB6EA;
`

const VcfIcon = styled(StyledIcon)`
   color: #E6A01B;
   border: 3px solid #E6A01B;
`

const SampleColorLabelsContainer = styled.span`
  padding-left: 5px;
  white-space: nowrap;
`

const NoWrapDiv = styled.div`
  white-space: nowrap;
`

const SampleColorLabelsWithPopup = ({sample}) => <Popup
    content={
      <table>
        <tbody>
          {sample.junctions && <tr><td style={{ paddingRight: '10px' }}><b>Junctions:</b></td><td><NoWrapDiv>{sample.junctions}</NoWrapDiv></td></tr>}
          {sample.coverage && <tr><td><b>Coverage:</b></td><td><NoWrapDiv>{sample.coverage}</NoWrapDiv></td></tr>}
          {sample.bam && <tr><td><b>Bam:</b></td><td><NoWrapDiv>{sample.bam}</NoWrapDiv></td></tr>}
          {sample.vcf && <tr><td><b>Vcf:</b></td><td><NoWrapDiv>{sample.vcf}</NoWrapDiv></td></tr>}
          <tr><td colSpan={2}><div style={{fontSize: 'small', color: 'grey', marginTop: '10px' }}>(click to copy paths)</div></td></tr>
        </tbody>
      </table>
    }
    position="right center"
    trigger={
      <SampleColorLabelsContainer onClick={() =>
        navigator.clipboard.writeText(`${(sample.bam+"\n") || ""}${(sample.junctions+"\n") || ""}${(sample.coverage+"\n") || ""}${(sample.vcf+"\n") || ""}`)
      }>
        {sample.junctions && <JunctionsIcon />}
        {sample.coverage && <CoverageIcon />}
        {sample.bam && <BamIcon />}
        {sample.vcf && <VcfIcon />}
      </SampleColorLabelsContainer>
    }
    style={{ marginLeft: '2px' }}
  />


const CategoryPanel = ({category, updateSelectedSampleNames}) =>
  <div>
    <CategoryH3>{category.categoryName.toUpperCase()}</CategoryH3>
    {
      category.samples.length >= 10 && <CategoryDetails>{`(N=${category.samples.length}) `}</CategoryDetails>
    }
    {
      category.samples.length > 0 &&
      <div>
        <a href="#" onClick={(e) => {
          e.preventDefault()
          updateSelectedSampleNames('SET', category.categoryName, [])
        }}>Uncheck All</a>
      </div>
    }
  </div>


const SamplesPanel = ({samplesInCategories, selectedSampleNamesByCategoryName, updateSelectedSampleNames}) =>
  samplesInCategories.map(category =>
    <div key={category.categoryName}>
      <CategoryPanel category={category} updateSelectedSampleNames={updateSelectedSampleNames} />
      {
        category.samples.map(sample => {
          const selectedSampleNames = selectedSampleNamesByCategoryName[category.categoryName] || []
          return <SamplePanel key={sample.name} sample={sample} categoryName={category.categoryName} selectedSampleNames={selectedSampleNames} updateSelectedSampleNames={updateSelectedSampleNames} />
        })
      }
      <AddOrEditSamplePaths category={category} />
    </div>,
  )

const SamplePanel = ({sample, categoryName, selectedSampleNames, updateSelectedSampleNames}) =>
  <NoWrapDiv>
    <Checkbox
      label={sample.name}
      checked={selectedSampleNames.includes(sample.name)}
      data-sample={sample.name}
      onChange={(e, data) => updateSelectedSampleNames( data.checked ? 'ADD' : 'REMOVE', categoryName, [ data['data-sample'] ]) }
    />
    <SampleDetails sample={sample} />
    <SampleColorLabelsWithPopup sample={sample} />
  </NoWrapDiv>

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
    locusList: PropTypes.array,
    samplesInCategories: PropTypes.array,
    selectedSampleNamesByCategoryName: PropTypes.object,
    sjOptions: PropTypes.object,
    vcfOptions: PropTypes.object,
    bamOptions: PropTypes.object,
    setLocus: PropTypes.func,
    setLocusList: PropTypes.func,
    updateSelectedSampleNames: PropTypes.func,
    updateSjOptions: PropTypes.func,
    updateVcfOptions: PropTypes.func,
    updateBamOptions: PropTypes.func,
  }

  render() {
    //const params = new URLSearchParams(window.location.search)
    return (
      <div>
        <EditLocusList name="Left Side Bar" locusList={this.props.locusList} setLocus={this.props.setLocus} setLocusList={this.props.setLocusList} />
        <CategoryH3>TRACK TYPES TO SHOW PER SAMPLE</CategoryH3>
        <OptionDiv>
          <Checkbox label="RNA splice-junctions" defaultChecked={this.props.sjOptions.showJunctions} onChange={(e, data) => this.props.updateSjOptions({ showJunctions: data.checked })} />
          <SampleColorLabelsContainer><Popup content={'This color stripe marks samples that have splice junction data. Select this checkbox to show a splice junction track for each sample selected below.'} position="right center" trigger={<JunctionsIcon />} /></SampleColorLabelsContainer>
        </OptionDiv>
        <OptionDiv>
          <Checkbox label="RNA coverage" defaultChecked={this.props.sjOptions.showCoverage} onChange={(e, data) => this.props.updateSjOptions({ showCoverage: data.checked })} />
          <SampleColorLabelsContainer><Popup content={'This color stripe marks samples that have coverage data. Select this checkbox to show a coverage track for each sample selected below.'} position="right center" trigger={<CoverageIcon />} /></SampleColorLabelsContainer>
        </OptionDiv>
        <OptionDiv>
          <Checkbox label="BAM track" defaultChecked={this.props.bamOptions.showBams} onChange={(e, data) => this.props.updateBamOptions({ showBams: data.checked })} />
          <SampleColorLabelsContainer><Popup content={'This color stripe marks samples that have alignment data. Select this checkbox to show a bam track for each sample selected below.'} position="right center" trigger={<BamIcon />} /></SampleColorLabelsContainer>
        </OptionDiv>
        <OptionDiv>
          <Checkbox label="VCF track" defaultChecked={this.props.vcfOptions.showVcfs} onChange={(e, data) => this.props.updateVcfOptions({ showVcfs: data.checked })} />
          <SampleColorLabelsContainer><Popup content={'This color stripe marks samples that have splice junction data. Select this checkbox to show a vcf track for each sample selected below.'} position="right center" trigger={<VcfIcon />} /></SampleColorLabelsContainer>
        </OptionDiv>
        <SamplesPanel
          samplesInCategories={this.props.samplesInCategories}
          selectedSampleNamesByCategoryName={this.props.selectedSampleNamesByCategoryName}
          updateSelectedSampleNames={this.props.updateSelectedSampleNames}
        />
      </div>)
  }
}

const mapStateToProps = state => ({
  locusList: getLeftSideBarLocusList(state),
  samplesInCategories: getSamplesInCategories(state),
  selectedSampleNamesByCategoryName: getSelectedSampleNamesByCategoryName(state),
  sjOptions: getSjOptions(state),
  vcfOptions: getVcfOptions(state),
  bamOptions: getBamOptions(state),
})

const mapDispatchToProps = dispatch => ({
  setLocus: (locus) => {
    dispatch({
      type: 'UPDATE_LOCUS',
      newValue: locus,
    })
  },
  setLocusList: (locusList) => {
    dispatch({
      type: 'SET_LEFT_SIDE_BAR_LOCUS_LIST',
      values: locusList,
    })
  },
  updateSelectedSampleNames: (actionType, categoryName, selectedSampleNames) => {
    dispatch({
      type: `${actionType}_SELECTED_SAMPLE_NAMES`,
      categoryName: categoryName,
      selectedSampleNames: selectedSampleNames,
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
