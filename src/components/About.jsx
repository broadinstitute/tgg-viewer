/* eslint-disable react/jsx-one-expression-per-line */

import React from 'react'
import styled from 'styled-components'
//import { Form, TextArea } from 'semantic-ui-react'
import Modal from './Modal'

const LinkButton = styled.a`
  cursor: pointer;
  margin-left: 20px;
`

const AboutLink = () => (
  <Modal
    title="About RNA-Seq Viewer"
    size="large"
    modalName="AboutModal"
    trigger={<LinkButton>About</LinkButton>}
  >
    <a href="https://github.com/macarthur-lab/rnaseq-viewer/issues" target="_blank">Issues</a>
    &nbsp;or <a href="https://github.com/macarthur-lab/rnaseq-viewer/issues" target="_blank">Feature Requests</a>
    &nbsp;can be submitted via <a href="https://github.com/macarthur-lab/rnaseq-viewer" target="_blank">GitHub</a>.
  </Modal>
)

export default AboutLink
