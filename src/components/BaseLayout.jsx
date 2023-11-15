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
      isLeftSideBarVisible,
      isRightSideBarVisible,
    } = this.props

    const nSideBars = (isLeftSideBarVisible ? 1 : 0) + (isRightSideBarVisible ? 1 : 0)

    return (
      <StyledDiv>
        <Grid>
          <Grid.Row>
            {isLeftSideBarVisible ? <LeftSideBarColumn><LeftSideBar /></LeftSideBarColumn> : null}
            <Grid.Column style={{ minWidth: `calc(99% - ${nSideBars * SIDE_BAR_WIDTH + 5}px)`, zIndex: 1 }}>
              <Header />
              <LoginAndShowIGV />
              <InitialSettingsForm />
            </Grid.Column>
            {isRightSideBarVisible ? <RightSideBarColumn><RightSideBar /></RightSideBarColumn> : null}
          </Grid.Row>
        </Grid>
      </StyledDiv>
    )
  }
}

BaseLayout.propTypes = {
  isLeftSideBarVisible: PropTypes.bool,
  isRightSideBarVisible: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  isLeftSideBarVisible: getIsLeftSideBarVisible(state),
  isRightSideBarVisible: getIsRightSideBarVisible(state),
})

export default connect(mapStateToProps)(BaseLayout)
