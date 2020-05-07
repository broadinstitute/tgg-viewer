/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/require-optimization */

import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Search } from 'semantic-ui-react'
import {
  getRowsInCategories,
  getSelectedRowNamesByCategoryName,
  getSelectedSamplesByCategoryNameAndRowName,
} from '../redux/selectors'

const StyledSearch = styled(Search)`
  margin-top: 15px; 
  .prompt {
    border-radius: 2px !important;
    width: 155px;
  }
  
  input {
      max-width: none !important;
      padding: 5px !important;
  }
  
  .input {
    -webkit-box-shadow: 0px 0px 1px 0px rgba(0,0,0) !important;
    -moz-box-shadow: 0px 0px 1px 0px rgba(0,0,0) !important;
    box-shadow: 0px 0px 1px 0px rgba(0,0,0) !important;
  }
  
  .results {
      min-width: max-content;
  }

  .red-text {
    .title {
      color: #CC0000 !important;
      font-weight: 500 !important;
     }
  }
`

const MAX_AUTOCOMPLETE_RESULTS = 12
const INITIAL_STATE = { isLoading: false, results: [], value: '' }

class SearchRows extends React.Component {

  constructor() {
    super()
    this.state = INITIAL_STATE
  }

  handleResultSelect = (e, { result }) => {
    this.setState({ value: '' })

    const idTokens = result.id.split('!!')
    const action = idTokens[0]
    const categoryName = idTokens[1]
    const rowName = idTokens[2]
    const sampleName = idTokens[3]

    if (sampleName) {
      if (action === 'ADD') {
        this.props.updateSelectedRowNames(action, categoryName, [rowName])
      }
      this.props.updateSelectedSamples(action, categoryName, { [rowName]: [sampleName] })
    } else {
      this.props.updateSelectedRowNames(action, categoryName, [rowName])
    }
  }

  getSelectedRowNames = (categoryName) => (this.props.selectedRowNamesByCategoryName[categoryName] || [])

  isRowSelected = (categoryName, rowName) => this.getSelectedRowNames(categoryName).includes(rowName)

  getSelectedSamplesByRowName = (categoryName) => ((this.props.selectedSamplesByCategoryNameAndRowName[categoryName] || {}).selectedSamples || {})

  getSelectedSamplesForRow = (categoryName, rowName) => (this.getSelectedSamplesByRowName(categoryName)[rowName] || [])

  isSampleSelected = (categoryName, rowName, sample) => this.getSelectedSamplesForRow(categoryName, rowName).includes(sample)

  addRowsToHide = (resultsByCategoryName, resultsCounter) => {
    Object.keys(this.props.selectedRowNamesByCategoryName).forEach((categoryName) => {
      if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
      this.props.selectedRowNamesByCategoryName[categoryName].forEach((rowName) => {
        if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
        resultsByCategoryName[categoryName] = resultsByCategoryName[categoryName] || []
        const newResult = { action: 'REMOVE', categoryName, rowName }
        if (!_.some(resultsByCategoryName[categoryName], newResult)) {
          resultsByCategoryName[categoryName].push(newResult)
          resultsCounter += 1
        }
      })
    })

    return resultsCounter
  }

  addSamplesToHide = (resultsByCategoryName, resultsCounter) => {
    Object.keys(this.props.selectedSamplesByCategoryNameAndRowName).forEach((categoryName) => {
      if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
      Object.keys(this.getSelectedSamplesByRowName(categoryName)).forEach((rowName) => {
        if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS || !this.isRowSelected(categoryName, rowName)) return
        this.getSelectedSamplesForRow(categoryName, rowName).forEach((sample) => {
          if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
          resultsByCategoryName[categoryName] = resultsByCategoryName[categoryName] || []
          const newResult = { action: 'REMOVE', categoryName, rowName, sample }
          if (!_.some(resultsByCategoryName[categoryName], newResult)) {
            resultsByCategoryName[categoryName].push(newResult)
            resultsCounter += 1
          }
        })
      })
    })

