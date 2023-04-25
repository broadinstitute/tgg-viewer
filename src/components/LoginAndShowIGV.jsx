/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/require-optimization */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable operator-linebreak */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { GoogleLogin } from 'react-google-login'
import IGV from './IGV'
import { getGoogleUserEmail, googleSignIn, initGoogleClient } from '../utils/googleAuth'
import { getInitialSettingsUrl, getRowsInCategories, getIsGoogleLoginRequired } from '../redux/selectors'

const SignInButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 50px;
`

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 50px;
  margin-left: 100px;
  word-wrap: break-word;
  word-break: break-all;
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

    if (!this.props.isGoogleLoginRequired) {
      this.setState({ show: 'igv' })
      return
    }

    try {
      await initGoogleClient()
    } catch (e) {
      console.error('Error during google sign-in init:', e)
      this.setState({ show: 'signin-button' })
      return
    }

    try {
      this.setState({ signInError: null })
      await googleSignIn()
    } catch (e) {
      console.error('Error during google sign-in:', e)
      if (e.details && e.details.search('Cookies are not enabled') >= 0) {
        this.setState({ signInError: 'cookies-disabled' })
      }

      this.setState({ show: 'signin-button' })
      return
    }
    const googleUserEmail = await getGoogleUserEmail()

    this.setState({ show: googleUserEmail ? 'igv' : 'signin-button' })
    this.props.userChangedHandler(googleUserEmail)
  }

  render = () => {
    if (this.state.show === 'igv') {
      console.log('Render <IGV />')
      return <IGV />
    }

    if (this.state.show === 'signin-button') {
      let dataPathCounter = 0
      const buckets = new Set()
      this.props.rowsInCategories.forEach((category) => {
        category.rows.forEach((row) => {
          if (row.data) {
            row.data.forEach((data) => {
              if (data.url && data.url.startsWith('gs://')) {
                dataPathCounter += 1

                const urlTokens = data.url.split('/')
                const bucket = urlTokens[2]
                if (bucket !== 'tgg-viewer') {
                  buckets.add(bucket)
                }
              }
            })
          }
        })
      })

      if (dataPathCounter === 0) {
        return <InfoContainer>No dataset paths loaded. &nbsp; Please specify an Initial settings url.</InfoContainer>
      }

      return (
        <div>
          <InfoContainer>
            <div>
              Retrieved {dataPathCounter} data paths from settings file: <a href={this.props.initialSettingsUrl} target="_blank">{this.props.initialSettingsUrl}</a><br />
              <br />
            </div>

            {
              buckets.size > 0 &&
              <div>
                To view this data, you should have read access to the following Google Storage buckets:
                <ul>
                  {
                    Array.from(buckets).map((bucket) => <li key={bucket}><a href={`https://console.cloud.google.com/storage/browser/${bucket}`} target="_blank">{bucket}</a></li>)
                  }
                </ul>
              </div>
            }
            {
              this.state.signInError === 'cookies-disabled' &&
              <div style={{ marginTop: '20px', color: 'red', textAlign: 'left' }}>

                <b>ERROR: Cookies are disabled</b><br />
                Please allow cookies to enable sign in with Google.
              </div>
            }
          </InfoContainer>

          <SignInButtonContainer>
            <GoogleLogin
              clientId={window.TGG_VIEWER_CLIENT_ID}
              theme="dark"
              buttonText="Sign in with Google"
              disabled={this.state.signInError}
              onSuccess={this.handleGoogleSignIn}
              onFailure={this.handleGoogleSignIn}
              cookiePolicy="single_host_origin"
            />
          </SignInButtonContainer>
        </div>)

    }

    return null
  }
}

LoginAndShowIGV.propTypes = {
  isGoogleLoginRequired: PropTypes.bool,
  rowsInCategories: PropTypes.array,
  initialSettingsUrl: PropTypes.string,
  userChangedHandler: PropTypes.func,
}

const mapStateToProps = (state) => ({
  isGoogleLoginRequired: getIsGoogleLoginRequired(state),
  rowsInCategories: getRowsInCategories(state),
  initialSettingsUrl: getInitialSettingsUrl(state),
})

const mapDispatchToProps = (dispatch) => ({
  userChangedHandler: (googleUserEmail) => {
    dispatch({
      type: 'UPDATE_USER',
      updates: { googleUserEmail },
    })
  },
})


export default connect(mapStateToProps, mapDispatchToProps)(LoginAndShowIGV)
