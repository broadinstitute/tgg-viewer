import React from 'react'
import PropTypes from 'prop-types'
import { getUser } from '../redux/selectors'
import { connect } from 'react-redux'


class UserInfo extends React.Component
{
  static propTypes = {
    user: PropTypes.object.isRequired,
  }

  render() {
    if (!this.props.user.googleUserEmail) {
      return <div>Signing in to Google Buckets...</div>
    }

    return <div>Signed in to Google Buckets as <b>{this.props.user.googleUserEmail}</b></div>
  }
}

const mapStateToProps = state => ({
  user: getUser(state),

})

export { UserInfo as UserInfoComponent }

export default connect(mapStateToProps)(UserInfo)
