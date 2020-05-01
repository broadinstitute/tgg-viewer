/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/self-closing-comp */
/* eslint-disable object-shorthand */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Form, Icon, Message, Popup, Radio, TextArea } from 'semantic-ui-react'
import yaml from 'js-yaml'

import Modal from './Modal'
import { SUPPORTED_FILE_EXTENSIONS } from '../constants'
import { getInitialSettings } from '../redux/selectors'

const LinkButton = styled.a`
  cursor: pointer;
  padding: 10px 10px 10px 0px;
  display: inline-block;
`

const ExampleDiv = styled.div`
  font-family: monospace;
  margin: 20px 30px;
  padding: 10px;
  background-color: #F7F7F7;
  white-space: nowrap;
`

const ExamplePath = styled.span`
  font-family: monospace;
  background-color: #F7F7F7;
`

const StyledRadio = styled(Radio)`
  label {
    margin: 10px 0px 10px 20px;
    padding-left: 1.4em !important;
  }
`

const StyledPopup = styled(Popup).attrs({ position: 'bottom center' })`
`


class EditRowsButtonAndModal extends React.PureComponent {

  getInitialState = () => {
    const {
      rows,
    } = this.props
    const format = rows && rows.length > 0 ? 'yaml' : 'basic'

    return {
      format: format,
      textAreaValue: this.convertRowsToTextAreaValue(rows || [], format),
      warningMessage: null,
      errorMessage: null,
    }
  }

  constructor(props) {
    super(props)

    this.state = this.getInitialState()
  }

  parseTextAreaValueToRows = (textAreaValue, format) => {
    if (!textAreaValue.trim()) {
      return { rows: [], errorMessage: null }
    }

    let samples = []
    let errorMessage = null
    const invalidPaths = []

    if (format === 'basic') {
      const samplePaths = textAreaValue.split(/[,\s]+/).filter(Boolean)

      const samplesBySampleName = samplePaths.reduce((acc, samplePath) => {
        const pathTokens = samplePath.split('/')
        const fileName = pathTokens[pathTokens.length - 1]
        const matchingExtensions = Object.keys(SUPPORTED_FILE_EXTENSIONS).filter((ext) => fileName.endsWith(ext))
        if (matchingExtensions.length === 0) {
          invalidPaths.push(samplePath)
        } else {
          const ext = matchingExtensions[0]
          const filePrefix = fileName.replace(ext, '')
          if (!acc[filePrefix]) {
            acc[filePrefix] = {}
          }
          acc[filePrefix].name = filePrefix
          acc[filePrefix][SUPPORTED_FILE_EXTENSIONS[ext]] = samplePath
        }
        return acc
      }, {})

      samples = Object.values(samplesBySampleName)

    } else if (format === 'yaml' || format === 'json') {
      try {
        samples = yaml.safeLoad(textAreaValue)
        //TODO validate
      } catch (e) {
        errorMessage = `Unable to parse YAML: ${e}`
      }
    } else if (format === 'json') {
      try {
        samples = JSON.parse(textAreaValue)
        //TODO validate
      } catch (e) {
        errorMessage = `Unable to parse JSON: ${e}`
      }
    }

    if (invalidPaths.length > 0) {
      errorMessage = `These paths have unexpected file suffixes: ${invalidPaths.join(', ')}`
    }

    return { samples, errorMessage }
  }

  convertRowsToTextAreaValue = (rows, format) => {
    if (!rows || rows.length === 0) {
      return ''
    }

    let textAreaValue
    if (format === 'basic') {
      textAreaValue = rows.map((row) => Object.keys(row)
        .filter(
          (key) => key !== 'name' && key !== 'description')
        .map(
          (key) => row[key]))
        .flat().join('\n')
    } else if (format === 'yaml') {
      textAreaValue = yaml.safeDump(rows, { flowLevel: 2 })
    } else if (format === 'json') {
      textAreaValue = JSON.stringify(rows, null, 2)
    }

    return textAreaValue
  }

  formatRadioButtonChangeHandler = (e, data) => {
    const {
      textAreaValue,
      format,
    } = this.state

    const { rows, errorMessage } = this.parseTextAreaValueToRows(textAreaValue, format)
    if (errorMessage) {
      e.preventDefault()
      this.setState({ errorMessage: errorMessage })
      return false
    }
    this.setState({ errorMessage: '' })

    if (data.checked) {
      this.setState({ format: data.label, textAreaValue: this.convertRowsToTextAreaValue(rows, data.label) })
    }

    return true
  }

