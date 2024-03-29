/* eslint-disable react/jsx-one-expression-per-line */

import React from 'react'
import styled from 'styled-components'
import { Grid } from 'semantic-ui-react'
import AboutLink from './About'
import UserInfo from './UserInfo'

const HeaderRow = styled(Grid.Row)`
  color: #444;
  margin-bottom: 5px;
`

const Column1 = styled(Grid.Column).attrs({ width: 6 })`
  text-align: left;
  padding-left: 75px !important;
`
const Column2 = styled(Grid.Column).attrs({ width: 10 })`
  text-align: right;
  padding-right: 75px !important;
`

export default () => (
  <Grid>
    <HeaderRow>
      <Column1>
        <b>TGG Viewer </b> version <i> 9/5/2023</i>
        <AboutLink />

        {/* <a href="#">Intro Video</a> &nbsp; &nbsp; */}
      </Column1>
      <Column2>
        <UserInfo />
      </Column2>
    </HeaderRow>
  </Grid>)
