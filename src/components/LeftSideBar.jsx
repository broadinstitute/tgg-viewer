/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Checkbox, Icon, Popup } from 'semantic-ui-react'
import { EditLocusList } from './EditLocusList'
import { CategoryH3, OptionDiv, StyledPopup } from './SideBarUtils'
import AddOrEditRows from './EditRows'
import { getLeftSideBarLocusList, getRowsInCategories, getSelectedRowNamesByCategoryName, getSjOptions, getVcfOptions, getBamOptions } from '../redux/selectors'


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

const RowColorLabelsContainer = styled.span`
  padding-left: 5px;
  white-space: nowrap;
`

const NoWrapDiv = styled.div`
  white-space: nowrap;
`

const RowColorLabelsWithPopup = ({ row }) => {
  const handleCopyToClipboard = () => {
    const s = (row.data || []).map((d) => d.url).join('\n')
    navigator.clipboard.writeText(s)
  }

  return (<Popup
    content={
      <table>
        <tbody>
          {
            (row.data || []).map((d) => <tr key={d.url}><td style={{ paddingRight: '10px' }}><b>{d.type.toUpperCase()}:</b></td><td><NoWrapDiv>{d.url}</NoWrapDiv></td></tr>)
          }
          <tr><td colSpan={2}><div style={{ fontSize: 'small', color: 'grey', marginTop: '10px' }}>(click to copy paths)</div></td></tr>
        </tbody>
      </table>
    }
    position="right center"
    trigger={
      <RowColorLabelsContainer onClick={handleCopyToClipboard}>
        {
          (row.data || []).map((d) => <DataTypeIcon key={d.url} color={dataTypeIconColors[d.type]} />)
        }
      </RowColorLabelsContainer>
    }
    style={{ marginLeft: '2px' }}
  />)
}
RowColorLabelsWithPopup.propTypes = {
  row: PropTypes.object,
}

