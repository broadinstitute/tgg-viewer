/* eslint-disable no-multiple-empty-lines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-danger */


import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Checkbox, Icon, Popup } from 'semantic-ui-react'
import DOMPurify from 'dompurify'
import { CategoryH3, OptionDiv, OptionInputDiv, StyledPopup } from './SideBarUtils'
import SelectedDataPanel from './SelectedDataPanel'
import EditLocusList from './EditLocusList'
import AddRows from './AddRows'
import SearchRows from './SearchRows'

import {
  getLeftSideBarLocusList,
  getRowsInCategories,
  getDataTypesUsersCanToggle,
  getEnabledDataTypes,
  getSelectedRowNamesByCategoryName,
} from '../redux/selectors'

const CategoryDetails = styled.div`
  display: inline-block;
  margin: 0px 0px 0px 15px;
  color: #999;
  white-space: nowrap;
`

const DataTypeIcon = styled.div.attrs({ name: 'stop' })`
  color: ${(props) => props.color};
  background-color: ${(props) => props.color};
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
  alignment: '#5DB6E9',
  vcf: '#E6A01B',
  gcnv_bed: '#AA3333',
  default: '#000000',
}

const dataTypeLabels = {
  coverage: 'Coverage',
  junctions: 'Splice Junctions',
  vcf: 'Variants (VCF)',
  gcnv_bed: 'gCNV',
  alignment: 'Reads (BAM)',
  bed: 'Annotations (BED)',
  gff3: 'Annotations (GFF3)',
  gtf: 'Annotations (GTF)',
  genePred: 'Annotations (genePred)',
  bigBed: 'Annotations (bigBed)',
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

/*
const SelectedDataSectionHeading = styled.div`
  font-weight: 700;
  margin: 8px 0px;
