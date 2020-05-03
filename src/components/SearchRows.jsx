/* eslint-disable */
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Search } from 'semantic-ui-react'
import {
  getRowsInCategories,
  getSelectedRowNamesByCategoryName,
} from '../redux/selectors'
import AddOrEditRows from "./EditRows";

const StyledSearch = styled(Search)`
  .prompt {
    border-radius: 2px !important;
    width: 155px;
  }
  
  input {
      max-width: none !important;
      padding: 5px !important;
  }
  .results {
      min-width: max-content;
  }
`

const MAX_AUTOCOMPLETE_RESULTS = 10
const INITIAL_STATE = { isLoading: false, results: [], value: '' }

class SearchRows extends React.Component {
  state = INITIAL_STATE

  handleResultSelect = (e, { result }) => {
    console.log(result)
    this.setState({ value: '' })
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.setState(INITIAL_STATE)

      const useCategories = this.props.rowsInCategories.length > 1
      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')

      let results = useCategories ? {} : []
      let resultsCounter = 0
      this.props.rowsInCategories.forEach((category) => {
        //category.categoryName
        if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) {
          return
        }

        if (useCategories) {
          results[category.categoryName] = {
            name: category.categoryName,
            results: [],
          }
        }
        const resultsArray = useCategories ? results[category.categoryName].results : results

        category.rows.forEach((row) => {
          if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) {
            return
          }

          if (re.test(row.name)) {
            resultsCounter += 1
            resultsArray.push({
              id: `${row.name}`,
              title: `${row.name}`,
            })
          }

          row.data.forEach((data) => {
            if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) {
              return
            }

            (data.samples || []).forEach((sample) => {
              if (resultsCounter >= MAX_AUTOCOMPLETE_RESULTS) {
                return
              }

              if (re.test(sample)) {
                resultsCounter += 1
                resultsArray.push({
                  id: `${row.name} > ${sample}`,
                  title: `${row.name} > ${sample}`,
                })
              }
            })
          })
        })
      })



      //console.warn('results', results)
      //const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      //const isMatch = (result) => re.test(result.title)


      this.setState({
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
      onSearchChange={_.debounce(this.handleSearchChange, 500, {
        leading: true,
      })}
      placeholder="Select data"
      results={results}
      value={value}
    />
  }
}

SearchRows.propTypes = {
  rowsInCategories: PropTypes.array,
  selectedRowNamesByCategoryName: PropTypes.object,
  updateSelectedRowNames: PropTypes.func,
}

const mapStateToProps = (state) => ({
  rowsInCategories: getRowsInCategories(state),
  selectedRowNamesByCategoryName: getSelectedRowNamesByCategoryName(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateSelectedRowNames: (actionType, categoryName, selectedRowNames) => {
    dispatch({
      type: `${actionType}_SELECTED_ROW_NAMES`,
      categoryName,
      selectedRowNames,
    })
  },
})



export default connect(mapStateToProps, mapDispatchToProps)(SearchRows)