const CategoryPanel = ({ category, updateSelectedRowNames }) => (
  <div>
    <CategoryH3>{category.categoryName.toUpperCase()}</CategoryH3>
    {
      category.rows.length >= 12 && <CategoryDetails>{`(N=${category.rows.length}) `}</CategoryDetails>
    }
    {
      category.rows.length > 0 && (
      <div>
        <LinkButton onClick={
          (e) => {
            e.preventDefault()
            updateSelectedRowNames('SET', category.categoryName, [])
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
  updateSelectedRowNames: PropTypes.func,
}

const RowsPanel = ({ rowsInCategories, selectedRowNamesByCategoryName, updateSelectedRowNames }) => (
  rowsInCategories.map((category, i) => (
    <div key={category.categoryName || i}>
      <CategoryPanel category={category} updateSelectedRowNames={updateSelectedRowNames} />
      {
        category.rows.map((row, j) => {
          const selectedRowNames = selectedRowNamesByCategoryName[category.categoryName] || []
          return <RowPanel key={row.name || j} row={row} categoryName={category.categoryName} selectedRowNames={selectedRowNames} updateSelectedRowNames={updateSelectedRowNames} />
        })
      }
      <AddOrEditRows category={category} />
    </div>),
  ))

RowsPanel.propTypes = {
  rowsInCategories: PropTypes.array,
  selectedRowNamesByCategoryName: PropTypes.object,
  updateSelectedRowNames: PropTypes.func,
}


const RowPanel = ({ row, categoryName, selectedRowNames, updateSelectedRowNames }) => (
  <NoWrapDiv>
    <Checkbox
      label={row.name}
      checked={selectedRowNames.includes(row.name)}
      data-row={row.name}
      onChange={(e, data) => updateSelectedRowNames(data.checked ? 'ADD' : 'REMOVE', categoryName, [data['data-row']])}
    />
    <RowDetails row={row} />
    <RowColorLabelsWithPopup row={row} />
  </NoWrapDiv>)

RowPanel.propTypes = {
  row: PropTypes.object,
  categoryName: PropTypes.string,
  selectedRowNames: PropTypes.array,
  updateSelectedRowNames: PropTypes.func,
}

const RowDetails = ({ row }) => {
  return (
    row.description
      ? <StyledPopup inverted
        content={row.description}
        position="right center"
        trigger={
          <Icon style={{ marginLeft: '10px' }} name="question circle outline" />
        }
      />
      : null)
}

RowDetails.propTypes = {
  row: PropTypes.object,
}


class LeftSideBar extends React.PureComponent
{
  render() {
    //const params = new URLSearchParams(window.location.search)
    const {
      locusList,
      rowsInCategories,
      selectedRowNamesByCategoryName,
      sjOptions,
      vcfOptions,
      bamOptions,
      setLocus,
      setLocusList,
      updateSelectedRowNames,
      updateSjOptions,
      updateVcfOptions,
      updateBamOptions,
    } = this.props

    return (
      <div>
        <EditLocusList name="Left Side Bar" locusList={locusList} setLocus={setLocus} setLocusList={setLocusList} />
        <CategoryH3>TRACK TYPES TO SHOW</CategoryH3>
        <OptionDiv>
          <Checkbox label="RNA splice junctions" checked={sjOptions.showJunctions} onChange={(e, data) => updateSjOptions({ showJunctions: data.checked })} />
          <RowColorLabelsContainer><Popup content="This color stripe marks rows that have splice junction data. Select this checkbox to show a splice junction track for each row selected below." position="right center" trigger={<DataTypeIcon color={dataTypeIconColors.junctions} />} /></RowColorLabelsContainer>
        </OptionDiv>
        <OptionDiv>
          <Checkbox label="RNA coverage" checked={sjOptions.showCoverage} onChange={(e, data) => updateSjOptions({ showCoverage: data.checked })} />
          <RowColorLabelsContainer><Popup content="This color stripe marks rows that have coverage data. Select this checkbox to show a coverage track for each row selected below." position="right center" trigger={<DataTypeIcon color={dataTypeIconColors.coverage} />} /></RowColorLabelsContainer>
        </OptionDiv>
        <OptionDiv>
          <Checkbox label="BAM track" checked={bamOptions.showBams} onChange={(e, data) => updateBamOptions({ showBams: data.checked })} />
          <RowColorLabelsContainer><Popup content="This color stripe marks rows that have alignment data. Select this checkbox to show a bam track for each row selected below." position="right center" trigger={<DataTypeIcon color={dataTypeIconColors.bam} />} /></RowColorLabelsContainer>
        </OptionDiv>
        <OptionDiv>
          <Checkbox label="VCF track" checked={vcfOptions.showVcfs} onChange={(e, data) => updateVcfOptions({ showVcfs: data.checked })} />
          <RowColorLabelsContainer><Popup content="This color stripe marks rows that have splice junction data. Select this checkbox to show a vcf track for each row selected below." position="right center" trigger={<DataTypeIcon color={dataTypeIconColors.vcf} />} /></RowColorLabelsContainer>
        </OptionDiv>
        <RowsPanel
          rowsInCategories={rowsInCategories}
          selectedRowNamesByCategoryName={selectedRowNamesByCategoryName}
          updateSelectedRowNames={updateSelectedRowNames}
        />
      </div>)
  }
}

LeftSideBar.propTypes = {
  locusList: PropTypes.array,
  rowsInCategories: PropTypes.array,
  selectedRowNamesByCategoryName: PropTypes.object,
  sjOptions: PropTypes.object,
  vcfOptions: PropTypes.object,
  bamOptions: PropTypes.object,
  setLocus: PropTypes.func,
  setLocusList: PropTypes.func,
  updateSelectedRowNames: PropTypes.func,
  updateSjOptions: PropTypes.func,
  updateVcfOptions: PropTypes.func,
  updateBamOptions: PropTypes.func,
}

const mapStateToProps = (state) => ({
  locusList: getLeftSideBarLocusList(state),
  rowsInCategories: getRowsInCategories(state),
  selectedRowNamesByCategoryName: getSelectedRowNamesByCategoryName(state),
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
  updateSelectedRowNames: (actionType, categoryName, selectedRowNames) => {
    dispatch({
      type: `${actionType}_SELECTED_ROW_NAMES`,
      categoryName,
      selectedRowNames,
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
