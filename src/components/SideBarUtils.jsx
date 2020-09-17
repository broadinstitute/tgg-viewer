import styled from 'styled-components'
import { Icon, Popup } from 'semantic-ui-react'

export const CategoryH3 = styled.h3` 
  display: inline-block;
  margin: 12px 0px 0px 0px !important;
`

export const StyledPopup = styled(Popup)`
  opacity: 0.95;
`

export const ColorLegendIcon = styled(Icon)`
  margin-top: 5px !important;
`

export const OptionDiv = styled.div`
  padding-top: 3px;
  z-index: 100000;
`

export const OptionInputDiv = styled(OptionDiv)`
  margin: 10px 0px; 
`

export const OptionInput = styled.input`
  display: inline;
  width: 50px;
  margin-left: 5px;
  padding-left: 5px;
`
