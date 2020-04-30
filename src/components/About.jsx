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
    title="About TGG Viewer"
    size="large"
    modalName="AboutModal"
    trigger={<LinkButton>About</LinkButton>}
  >
    This is a free, open-source web app for visualizing splice junctions, expression, and other sequencing data
    genome-wide using <a href="https://github.com/igvteam/igv.js" target="_blank">IGV.js</a><br />
    <br />
    Main features: <br />
    <ul>
      <li>Supports all file formats supported by IGV.js, including: .bed, .vcf, .bam, .cram, .bigWig, as well as
      several custom formats for splice junctions (.junctions.bed.gz) and gCNV copy-number variants (.gcnv.bed) </li>
      <li>Includes reference tracks such as splice junctions from GTEx v8 muscle, blood, and fibroblast samples.</li>
      <li>Loads data files or reference tracks from any Google bucket to which you have read-access.</li>
      <li>Retrieves just the on-screen sections of the files directly from Google buckets.</li>
      <li>Allows gene or locus lists to be added to side bars for quick navigation across a list of regions.</li>
      <li>Fully customizable via .json config file - for example: TODO.</li>
    </ul>

    <a href="https://github.com/macarthur-lab/rnaseq-viewer/issues" target="_blank">Issues</a>
    &nbsp;or <a href="https://github.com/macarthur-lab/rnaseq-viewer/issues" target="_blank">Feature Requests</a>
    &nbsp;can be submitted via <a href="https://github.com/macarthur-lab/rnaseq-viewer" target="_blank">GitHub</a>.
  </Modal>
)

export default AboutLink