    return resultsCounter
  }

  addMatchingSamplesFromRow = (categoryName, row, inputStringRegExp, resultsByCategoryName, resultsCounter) => {
    if (!row.data) {
      return resultsCounter
    }

    const dataItemsWithSamples = row.data.filter((data) => data.samples && data.samples.length > 0)
    if (dataItemsWithSamples.length > 1) {
      console.warn('Found row with multiple data items each of which has a samples array. This may behave unexpectedly if there are duplicate samples')
    }

    //add samples with matching names
    dataItemsWithSamples.forEach((data) => {
      (data.samples || []).forEach((sample) => {
        if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
        if (inputStringRegExp.test(sample)) {
          resultsByCategoryName[categoryName] = resultsByCategoryName[categoryName] || []
          const newResult = {
            action: this.isRowSelected(categoryName, row.name) && this.isSampleSelected(categoryName, row.name, sample) ? 'REMOVE' : 'ADD',
            categoryName,
            rowName: row.name,
            sample,
          }
          if (!_.some(resultsByCategoryName[categoryName], newResult)) {
            resultsByCategoryName[categoryName].push(newResult)
            resultsCounter += 1
          }
        }
      })
    })

    return resultsCounter
  }

  addMatchingRowsAndSamples = (inputStringRegExp, resultsByCategoryName, resultsCounter) => {
    const matchingRowsByCategoryName = {} //used later to add samples from this row
    this.props.rowsInCategories.forEach((category) => {
      if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
      const { categoryName } = category
      category.rows.forEach((row) => {
        if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
        //add rows with matching names
        if (inputStringRegExp.test(row.name)) {
          matchingRowsByCategoryName[categoryName] = matchingRowsByCategoryName[categoryName] || []
          matchingRowsByCategoryName[categoryName].push(row)

          resultsByCategoryName[categoryName] = resultsByCategoryName[categoryName] || []
          const newResult = {
            action: this.isRowSelected(categoryName, row.name) ? 'REMOVE' : 'ADD',
            categoryName,
            rowName: row.name,
          }
          if (!_.some(resultsByCategoryName[categoryName], newResult)) { //avoid duplicates
            resultsByCategoryName[categoryName].push(newResult)
            resultsCounter += 1
          }
        }

        resultsCounter = this.addMatchingSamplesFromRow(categoryName, row, inputStringRegExp, resultsByCategoryName, resultsCounter)

      })
    })

    Object.entries(matchingRowsByCategoryName).forEach(([categoryName, rows]) => {
      if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
      resultsByCategoryName[categoryName] = resultsByCategoryName[categoryName] || []
      rows.forEach((row) => {
        if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
        resultsCounter = this.addMatchingSamplesFromRow(categoryName, row, /.*/, resultsByCategoryName, resultsCounter)
      })
    })

    return resultsCounter
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) {
        return this.setState(INITIAL_STATE)
      }

      const inputStringRegExp = new RegExp(_.escapeRegExp(this.state.value), 'i')

      const resultsByCategoryName = {}
      let resultsCounter = 0

      // search actions
      if (inputStringRegExp.test('Hide')) {
        resultsCounter = this.addRowsToHide(resultsByCategoryName, resultsCounter)
      }

      if (inputStringRegExp.test('Hide') || inputStringRegExp.test('Hide sample')) {
        // hide samples
        resultsCounter = this.addSamplesToHide(resultsByCategoryName, resultsCounter)
      }

      // search rows
      this.addMatchingRowsAndSamples(inputStringRegExp, resultsByCategoryName, resultsCounter)

      const useCategories = this.props.rowsInCategories.length > 1
      const results = useCategories ? {} : []
      Object.keys(resultsByCategoryName).forEach((categoryName) => {
        if (useCategories) {
          results[categoryName] = { name: categoryName, results: [] }
        }
        const resultsArray = useCategories ? results[categoryName].results : results
        resultsByCategoryName[categoryName].forEach((item) => {
          if (item.sample) {
            const actionLabel = item.action === 'ADD' ? 'Show sample' : 'Hide sample'
            resultsArray.push({
              id: `${item.action}!!${categoryName}!!${item.rowName}!!${item.sample}`,
              title: `${actionLabel} ${item.rowName} > ${item.sample}`,
              className: item.action !== 'ADD' && 'red-text',
            })
          } else {
            const actionLabel = item.action === 'ADD' ? 'Show' : 'Hide'
            resultsArray.push({
              id: `${item.action}!!${categoryName}!!${item.rowName}`,
              title: `${actionLabel} ${item.rowName}`,
              className: item.action !== 'ADD' && 'red-text',
            })
          }
        })
      })

      return this.setState({
        isLoading: false,
        results,
      })
    }, 1)
  }

  render = () => {
    const { isLoading, value, results } = this.state

    return <StyledSearch
      category={this.props.rowsInCategories.length > 1}
      loading={isLoading}
      onResultSelect={this.handleResultSelect}
      onSearchChange={this.handleSearchChange}
      placeholder="Select data"
      results={results}
      value={value}
    />
  }
}

SearchRows.propTypes = {
  rowsInCategories: PropTypes.array,
  selectedRowNamesByCategoryName: PropTypes.object,
  selectedSamplesByCategoryNameAndRowName: PropTypes.object,
  updateSelectedRowNames: PropTypes.func,
  updateSelectedSamples: PropTypes.func,
}

const mapStateToProps = (state) => ({
  rowsInCategories: getRowsInCategories(state),
  selectedRowNamesByCategoryName: getSelectedRowNamesByCategoryName(state),
  selectedSamplesByCategoryNameAndRowName: getSelectedSamplesByCategoryNameAndRowName(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateSelectedRowNames: (actionType, categoryName, selectedRowNames) => {
    dispatch({
      type: `${actionType}_SELECTED_ROW_NAMES`,
      categoryName,
      selectedRowNames,
    })
  },

  updateSelectedSamples: (actionType, categoryName, selectedSamplesByRowName) => {
    dispatch({
      type: `${actionType}_SELECTED_SAMPLES`,
      categoryName,
      selectedSamplesByRowName,
    })
  },
})


export default connect(mapStateToProps, mapDispatchToProps)(SearchRows)
