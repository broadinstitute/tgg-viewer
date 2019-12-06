import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { getUser } from '../redux/selectors'
import { connect } from 'react-redux'

const StyledDiv = styled.div`
  text-align: right;
  margin: 70px 70px 0px 0px;
  color: #999;
`

class UserInfo extends React.Component
{
  static propTypes = {
    user: PropTypes.object.isRequired,
  }

  render() {
    if (!this.props.user.googleUserEmail) {
      return <StyledDiv />
    }

    return <StyledDiv>Signed in to Google Buckets as <b>{this.props.user.googleUserEmail}</b></StyledDiv>
  }
}

const mapStateToProps = state => ({
  user: getUser(state),

})

export { UserInfo as UserInfoComponent }

export default connect(mapStateToProps)(UserInfo)
