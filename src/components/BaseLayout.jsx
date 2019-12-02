import React from 'react'
import styled from "styled-components"
import { Grid } from 'semantic-ui-react'
import LeftSideBar from './LeftSideBar'
import RightSideBar from './RightSideBar'
import IGV from './IGV'
import GoogleAuth from './GoogleAuth'

const StyledDiv = styled.div`
  padding: 10px 20px
`

export default () => (
  <StyledDiv>
    <Grid>
      <Grid.Row>
        <Grid.Column width={2}>
          <LeftSideBar />
        </Grid.Column>
        <Grid.Column width={12}>
          <IGV />
          <GoogleAuth />
        </Grid.Column>
        <Grid.Column width={2}>
          <RightSideBar />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </StyledDiv>
)
