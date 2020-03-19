/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Checkbox, Icon, Popup } from 'semantic-ui-react'
import { EditLocusList } from './EditLocusList'
import { CategoryH3, OptionDiv, StyledPopup } from './SideBarUtils'
import AddOrEditSamplePaths from './EditSamplePaths'
import { getLeftSideBarLocusList, getSamplesInCategories, getSelectedSampleNamesByCategoryName, getSjOptions, getVcfOptions, getBamOptions } from '../redux/selectors'


const CategoryDetails = styled.div`
  display: inline-block;
  margin: 0px 0px 0px 15px;
  color: #999;
  white-space: nowrap;
`

const DataTypeIcon = styled.div.attrs({ name: 'stop' })`
  color: ${(props) => props.color};
  border: 3px solid ${(props) => props.color};
  display: inline-block;
  width: 6px;
  border-radius: 1px;
  height: 10px;
  cursor: pointer;
`

const dataTypeIconColors = {
  junctions: '#B0B0EC',
  coverage: '#B5D29A',
  bam: '#B5D29A',
  vcf: '#E6A01B',
}

const LinkButton = styled.a`
  cursor: pointer;
  padding: 10px 10px 10px 0px;
  display: inline-block;
`

const SampleColorLabelsContainer = styled.span`
  padding-left: 5px;
  white-space: nowrap;
`

const NoWrapDiv = styled.div`
  white-space: nowrap;
`

const SampleColorLabelsWithPopup = ({ sample }) => {
  const handleCopyToClipboard = () => {
    const s = (sample.data || []).map((d) => d.url).join('\n')
    navigator.clipboard.writeText(s)
  }

  return (<Popup
    content={
      <table>
        <tbody>
          {
            (sample.data || []).map((d) => <tr><td style={{ paddingRight: '10px' }}><b>{d.type.toUpperCase()}:</b></td><td><NoWrapDiv>{d.url}</NoWrapDiv></td></tr>)
          }
          <tr><td colSpan={2}><div style={{ fontSize: 'small', color: 'grey', marginTop: '10px' }}>(click to copy paths)</div></td></tr>
        </tbody>
      </table>
    }
    position="right center"
    trigger={
      <SampleColorLabelsContainer onClick={handleCopyToClipboard}>
        {
          (sample.data || []).map((d) => <DataTypeIcon color={dataTypeIconColors[d.type]} />)
        }
      </SampleColorLabelsContainer>
    }
    style={{ marginLeft: '2px' }}
  />)
}
SampleColorLabelsWithPopup.propTypes = {
  sample: PropTypes.object,
}

const CategoryPanel = ({ category, updateSelectedSampleNames }) => (
  <div>
    <CategoryH3>{category.categoryName.toUpperCase()}</CategoryH3>
    {
      category.samples.length >= 12 && <CategoryDetails>{`(N=${category.samples.length}) `}</CategoryDetails>
    }
    {
      category.samples.length > 0 && (
      <div>
        <LinkButton onClick={
          (e) => {
            e.preventDefault()
            updateSelectedSampleNames('SET', category.categoryName, [])
          }
        }
        >
          Uncheck All
        </LinkButton>
      </div>)
    }
  </div>)

CategoryPanel.propTypes = {
  category: PropTypes.object,
  updateSelectedSampleNames: PropTypes.func,
}

const SamplesPanel = ({ samplesInCategories, selectedSampleNamesByCategoryName, updateSelectedSampleNames }) => (
  samplesInCategories.map((category, i) => (
    <div key={category.categoryName || i}>
      <CategoryPanel category={category} updateSelectedSampleNames={updateSelectedSampleNames} />
      {
        category.samples.map((sample, j) => {
          const selectedSampleNames = selectedSampleNamesByCategoryName[category.categoryName] || []
          return <SamplePanel key={sample.name || j} sample={sample} categoryName={category.categoryName} selectedSampleNames={selectedSampleNames} updateSelectedSampleNames={updateSelectedSampleNames} />
        })
      }
      <AddOrEditSamplePaths category={category} />
    </div>),
  ))

SamplesPanel.propTypes = {
  samplesInCategories: PropTypes.array,
  selectedSampleNamesByCategoryName: PropTypes.object,
  updateSelectedSampleNames: PropTypes.func,
}


