/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-optimization */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { GoogleLogin } from 'react-google-login'
import { getGoogleUserEmail, googleSignIn, initGoogleClient } from '../utils/googleAuth'
import IGV from './IGV'

const SignInButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 50px;
`

class LoginAndShowIGV extends React.Component {

  constructor(props) {
    super(props)

    this.state = {}
  }

  handleGoogleSignIn = (user) => {
    const profile = user && user.getBasicProfile()
    const googleUserEmail = profile && profile.getEmail()

    this.setState({ show: googleUserEmail ? 'igv' : 'signin-button' })
    this.props.userChangedHandler(googleUserEmail)
  }

  async componentDidMount() {

    // TODO check if any tracks need google sign-in
    try {
      await initGoogleClient()
      await googleSignIn()
    } catch (e) {
      console.error('Error during google sign-in:', e)
      this.setState({ show: 'signin-button' })
      return
    }
    const googleUserEmail = await getGoogleUserEmail()

    this.setState({ show: googleUserEmail ? 'igv' : 'signin-button' })
    this.props.userChangedHandler(googleUserEmail)
  }

  render = () => {
    if (this.state.show === 'igv') {
      return <IGV />
    }

    if (this.state.show === 'signin-button') {
      //https://developers.google.com/identity/sign-in/web/sign-in
      //https://developers.google.com/identity/sign-in/web/build-button
      return (
        <SignInButtonContainer>
          <GoogleLogin
            clientId={window.TGG_VIEWER_CLIENT_ID}
            theme="dark"
            buttonText="Sign In to Google"
            onSuccess={this.handleGoogleSignIn}
            onFailure={this.handleGoogleSignIn}
            cookiePolicy="single_host_origin"
          />
        </SignInButtonContainer>)
    }

    return null
  }
}

LoginAndShowIGV.propTypes = {
  userChangedHandler: PropTypes.func,
}


const mapDispatchToProps = (dispatch) => ({
  userChangedHandler: (googleUserEmail) => {
    dispatch({
      type: 'UPDATE_USER',
      updates: { googleUserEmail },
    })
  },
})


export default connect(null, mapDispatchToProps)(LoginAndShowIGV)
