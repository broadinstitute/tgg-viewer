import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Modal from './Modal'
import { Form, Icon, Popup, Radio, TextArea } from 'semantic-ui-react'

const LinkButton = styled.a`
  cursor: pointer;
  padding-top: 10px;
  padding-right: 10px;
  display: inline-block;
`

const ExampleDiv = styled.div`
  font-family: monospace;
  margin: 20px 30px;
  padding: 10px;
  background-color: #F7F7F7;
  white-space: nowrap;
`

const StyledRadio = styled(Radio)`
  label {
    margin-left: 10px;
    margin-bottom: 10px;
    padding-left: 1.4em !important;
  }
`

const StyledPopup = styled(Popup).attrs({ position: 'bottom center' })`
`


class EditSamplePathsButtonAndModal extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    samplePaths: PropTypes.array,
    setSamplePaths: PropTypes.func,
    trigger: PropTypes.node,
  }

  constructor(props) {
    super(props)

    this.state = { format: 'basic' }

    // TextArea refs don't work - probably because its a pure component, so use this hack
    this.textAreaValue = (Object.values(this.props.samplePaths) || []).join('\n')
  }

  render = () => {
    const samplePaths = this.props.samplePaths
    const samplePathsFormat = this.props.setSamplePathsFormat
    const title = `${this.props.name} Paths`

    const radioButtonOnChangeHandler = (e, data) => {
      if (data.checked) {
        this.setState({format: data.label})
      }
    }

    return <Modal
      title={title}
      size="large"
      modalName={title}
      trigger={this.props.trigger}
      handleSave={() => {
        const newSamplePaths = this.textAreaValue.split(/[,\s]+/).filter(Boolean)
        this.props.setSamplePaths(newSamplePaths)
      }}
    >
      <div>
        Enter google bucket path(s) for <i>.bigWig</i>, <i>.junctions.bed.gz</i>, <i>.bam/.cram</i>, or <i>.vcf.gz</i> files:<br />
        <br />
        <div>
          <b>Format:</b>
          <StyledRadio name="format" label="basic" checked={this.state.format === "basic"} onChange={radioButtonOnChangeHandler} />
          <StyledPopup trigger={<Icon style={{marginLeft: '8px'}} name="question circle outline" />} content={
            <div>
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
              The order of paths doesn't matter. Files that have the same prefix (eg. <i>gs://your-bucket/dir/sample-name1</i>) will be treated as being from the same sample.<br />
            </div>
          }/>

          <StyledRadio name="format" label="yaml" checked={this.state.format === "yaml"} onChange={radioButtonOnChangeHandler} />
          <StyledPopup trigger={<Icon style={{marginLeft: '8px'}} name="question circle outline" />}
            content={<div>
              <b>YAML format</b>:<br />
              <br />
              Provides per-sample file paths just like the Basic format, but allows additional meta-data to be specified - such as sample descriptions - as well as more flexibility in file names.<br />
              <ExampleDiv>
                <pre>
                - coverage: gs://your-bucket/dir/sample-name1.bigWig <br />
                  junctions: gs://your-bucket/dir/sample-name1.junctions.bed.gz <br />
                  bam: gs://your-bucket/dir/sample-name1.bam <br />
                - coverage: gs://your-bucket/dir/sample2.bigWig <br />
                  junctions: gs://your-bucket/dir/sample2.junctions.bed.gz <br />
                </pre>
              </ExampleDiv>
            </div>}
          />
          <StyledRadio name="format" label="json" checked={this.state.format === "json"} onChange={radioButtonOnChangeHandler} />
          <StyledPopup trigger={<Icon style={{marginLeft: '8px'}} name="question circle outline" />}
            content={
              <div>
                <b>JSON format</b>:<br />
                <br />
                Identical to YAML, but represented using the JSON hierarchical format.<br />

                gs:// bucket paths of .bigWig, .junctions.bed.gz, .vcf.gz, and/or .bam or .cram files.
                These formats are supported: yaml, json, or a simple list of paths separated by commas, spaces or new lines.
                .json format
              </div>
            }
          />
        </div>
      </div>
      <Form>
        <Form.Field
          control={TextArea}
          style={{ minHeight: '300px' }}
          defaultValue={this.textAreaValue}
          onKeyUp={(e) => {this.textAreaValue = e.target.value}}
          placeholder="Enter file path(s)">
        </Form.Field>
      </Form>
      <br />
      <b><i>NOTE:</i></b> These paths will be saved across page refreshes in this browser, but will not be recorded in the page url, so sharing a page link is not sufficient for sharing the paths.
    </Modal>
  }
}

export const AddOrEditSamplePaths = ({name, samplePaths, setSamplePaths}) => {
  samplePaths = samplePaths || []

  return <div>
    <EditSamplePathsButtonAndModal
      name={name}
      samplePaths={[]}
      setSamplePaths={setSamplePaths}
      trigger={<LinkButton>Add {samplePaths.length === 0 && this.props.name} Paths</LinkButton>}
    />
    {samplePaths.length > 0 && <EditSamplePathsButtonAndModal
      name={name}
      samplePaths={samplePaths}
      setSamplePaths={setSamplePaths}
      trigger={<LinkButton>Edit Paths</LinkButton>}
    />}
  </div>
}
