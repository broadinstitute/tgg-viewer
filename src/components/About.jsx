/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable  react/jsx-closing-tag-location */

import React from 'react'
import styled from 'styled-components'
import Modal from './Modal'

const LinkButton = styled.a`
  cursor: pointer;
  margin-left: 20px;
`

const AboutLink = () => (
  <Modal
    title="About the Translational Genomics Group Viewer"
    size="large"
    modalName="AboutModal"
    trigger={<LinkButton>About</LinkButton>}
  >
    The Translational Genomics Group Viewer is a free, open-source web app for visualizing splice junctions, expression, and other sequencing data
    genome-wide using <a href="https://github.com/igvteam/igv.js" target="_blank">IGV.js</a><br />
    <br />
    Main features: <br />
    <ul>
      <li>Supports most file formats supported by IGV.js, including: .bed, .vcf, .bam, .cram, .bigWig, as well as
        several custom formats for splice junctions (.junctions.bed.gz) and gCNV copy-number variants (.gcnv.bed) </li>
      <li>Includes reference tracks such as splice junctions from GTEx v8 muscle, blood, and fibroblast samples.</li>
      <li>Can load data files or reference tracks from any Google bucket to which you have read-access.</li>
      <li>Reads just the on-screen sections of the files directly from Google buckets.</li>
      <li>Supports adding gene or locus lists to left or right side bar for quick navigation across a list of regions.</li>
      <li>All settings and data paths can be customized and shared via .json config files.</li>
    </ul>

    <a href="https://github.com/broadinstitute/tgg-viewer/issues" target="_blank">Issues</a>
    &nbsp;or <a href="https://github.com/broadinstitute/tgg-viewer/issues" target="_blank">Feature Requests</a>
    &nbsp;can be submitted via <a href="https://github.com/broadinstitute/tgg-viewer" target="_blank">GitHub</a>.
  </Modal>
)

export default AboutLink
