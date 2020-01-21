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
    title="About RNA-Seq Viewer"
    size="large"
    modalName="AboutModal"
    trigger={<LinkButton>About</LinkButton>}
  >
    This is a free, open-source web app for looking at splice junctions, expression, and other
    sequencing data in a genome-wide interactive interface. It's built around <a href="https://github.com/igvteam/igv.js" target="_blank">IGV.js</a><br />
    <br />
    Main features: <br />
    <ul>
      <li>View your own samples or reference tracks as long as the files are in a Google bucket you have read-access to.</li>
      <li>IGV.js reads just the on-screen sections of the files directly from the Google buckets.</li>
      <li>View tracks in any format supported by IGV.js including: .bigWig, .vcf, .bam, .cram, .gtf, .bed, and .junctions.bed.gz.</li>
      <li>Includes reference tracks from GTEx v8 muscle, blood, and fibroblast samples which show splice junctions and expression levels for comparison.</li>
      <li>Upload locus or gene lists to quickly navigate to these loci.</li>
    </ul>

    <a href="https://github.com/macarthur-lab/rnaseq-viewer/issues" target="_blank">Issues</a>
    &nbsp;or <a href="https://github.com/macarthur-lab/rnaseq-viewer/issues" target="_blank">Feature Requests</a>
    &nbsp;can be submitted via <a href="https://github.com/macarthur-lab/rnaseq-viewer" target="_blank">GitHub</a>.
  </Modal>
)

export default AboutLink
