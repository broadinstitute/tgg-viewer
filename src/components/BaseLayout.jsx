import React from 'react'
import styled from 'styled-components'
import { Grid } from 'semantic-ui-react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import LeftSideBar from './LeftSideBar'
import RightSideBar from './RightSideBar'
import Header from './Header'
import LoginAndShowIGV from './LoginAndShowIGV'
import InitialSettingsForm from './InitialSettingsForm'
import {
  getIsLeftSideBarVisible, getIsRightSideBarVisible,
} from '../redux/selectors'

const StyledDiv = styled.div`
  padding: 10px 20px;
`

const SIDE_BAR_WIDTH = 210

const LeftSideBarColumn = styled(Grid.Column)`
  min-width: ${SIDE_BAR_WIDTH}px !important;
  z-index: 2;
`

const RightSideBarColumn = styled(Grid.Column)`
  min-width: ${SIDE_BAR_WIDTH}px !important;
  z-index: 0;
`

class BaseLayout extends React.PureComponent
{
  render()
  {

    const {
      showLeftSideBar,
      showRightSideBar,
    } = this.props

    const nSideBars = (showLeftSideBar ? 1 : 0) + (showRightSideBar ? 1 : 0)

    return (
      <StyledDiv>
        <Grid>
          <Grid.Row>
            {showLeftSideBar ? <LeftSideBarColumn><LeftSideBar /></LeftSideBarColumn> : null}
            <Grid.Column style={{ minWidth: `calc(99% - ${nSideBars * SIDE_BAR_WIDTH + 5}px)`, zIndex: 1 }}>
              <Header />
              <LoginAndShowIGV />
              <InitialSettingsForm />
            </Grid.Column>
            {showRightSideBar ? <RightSideBarColumn><RightSideBar /></RightSideBarColumn> : null}
          </Grid.Row>
        </Grid>
      </StyledDiv>
    )
  }
}

BaseLayout.propTypes = {
  showLeftSideBar: PropTypes.bool,
  showRightSideBar: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  showLeftSideBar: getIsLeftSideBarVisible(state),
  showRightSideBar: getIsRightSideBarVisible(state),
})

export default connect(mapStateToProps)(BaseLayout)
