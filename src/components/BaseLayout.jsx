import React from 'react'
import styled from 'styled-components'
import { Grid } from 'semantic-ui-react'
import LeftSideBar from './LeftSideBar'
import RightSideBar from './RightSideBar'
import Header from './Header'
import IGV from './IGV'
import InitialSettingsForm from './InitialSettingsForm'

const StyledDiv = styled.div`
  padding: 10px 20px;
`

const SIDE_BAR_WIDTH = 210

const SideBarColumn = styled(Grid.Column)`
  min-width: ${SIDE_BAR_WIDTH}px !important;
`

const MiddleColumn = styled(Grid.Column)`
  min-width: calc(99% - ${2 * SIDE_BAR_WIDTH + 5}px) !important;
`

export default () => (
  <StyledDiv>
    <Grid>
      <Grid.Row>
        <SideBarColumn><LeftSideBar /></SideBarColumn>
        <MiddleColumn>
          <Header />
          <IGV />
          <InitialSettingsForm />
        </MiddleColumn>
        <SideBarColumn><RightSideBar /></SideBarColumn>
      </Grid.Row>
    </Grid>
  </StyledDiv>
)
