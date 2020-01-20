/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/no-unescaped-entities */

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
    This RNA-seq viewer is a free, open-source web tool for visualizing splice junctions, expression, and other
    sequencing data in an interactive genome-wide interface similar to <a href="https://software.broadinstitute.org/software/igv/" target="_blank">IGV</a>. It's main features are: <br />
    <ul>
      <li>
        Easy to add and view your own samples and reference tracks (including .bed, .junctions.bed.gz, .bigWig, .vcf, and .bam/.cram).
        This can be done by putting your files in a Google bucket, logging in to your Google account when first prompted by RNA-seq viewer, and
        then using the 'Add Paths' or 'Initial settings' to specify your file locations (gs:// paths)
      </li>
      <li>Provides reference data tracks relevant to RNA-seq analysis</li>
      <li>Custom locus or gene lists let you quickly look through multiple loci</li>
    </ul>

    <a href="https://github.com/macarthur-lab/rnaseq-viewer/issues" target="_blank">Issues</a>
    &nbsp;or <a href="https://github.com/macarthur-lab/rnaseq-viewer/issues" target="_blank">Feature Requests</a>
    &nbsp;can be submitted via <a href="https://github.com/macarthur-lab/rnaseq-viewer" target="_blank">GitHub</a>.
  </Modal>
)

export default AboutLink
