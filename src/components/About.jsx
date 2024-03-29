/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-trailing-spaces */

import React from 'react'
import styled from 'styled-components'
import { Icon } from 'semantic-ui-react'
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
    The Translational Genomics Group (TGG) Viewer is a free, open-source web app for visualizing splice junctions, copy number, and other data
    genome-wide using <a href="https://github.com/igvteam/igv.js" target="_blank">IGV.js</a><br />
    <br />
    <b>Updates:</b><br />
    <br />
    <i>9/5/2023</i> - fixed: genomic location no longer resets when a new track is added<br />
    <br />
    <b>Main features:</b><br />
    <ul>
      <li>Supports most file formats supported by IGV.js, including: .bed, .vcf, .bam, .cram, .bigWig, as well as
        several custom formats for splice junctions (.junctions.bed.gz) and gCNV copy-number variants (.gcnv.bed.gz) </li>
      <li>Includes custom reference tracks such as splice junctions from GTEx v8 muscle, blood, and fibroblast samples.</li>
      <li>Supports adding gene or locus lists to left or right side bar for quick navigation across a list of regions.</li>
      <li>Can load data files or reference tracks from any Google bucket to which you have read-access.</li>
      <li>Retrieves just the on-screen sections of the files directly from Google buckets.</li>
      <li>All settings, gene lists, and data paths can be exported and later restored or shared with others via a .json config file.
        To export all current settings, click the <Icon name="download" /> button, upload the .json file to github (or another public url), and then
        to restore the settings, paste the file's URL into the Initial Settings input, and Apply. </li>
      <li>The page url also records page settings so that they can be bookmarked or shared, but does not include gene lists.</li>
    </ul>

    <a href="https://github.com/broadinstitute/tgg-viewer/issues" target="_blank">Issues</a>
    &nbsp;or <a href="https://github.com/broadinstitute/tgg-viewer/issues" target="_blank">Feature Requests</a>
    &nbsp;can be submitted via <a href="https://github.com/broadinstitute/tgg-viewer" target="_blank">GitHub</a>.
  </Modal>
)

export default AboutLink
