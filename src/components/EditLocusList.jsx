/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Form, TextArea } from 'semantic-ui-react'
import Modal from './Modal'

const LinkButton = styled.a`
  cursor: pointer;
`

class EditLocusListButtonAndModal extends React.PureComponent {

  constructor(props) {
    super(props)

    const {
      locusList,
    } = this.props

    this.textAreaValue = (locusList || []).join('\n') // TextArea refs don't work - probably because its a pure component, so use this hack
  }

  render = () => {
    const {
      locusList,
      name,
      setLocusList,
    } = this.props

    const title = `Locus List - ${name}`

    return (
      <Modal
        title={title}
        size="large"
        modalName={title}
        trigger={
          <LinkButton>
            {
              (locusList || []).length > 0
                ? <div><br />Edit Locus List</div>
                : <div>Add Locus List To Side Bar</div>
            }
          </LinkButton>
        }
        handleSave={() => {
          const newLocusList = this.textAreaValue.split(/[,\s]+/).filter(Boolean)
          setLocusList(newLocusList)

          return true
        }}
      >
        <Form>
          <Form.Field
            control={TextArea}
            style={{ minHeight: '300px' }}
            defaultValue={this.textAreaValue}
            onKeyUp={(e) => { this.textAreaValue = e.target.value }}
            placeholder="Enter genomic positions, intervals, and/or gene names separated by commas, spaces, or new lines. &#10;
              These can be in any format recognized by the IGV search bar. &#10;
              For example: DMD, ENST00000589830, chr1:55516888, 2:152341851-152591002"
          >
          </Form.Field>
        </Form>
        <br />
        <b><i>NOTE:</i></b> This locus list will be saved across page refreshes in this browser, &nbsp;
        but will not be recorded in the page url like other settings.&nbsp;
        Sharing or bookmarking this page won&apos;t include the contents of this list.
      </Modal>)
  }
}

EditLocusListButtonAndModal.propTypes = {
  name: PropTypes.string,
  locusList: PropTypes.array,
  setLocusList: PropTypes.func,
}

export const EditLocusList = ({ name, locusList, setLocus, setLocusList }) => (
  <div>
    {
      locusList.map((locus, i) => <div key={locus}>{i + 1}. &nbsp; <LinkButton onClick={() => { setLocus(locus) }}>{locus}</LinkButton></div>)
    }
    <EditLocusListButtonAndModal name={name} locusList={locusList} setLocusList={setLocusList} />
  </div>)


EditLocusList.propTypes = {
  name: PropTypes.string,
  locusList: PropTypes.array,
  setLocus: PropTypes.func,
  setLocusList: PropTypes.func,
}
