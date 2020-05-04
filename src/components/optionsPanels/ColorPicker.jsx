/* eslint-disable react/require-optimization */
/* eslint-disable react/destructuring-assignment */

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { SwatchesPicker } from 'react-color'
import { Popup } from 'semantic-ui-react'

const ColorSwatchBorder = styled.div`
  display: inline-block;
  cursor: pointer;
  border-radius: 2px;
  padding: 1px 2px;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,.1);
`

const ColorSwatch = styled.div`
  display: inline-block;
  cursor: pointer;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.1);
  width: 10px;
  height: 12px;
`

const StyledPopup = styled(Popup).attrs({ flowing: true })`
  padding: 0px !important;
  div {
    overflow-y: visible !important;
  }
`

/*
const ApplyButton = styled(Button)`
  margin-top: 15px !important;
`
<div style={{ textAlign: 'center' }}><ApplyButton onClick={() => this.handleApply(this.state.color)}>Apply</ApplyButton></div>
*/

class ColorPicker extends React.Component {

  constructor(props) {
    super(props)

    this.state = { color: this.props.color }
  }

  handleChange = (color) => {
    this.setState({ color })
  }

  handleApply = (color) => {
    this.props.colorChangedHandler(color.hex)
  }

  render() {
    return (
      <StyledPopup
        on="click"
        position="left center"
        trigger={
          <ColorSwatchBorder>
            <ColorSwatch style={{ background: this.state.color }} />
          </ColorSwatchBorder>
        }
        content={
          <SwatchesPicker
            color={this.state.color}
            onChangeComplete={this.handleApply}
            onChange={(newColor) => this.setState({ color: newColor })}
          />
        }
      />
    )
  }
}

ColorPicker.propTypes = {
  color: PropTypes.string.isRequired,
  colorChangedHandler: PropTypes.func.isRequired,
}

export default ColorPicker