`
*/

const ShowTrackTypesPanel = ({ dataTypesUsersCanToggle, enabledDataTypes, updateDataTypesToShow }) => {
  if (dataTypesUsersCanToggle.length < 2) {
    return null
  }
  const checkBoxes = [...dataTypesUsersCanToggle].map((dataType, i) => {
    const label = dataTypeLabels[dataType] || (dataType.charAt(0).toUpperCase() + dataType.slice(1)) //to Title case
    return (
      <OptionDiv key={`${dataType} ${i}`}>
        <Checkbox label={`${label.toLocaleString()}`} checked={enabledDataTypes.includes(dataType)} onChange={(e, data) => updateDataTypesToShow(data.checked ? 'ADD' : 'REMOVE', [dataType])} />
        <RowColorLabelsContainer><Popup content={`This stripe marks rows that have ${label.toLowerCase()} data. Use the checkbox on the left to show or hide ${label.toLowerCase()} tracks for all rows selected below.`} position="right center" trigger={<DataTypeIcon color={dataTypeIconColors[dataType] || dataTypeIconColors.default} />} /></RowColorLabelsContainer>
      </OptionDiv>)
  })

  return (
    <div>
      <CategoryH3>Show Track Types</CategoryH3>
      {checkBoxes}
    </div>)
}

ShowTrackTypesPanel.propTypes = {
  dataTypesUsersCanToggle: PropTypes.array,
  enabledDataTypes: PropTypes.array,
  updateDataTypesToShow: PropTypes.func,
}


const RowColorLabelsWithPopup = ({ row }) => {
  const handleCopyToClipboard = () => {
    const s = (row.data || []).map((d) => d.url).join('\n')
    navigator.clipboard.writeText(s)
  }

  return (<Popup
    flowing
    content={
      <table>
        <tbody>
          {
            (row.data || []).map((d, i) =>
              <tr key={`${d.url} ${d.type} ${i}`}>
                <td style={{ paddingRight: '10px' }}>
                  <b>{d.type && (dataTypeLabels[d.type] || d.type.toUpperCase())}:</b>
                </td>
                <td>
                  <NoWrapDiv>{d.url}</NoWrapDiv>
                </td>
                <td style={{ color: 'gray', whiteSpace: 'nowrap', paddingLeft: '15px' }}>
                  {d.samples ? `(${d.samples.length} samples)` : null}
                </td>
              </tr>,
            )
          }
          <tr><td colSpan={2}><div style={{ fontSize: 'small', color: 'grey', marginTop: '10px' }}>(click to copy paths)</div></td></tr>
        </tbody>
      </table>
    }
    position="right center"
    trigger={
      <RowColorLabelsContainer onClick={handleCopyToClipboard}>
        {
          (row.data || []).map((d, i) => <DataTypeIcon key={`${d.url} ${d.type} ${i}`} color={dataTypeIconColors[d.type] || dataTypeIconColors.default} />)
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
    <CategoryH3>{category.categoryName}</CategoryH3>
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
    <div key={`${category.categoryName} ${i}`}>
      <CategoryPanel category={category} updateSelectedRowNames={updateSelectedRowNames} />
      {
        category.rows.map((row, j) => {
          const selectedRowNames = selectedRowNamesByCategoryName[category.categoryName] || []
          return <RowPanel key={`${row.name} ${j}`} row={row} categoryName={category.categoryName} selectedRowNames={selectedRowNames} updateSelectedRowNames={updateSelectedRowNames} />
        })
      }
      { i === rowsInCategories.length - 1 ? <AddRows category={category} /> : null }
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
/*
const DataSubrows = ({ data }) => {
  if (!data) {
    return null
  }

  const items = []
  data.filter((d) => d.type === 'gcnv_bed' && d.samples).forEach((d) => {
    d.samples.forEach((sample) => {
      items.push(<Checkbox
        key={sample}
        label={sample}
        checked={false}
        onChange={(e, _) => console.log(e, _)}
      />)
    })
  })

  return items
}

DataSubrows.propTypes = {
  data: PropTypes.array,
}
*/

const RowDetails = ({ row }) => {
  return (
    row.description
      ? <StyledPopup
        flowing
        content={row.description && <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(row.description) }} />}
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
      dataTypesUsersCanToggle,
      enabledDataTypes,
      selectedRowNamesByCategoryName,
      setLocus,
      setLocusList,
      updateDataTypesToShow,
      updateSelectedRowNames,
    } = this.props

    return (
      <div>
        <EditLocusList name="Left Side Bar" locusList={locusList} setLocus={setLocus} setLocusList={setLocusList} />
        <ShowTrackTypesPanel
          dataTypesUsersCanToggle={dataTypesUsersCanToggle}
          enabledDataTypes={enabledDataTypes}
          updateDataTypesToShow={updateDataTypesToShow}
        />
        <SearchRows />
        <OptionInputDiv>
          {/*<SelectedDataSectionHeading>Selected data:</SelectedDataSectionHeading>*/}
          <SelectedDataPanel />
        </OptionInputDiv>
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
  dataTypesUsersCanToggle: PropTypes.array,
  enabledDataTypes: PropTypes.array,
  selectedRowNamesByCategoryName: PropTypes.object,
  setLocus: PropTypes.func,
  setLocusList: PropTypes.func,
  updateDataTypesToShow: PropTypes.func,
  updateSelectedRowNames: PropTypes.func,
}

const mapStateToProps = (state) => ({
  locusList: getLeftSideBarLocusList(state),
  rowsInCategories: getRowsInCategories(state),
  dataTypesUsersCanToggle: getDataTypesUsersCanToggle(state),
  enabledDataTypes: getEnabledDataTypes(state),
  selectedRowNamesByCategoryName: getSelectedRowNamesByCategoryName(state),
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
  updateDataTypesToShow: (actionType, dataTypes) => {
    dispatch({
      type: `${actionType}_DATA_TYPES_TO_SHOW`,
      values: dataTypes,
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

export default connect(mapStateToProps, mapDispatchToProps)(LeftSideBar)
