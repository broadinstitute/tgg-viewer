/* eslint-disable react/destructuring-assignment */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Button, Modal, Icon } from 'semantic-ui-react'

import { getModalOpen, openModal, closeModal } from '../redux/utils/modalReducer'

export const ButtonLink = styled(Button).attrs({ basic: true })`
  &.ui.button.basic {
    white-space: nowrap;
    border: none;
    padding: ${(props) => props.padding || 0};
    color: ${(props) => props.color || '#4183C4'} !important;
    text-decoration: none;
    font-weight: ${(props) => props.fontWeight || 'inherit'};
    box-shadow: none !important;
    user-select: auto;
    
    &:hover, &:focus, &:active {
      color: #1e70bf !important;
      background: transparent !important;
    }
    
    &[class*="right labeled"].icon {
      padding-left: 0 !important;
      padding-right: 2.1em !important;
      
      > .icon {
        background-color: initial;
      }
    }
  }
`

const ContainerDiv = styled.div`
  float: right;
  padding: 0px 20px 20px 20px;
`

const StyledButton = styled(Button)`
  margin-left: 10px !important;
  width: 100px;
`


class CustomModal extends React.PureComponent
{
  handleClose = () => {
    let doClose = true
    if (this.props.handleClose) {
      doClose = this.props.handleClose()
    }
    if (doClose) {
      this.props.close()
    }
  }

  handleSave = () => {
    let doClose = true
    if (this.props.handleSave) {
      doClose = this.props.handleSave()
    }
    if (doClose) {
      this.props.close()
    }
  }

  render() {
    const trigger = this.props.trigger ? React.cloneElement(this.props.trigger, { onClick: this.props.open }) : null
    return (
      <Modal open={this.props.isOpen} trigger={trigger} onClose={this.handleClose} size={this.props.size}>
        <Modal.Header>
          {this.props.title}
          <ButtonLink floated="right" onClick={this.handleClose} icon={<Icon name="remove" color="grey" />} />
        </Modal.Header>
        <Modal.Content>
          {this.props.children}
        </Modal.Content>
        <ContainerDiv>
          <StyledButton tabIndex={0} onClick={this.handleClose} type="button">Cancel</StyledButton>
          <StyledButton tabIndex={0} onClick={this.handleSave} type="submit" color="blue">Save</StyledButton>
        </ContainerDiv>
      </Modal>
    )
  }
}

CustomModal.defaultProps = {
  size: 'small',
}

CustomModal.propTypes = {
  trigger: PropTypes.node,
  title: PropTypes.string,
  handleSave: PropTypes.func,
  handleClose: PropTypes.func,
  size: PropTypes.oneOf(['small', 'large', 'fullscreen']),
  isOpen: PropTypes.bool,
  open: PropTypes.func,
  close: PropTypes.func,
  children: PropTypes.node,
}


const mapStateToProps = (state, ownProps) => ({
  isOpen: getModalOpen(state, ownProps.modalName),
})

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    open: (e) => {
      e.preventDefault()
      dispatch(openModal(ownProps.modalName))
    },
    close: () => {
      dispatch(closeModal(ownProps.modalName, true))
    },
  }
}

export { CustomModal as ModalComponent }

export default connect(mapStateToProps, mapDispatchToProps)(CustomModal)
