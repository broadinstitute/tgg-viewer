/* eslint-disable react/jsx-one-expression-per-line */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getUser } from '../redux/selectors'


class UserInfo extends React.PureComponent
{
  render() {

    const {
      user,
    } = this.props

    if (!user.googleUserEmail) {
      return <div>Signing in to Google Buckets...</div>
    }

    return <div>Signed in to Google Buckets as <b>{user.googleUserEmail}</b></div>
  }
}

UserInfo.propTypes = {
  user: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  user: getUser(state),

})

export default connect(mapStateToProps)(UserInfo)
