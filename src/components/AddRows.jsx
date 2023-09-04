/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/self-closing-comp */
/* eslint-disable object-shorthand */
/* eslint-disable no-else-return */
/* eslint-disable react/no-array-index-key */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Form, Icon, Message, Popup, TextArea } from 'semantic-ui-react'

import Modal from './Modal'

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

const StyledPopup = styled(Popup).attrs({ position: 'right center' })`
`

export const SUPPORTED_FILE_EXTENSIONS = {
  '.bigWig': 'coverage',
  '.bw': 'coverage',
  '.junctions.bed': 'junctions',
  '.spliceJunctions.bed': 'junctions',
  '.junctions.bed.gz': 'junctions',
  '.spliceJunctions.bed.gz': 'junctions',

  '.bam': 'bam',
  '.cram': 'bam',

  '.vcf': 'vcf',
  '.vcf.gz': 'vcf',

  '.wig': 'wig',
  '.bedGraph': 'wig',

  '.gcnv.bed': 'gcnv_bed',
  '.gcnv.bed.gz': 'gcnv_bed',

  '.bed': 'bed',
  '.bed.gz': 'bed',
  '.gff3': 'gff',
  '.gtf': 'gtf',
  '.gtf.gz': 'gtf',
  '.genePred': 'genePred',
  '.bigBed': 'bigBed',
}

class AddRowsButtonAndModal extends React.PureComponent {

  getInitialState = () => {
    return {
      textAreaValue: '',
      warningMessage: null,
      errorMessage: null,
    }
  }

  constructor(props) {
    super(props)

    this.state = this.getInitialState()
  }

  parseTextAreaValueToRows = (textAreaValue) => {
    if (!textAreaValue.trim()) {
      return { rows: [], errorMessage: null }
    }

    let errorMessage = null
    const invalidPaths = []
    const dataPaths = textAreaValue.split(/[,\s]+/).filter(Boolean)

    const newRowsByRowName = dataPaths.reduce((acc, dataPath) => {
      const pathTokens = dataPath.split('/')
      const fileName = pathTokens[pathTokens.length - 1]
      const matchingExtensions = Object.keys(SUPPORTED_FILE_EXTENSIONS).filter((ext) => fileName.endsWith(ext))
      if (matchingExtensions.length === 0) {
        invalidPaths.push(dataPath)
      } else {
        const ext = matchingExtensions[0]
        const filePrefix = fileName.replace(ext, '')
        if (!acc[filePrefix]) {
          acc[filePrefix] = { data: [] }
        }

        acc[filePrefix].name = filePrefix
        acc[filePrefix].data.push(
          { type: SUPPORTED_FILE_EXTENSIONS[ext], url: dataPath },
        )
      }
      return acc
    }, {})

    if (invalidPaths.length > 0) {
      errorMessage = `These paths have file suffixes that are not recognized: ${invalidPaths.join(', ')}`
    }

    return { newRows: Object.values(newRowsByRowName), errorMessage }
  }

  handleModalSave = () => {
    const {
      addRows,
    } = this.props

    const {
      textAreaValue,
    } = this.state

    const { newRows, errorMessage } = this.parseTextAreaValueToRows(textAreaValue)
    if (errorMessage) {
      this.setState({ errorMessage: errorMessage })
      return false
    } else {
      addRows(newRows)
      this.setState(this.getInitialState())
      return true
    }
  }

  handleModalClose = () => {
    this.setState(this.getInitialState())
    return true
  }

  render = () => {
    const {
      title,
      trigger,
    } = this.props

    const {
      textAreaValue,
      warningMessage,
      errorMessage,
    } = this.state

    const fullTitle = `${title} Rows`

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
          Enter google bucket path(s) for data files: &nbsp;
          <StyledPopup trigger={<Icon style={{ margin: '10px 0px' }} name="question circle outline" />} content={
            <div>
              <b>Format</b>:<br />
              <br />
              Enter a list of data file paths separated by commas, spaces or new lines. <br />
              <br />
              Example:<br />
              <ExampleDiv>
                gs://your-bucket/dir/sample-name1.bigWig <br />
                gs://your-bucket/dir/sample2.bigWig <br />
                gs://your-bucket/dir/sample-name1.junctions.bed.gz <br />
                gs://your-bucket/dir/sample-name1.bam <br />
                gs://your-bucket/dir/sample2.junctions.bed.gz <br />
              </ExampleDiv>
              Paths that have the same prefix (eg. <ExamplePath>gs://your-bucket/dir/sample-name1</ExamplePath> above) will be interpreted as different data types from the same sample.<br />
              The order of paths doesn&apos;t matter.<br />
              <br />
              IGV.js track types will be inferred from file extensions as follows:<br />
              <div style={{ margin: '10px 30px' }}>
                <table>
                  <tbody>
                    <tr><td> <b> File Extension </b> </td><td> <b>IGV.js Track Type</b> </td></tr>
                    {Object.entries(SUPPORTED_FILE_EXTENSIONS).filter(([ext]) => !ext.endsWith('.bed')).map(
                      ([ext, fileType], i) => <tr key={`${ext} ${fileType} ${i}`}><td>{ext}</td><td>{fileType}</td></tr>,
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          }
          />
          <br />
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

AddRowsButtonAndModal.propTypes = {
  title: PropTypes.string,
  addRows: PropTypes.func,
  trigger: PropTypes.node,
}

const AddRows = ({ category, addRows }) => (
  <div>
    <AddRowsButtonAndModal
      title={`Add ${category.categoryName}`}
      categoryName={category.categoryName}
      addRows={(rows) => addRows(category.categoryName, rows)}
      trigger={<LinkButton>Add {category.rows.length === 0 ? category.categoryName : null} Rows</LinkButton>}
    />
  </div>)

AddRows.propTypes = {
  category: PropTypes.object,
  addRows: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
  addRows: (categoryName, rows) => {
    dispatch({
      type: 'ADD_ROWS',
      categoryName: categoryName,
      rows: rows,
    })
  },
})

export default connect(null, mapDispatchToProps)(AddRows)
