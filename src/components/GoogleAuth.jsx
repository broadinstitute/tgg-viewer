import React from 'react'
import styled from "styled-components"
import { getGoogleUserEmail, googleSignIn, initGoogleClient } from "../utils/googleAuth"

const StyledDiv = styled.div`
  text-align: right;
  margin: 20px 70px 0px 0px;
  color: #999;
`

class GoogleAuth extends React.Component
{
  constructor(props) {
    super(props)

    this.state = {}
  }

  async componentDidMount() {

    await initGoogleClient()
    await googleSignIn()
    this.googleUserEmail = await getGoogleUserEmail()
    this.setState({googleUserEmail: this.googleUserEmail})
  }

  render() {
    if (!this.state.googleUserEmail) {
      return <StyledDiv />
    }

    return <StyledDiv>Signed in to Google Buckets as <b>{this.state.googleUserEmail}</b></StyledDiv>
  }
}

export { GoogleAuth as GoogleAuthComponent }

export default GoogleAuth
