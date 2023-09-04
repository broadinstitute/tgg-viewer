/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-multiple-empty-lines */

import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Popup } from 'semantic-ui-react'


class RequestStatus extends React.PureComponent {

  static NONE = 'NONE'

  static IN_PROGRESS = 'IN_PROGRESS'

  static SUCCEEDED = 'SUCCEEDED'

  static ERROR = 'ERROR'

  render() {
    switch (this.props.status) {
      case RequestStatus.IN_PROGRESS:
        return <Icon loading name="spinner" style={{ color: '#4183c4' }} />
      case RequestStatus.SUCCEEDED:
        return <Popup
          trigger={
            <Icon name="check circle" style={{ color: '#00C000' }} />
          }
          content={this.props.successMessage || 'Success'}
          position="top center"
          size="small"
        />
      case RequestStatus.ERROR:
        return <Popup
          trigger={
            <Icon name="warning circle" style={{ color: '#F00000' }} />
          }
          content={this.props.errorMessage || ''}
          position="top center"
          size="small"
        />
      default:
        return <Icon name="warning circle" style={{ color: 'rgb(0,0,0,0.0)' }} />
    }
  }
}

RequestStatus.propTypes = {
  status: PropTypes.string,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
}

export default RequestStatus
