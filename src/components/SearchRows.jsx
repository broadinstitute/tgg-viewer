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
  getSelectedRowNamesByCategoryName, getSelectedSamplesByCategoryNameAndRowName,
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
      -webkit-box-shadow: 0px 0px 1px 0px rgba(201,201,201,1);
      -moz-box-shadow: 0px 0px 1px 0px rgba(201,201,201,1);
      box-shadow: 0px 0px 1px 0px rgba(201,201,201,1);
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

const MAX_AUTOCOMPLETE_RESULTS = 10
const INITIAL_STATE = { isLoading: false, results: [], value: '' }

class SearchRows extends React.Component {

  constructor() {
    super()
    this.state = INITIAL_STATE
  }

  handleResultSelect = (e, { result }) => {
    this.setState({ value: '' })

    console.log(e, result)

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

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    const getSelectedRowNames = (categoryName) => (this.props.selectedRowNamesByCategoryName[categoryName] || [])
    const isRowSelected = (categoryName, rowName) => getSelectedRowNames(categoryName).includes(rowName)

    const getSelectedSamplesByRowName = (categoryName) => ((this.props.selectedSamplesByCategoryNameAndRowName[categoryName] || {}).selectedSamples || {})
    const getSelectedSamplesForRow = (categoryName, rowName) => (getSelectedSamplesByRowName(categoryName)[rowName] || [])
    const isSampleSelected = (categoryName, rowName, sample) => getSelectedSamplesForRow(categoryName, rowName).includes(sample)

    setTimeout(() => {
      if (this.state.value.length < 1) {
        return this.setState(INITIAL_STATE)
      }

      const inputStringRegExp = new RegExp(_.escapeRegExp(this.state.value), 'i')

      const resultsByCategoryName = {}
      let resultsCounter = 0

      // search actions
      if (inputStringRegExp.test('Hide')) {
        Object.keys(this.props.selectedRowNamesByCategoryName).forEach((categoryName) => {
          if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
          this.props.selectedRowNamesByCategoryName[categoryName].forEach((rowName) => {
            if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
            resultsByCategoryName[categoryName] = resultsByCategoryName[categoryName] || []
            const newResult = { action: 'REMOVE', categoryName, rowName }
            if (!_.some(resultsByCategoryName[categoryName], newResult)) {
              resultsByCategoryName[categoryName].push(newResult)
            }
            resultsCounter += 1
          })
        })
      }

      if (inputStringRegExp.test('Hide') || inputStringRegExp.test('Hide sample')) {
        Object.keys(this.props.selectedSamplesByCategoryNameAndRowName).forEach((categoryName) => {
          if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
          Object.keys(getSelectedSamplesByRowName(categoryName)).forEach((rowName) => {
            if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS || !isRowSelected(categoryName, rowName)) return
            getSelectedSamplesForRow(categoryName, rowName).forEach((sample) => {
              if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
              resultsByCategoryName[categoryName] = resultsByCategoryName[categoryName] || []
              const newResult = { action: 'REMOVE', categoryName, rowName, sample }
              if (!_.some(resultsByCategoryName[categoryName], newResult)) {
                resultsByCategoryName[categoryName].push(newResult)
              }
              resultsCounter += 1
            })
          })
        })
      }

      // search rows
      this.props.rowsInCategories.forEach((category) => {
        if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
        category.rows.forEach((row) => {
          if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
          if (inputStringRegExp.test(row.name)) {
            resultsByCategoryName[category.categoryName] = resultsByCategoryName[category.categoryName] || []
            const newResult = {
              action: isRowSelected(category.categoryName, row.name) ? 'REMOVE' : 'ADD',
              categoryName: category.categoryName,
              rowName: row.name,
            }
            if (!_.some(resultsByCategoryName[category.categoryName], newResult)) {
              resultsByCategoryName[category.categoryName].push(newResult)
            }
            resultsCounter += 1
          }

          if (!row.data) {
            return
          }

          const dataItemsWithSamples = row.data.filter((data) => data.samples && data.samples.length > 0)
          if (dataItemsWithSamples.length > 1) {
            console.warn('Found row with multiple data items each of which has a samples array. This may behave unexpectedly if there are duplicate samples')
          }

          dataItemsWithSamples.forEach((data) => {
            (data.samples || []).forEach((sample) => {
              if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) return
              if (inputStringRegExp.test(sample)) {
                resultsByCategoryName[category.categoryName] = resultsByCategoryName[category.categoryName] || []
                const newResult = {
                  action: isRowSelected(category.categoryName, row.name) && isSampleSelected(category.categoryName, row.name, sample) ? 'REMOVE' : 'ADD',
                  categoryName: category.categoryName,
                  rowName: row.name,
                  sample,
                }
                if (!_.some(resultsByCategoryName[category.categoryName], newResult)) {
                  resultsByCategoryName[category.categoryName].push(newResult)
                }
                resultsCounter += 1
              }
            })
          })
        })
      })

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
    }, 300)
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