const SamplePanel = ({ sample, categoryName, selectedSampleNames, updateSelectedSampleNames }) => (
  <NoWrapDiv>
    <Checkbox
      label={sample.name}
      checked={selectedSampleNames.includes(sample.name)}
      data-sample={sample.name}
      onChange={(e, data) => updateSelectedSampleNames(data.checked ? 'ADD' : 'REMOVE', categoryName, [data['data-sample']])}
    />
    <SampleDetails sample={sample} />
    <SampleColorLabelsWithPopup sample={sample} />
  </NoWrapDiv>)

SamplePanel.propTypes = {
  sample: PropTypes.object,
  categoryName: PropTypes.string,
  selectedSampleNames: PropTypes.array,
  updateSelectedSampleNames: PropTypes.func,
}

const SampleDetails = ({ sample }) => {
  return (
    sample.description
      ? <StyledPopup inverted
        content={sample.description}
        position="right center"
        trigger={
          <Icon style={{ marginLeft: '10px' }} name="question circle outline" />
        }
      />
      : null)
}

SampleDetails.propTypes = {
  sample: PropTypes.object,
}


class LeftSideBar extends React.PureComponent
{
  render() {
    //const params = new URLSearchParams(window.location.search)
    const {
      locusList,
      samplesInCategories,
      selectedSampleNamesByCategoryName,
      sjOptions,
      vcfOptions,
      bamOptions,
      setLocus,
      setLocusList,
      updateSelectedSampleNames,
      updateSjOptions,
      updateVcfOptions,
      updateBamOptions,
    } = this.props

    return (
      <div>
        <EditLocusList name="Left Side Bar" locusList={locusList} setLocus={setLocus} setLocusList={setLocusList} />
        <CategoryH3>TRACK TYPES TO SHOW PER SAMPLE</CategoryH3>
        <OptionDiv>
          <Checkbox label="RNA splice junctions" checked={sjOptions.showJunctions} onChange={(e, data) => updateSjOptions({ showJunctions: data.checked })} />
          <SampleColorLabelsContainer><Popup content="This color stripe marks samples that have splice junction data. Select this checkbox to show a splice junction track for each sample selected below." position="right center" trigger={<DataTypeIcon color={dataTypeIconColors.junctions} />} /></SampleColorLabelsContainer>
        </OptionDiv>
        <OptionDiv>
          <Checkbox label="RNA coverage" checked={sjOptions.showCoverage} onChange={(e, data) => updateSjOptions({ showCoverage: data.checked })} />
          <SampleColorLabelsContainer><Popup content="This color stripe marks samples that have coverage data. Select this checkbox to show a coverage track for each sample selected below." position="right center" trigger={<DataTypeIcon color={dataTypeIconColors.coverage} />} /></SampleColorLabelsContainer>
        </OptionDiv>
        <OptionDiv>
          <Checkbox label="BAM track" checked={bamOptions.showBams} onChange={(e, data) => updateBamOptions({ showBams: data.checked })} />
          <SampleColorLabelsContainer><Popup content="This color stripe marks samples that have alignment data. Select this checkbox to show a bam track for each sample selected below." position="right center" trigger={<DataTypeIcon color={dataTypeIconColors.bam} />} /></SampleColorLabelsContainer>
        </OptionDiv>
        <OptionDiv>
          <Checkbox label="VCF track" checked={vcfOptions.showVcfs} onChange={(e, data) => updateVcfOptions({ showVcfs: data.checked })} />
          <SampleColorLabelsContainer><Popup content="This color stripe marks samples that have splice junction data. Select this checkbox to show a vcf track for each sample selected below." position="right center" trigger={<DataTypeIcon color={dataTypeIconColors.vcf} />} /></SampleColorLabelsContainer>
        </OptionDiv>
        <SamplesPanel
          samplesInCategories={samplesInCategories}
          selectedSampleNamesByCategoryName={selectedSampleNamesByCategoryName}
          updateSelectedSampleNames={updateSelectedSampleNames}
        />
      </div>)
  }
}

LeftSideBar.propTypes = {
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

const mapStateToProps = (state) => ({
  locusList: getLeftSideBarLocusList(state),
  samplesInCategories: getSamplesInCategories(state),
  selectedSampleNamesByCategoryName: getSelectedSampleNamesByCategoryName(state),
  sjOptions: getSjOptions(state),
  vcfOptions: getVcfOptions(state),
  bamOptions: getBamOptions(state),
})

const mapDispatchToProps = (dispatch) => ({
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
      categoryName,
      selectedSampleNames,
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