  getInitialRowsInCategory = () => {
    // cache originalCategories for reset button
    const {
      categoryName,
      showResetButton,
      initialRowsInCategories,
    } = this.props

    if (showResetButton && initialRowsInCategories) {
      const originalCategories = initialRowsInCategories.filter((category) => category.categoryName === categoryName)
      if (originalCategories.length > 0) {
        return originalCategories[0].rows
      }
    }

    return []
  }

  resetButtonClickHandler = () => {
    const {
      format,
    } = this.state

    const initialRowsInCategory = this.getInitialRowsInCategory()
    const textAreaValue = this.convertRowsToTextAreaValue(initialRowsInCategory, format)
    this.setState({ textAreaValue: textAreaValue })
  }

  handleModalSave = () => {
    const {
      setRows,
    } = this.props

    const {
      textAreaValue,
      format,
    } = this.state

    const { rows, errorMessage } = this.parseTextAreaValueToRows(textAreaValue, format)

    if (errorMessage) {
      this.setState({ errorMessage: errorMessage })
      return false
    }

    setRows(rows)
    return true

  }

  handleModalClose = () => {
    this.setState(this.getInitialState())
    return true
  }

  render = () => {
    const {
      rows,
      title,
      showResetButton,
      trigger,
    } = this.props

    const {
      format,
      textAreaValue,
      warningMessage,
      errorMessage,
    } = this.state

    const fullTitle = `${title} Rows`
    let initialRowsInCategory
    if (showResetButton) {
      initialRowsInCategory = this.getInitialRowsInCategory()
    }

    const someRowsHaveDescriptionOrMultipleDataFiles = rows.some(
      (row) => row.description || Object.keys(row).filter((key) => key !== 'name' && key !== 'description').length > 1,
    )

    return (
      <Modal
        title={fullTitle}
        size="large"
        modalName={fullTitle}
        trigger={trigger}
        handleSave={this.handleModalSave}
        handleClose={this.handleModalClose}
      >
        <div>
          Enter google bucket path(s) for <i>.bigWig</i>, <i>.junctions.bed.gz</i>, <i>.bam/.cram</i>, or <i>.vcf.gz</i> files:<br />
          <br />
          <div>
            <b>Format:</b>
            <StyledRadio name="format" label="basic" disabled={someRowsHaveDescriptionOrMultipleDataFiles} checked={format === 'basic'} onChange={this.formatRadioButtonChangeHandler} />
            <StyledPopup trigger={<Icon style={{ marginLeft: '8px' }} name="question circle outline" />} content={
              <div>
                {
                  someRowsHaveDescriptionOrMultipleDataFiles && (
                  <div>
                    <b>[Disabled]</b> because some rows have multiple data files and/or a description.<br />
                    <br />
                  </div>)
                }
                <b>Basic format</b>:<br />
                <br />
                Enter a list of paths separated by commas, spaces or new lines. <br />
                <br />
                Example:<br />
                <ExampleDiv>
                  gs://your-bucket/dir/sample-name1.bigWig <br />
                  gs://your-bucket/dir/sample2.bigWig <br />
                  gs://your-bucket/dir/sample-name1.junctions.bed.gz <br />
                  gs://your-bucket/dir/sample-name1.bam <br />
                  gs://your-bucket/dir/sample2.junctions.bed.gz <br />
                </ExampleDiv>
                Paths that have the same prefix (like <ExamplePath>gs://your-bucket/dir/sample-name1</ExamplePath> in the example) will be interpreted as different data types from the same sample.<br />
                <br />
                The order of paths doesn&apos;t matter.
              </div>
            }
            />

            <StyledRadio name="format" label="yaml" checked={format === 'yaml'} onChange={this.formatRadioButtonChangeHandler} />
            <StyledPopup trigger={<Icon style={{ marginLeft: '8px' }} name="question circle outline" />}
              content={
                <div>
                  <b>YAML format</b>:<br />
                  <br />
                  Provides per-sample file paths just like the Basic format, but allows additional meta-data to be specified - such as sample descriptions - as well as more flexibility in file names.<br />
                  <ExampleDiv>
                    - name: sample1 <br />
                      &nbsp; description: description of sample1 <br />
                      &nbsp; coverage: gs://your-bucket/dir/sample-name1.bigWig <br />
                      &nbsp; junctions: gs://your-bucket/dir2/sample-name1.junctions.bed.gz <br />
                      &nbsp; bam: gs://your-bucket/dir3/sample-name1.bam <br />
                      &nbsp; vcf: gs://your-bucket/dir3/sample-name1-wgs-variants.vcf.gz <br />
                    - name: sample2 <br />
                      &nbsp; coverage: gs://your-bucket/dir/sample2.bigWig <br />
                      &nbsp; junctions: gs://your-bucket/dir2/sample2.junctions.bed.gz <br />
                  </ExampleDiv>
                </div>
              }
            />
            <StyledRadio name="format" label="json" checked={format === 'json'} onChange={this.formatRadioButtonChangeHandler} />
            <StyledPopup trigger={<Icon style={{ marginLeft: '8px' }} name="question circle outline" />}
              content={
                <div>
                  <b>JSON format</b>:<br />
                  <br />
                  Identical to YAML, but represented in the JSON format.<br />
                  <ExampleDiv>
                    {'[{'}<br />
                    {' "name": "sample1",'}<br />
                    {' "coverage": "gs://your-bucket/dir/sample-name1.bigWig", '}<br />
                    {' "junctions": "gs://your-bucket/dir2/sample-name1.junctions.bed.gz", '}<br />
                    {' "bam": "gs://your-bucket/dir3/sample-name1.bam", '}<br />
                    {' "vcf": "gs://your-bucket/dir3/sample-name1-wgs-variants.vcf.gz" '}<br />
                    {'}, {'}<br />
                    {' "name": "sample2", '}<br />
                    {' "coverage": "gs://your-bucket/dir/sample2.bigWig", '}<br />
                    {' "junctions": "gs://your-bucket/dir2/sample2.junctions.bed.gz" '}<br />
                    {'}]'}<br />
                  </ExampleDiv>
                </div>
              }
            />
            {
              showResetButton && (
              <LinkButton style={{ float: 'right' }} onClick={this.resetButtonClickHandler}>
                Reset {(initialRowsInCategory && initialRowsInCategory.length > 0) ? `To ${initialRowsInCategory.length} Original Samples` : null}
              </LinkButton>)
            }
          </div>
        </div>
        <Form>
          <TextArea
            style={{ minHeight: '300px' }}
            value={textAreaValue}
            onChange={(e) => {
              this.setState({ textAreaValue: e.target.value })
            }}
            placeholder="Enter file path(s)"
          >
          </TextArea>
        </Form>

        <br />
        <b><i>NOTE:</i></b> These paths will be saved across page refreshes in this browser, but will not be recorded in the page url like other settings. Sharing or bookmarking this page won&apos;t include these paths.
        {
          warningMessage && (
          <Message color="yellow">
            {warningMessage}
          </Message>)
        }
        {
          errorMessage && (
          <Message color="red">
            {errorMessage}
          </Message>)
        }
      </Modal>)
  }
}

EditRowsButtonAndModal.propTypes = {
  title: PropTypes.string,
  categoryName: PropTypes.string,
  rows: PropTypes.array,
  setRows: PropTypes.func,
  trigger: PropTypes.node,
  showResetButton: PropTypes.bool,
  initialRowsInCategories: PropTypes.array,
}


const AddOrEditRows = ({ category, initialRowsInCategories, updateRows }) => {
  return (
    <div>
      <EditRowsButtonAndModal
        key={`${JSON.stringify(category.rows)}_add`}
        title={`Add ${category.categoryName}`}
        categoryName={category.categoryName}
        rows={[]}
        setRows={(rows) => updateRows('ADD', category.categoryName, rows)}
        initialRowsInCategories={initialRowsInCategories}
        trigger={<LinkButton>Add {category.rows.length === 0 ? category.categoryName : null} Rows</LinkButton>}
      />
      {category.rows.length > 0 && <EditRowsButtonAndModal
        key={`${JSON.stringify(category.rows)}_edit`}
        title={`Edit ${category.categoryName}`}
        categoryName={category.categoryName}
        rows={category.rows}
        setRows={(rows) => updateRows('SET', category.categoryName, rows)}
        initialRowsInCategories={initialRowsInCategories}
        trigger={<LinkButton>Edit Rows</LinkButton>}
        showResetButton
      />}
    </div>)
}

AddOrEditRows.propTypes = {
  category: PropTypes.object,
  initialRowsInCategories: PropTypes.array,
  updateRows: PropTypes.func,
}

const mapStateToProps = (state) => ({
  initialRowsInCategories: getInitialSettings(state).rowsInCategories,
})


const mapDispatchToProps = (dispatch) => ({
  updateRows: (actionType, categoryName, rows) => {
    dispatch({
      type: `${actionType}_ROWS`,
      categoryName: categoryName,
      rows: rows,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(AddOrEditRows)
