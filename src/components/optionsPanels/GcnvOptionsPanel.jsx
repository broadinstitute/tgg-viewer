/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
//import styled from 'styled-components'
import { CategoryH3, OptionDiv } from '../SideBarUtils'
import { getGcnvOptions } from '../../redux/selectors'

const GcnvOptionsPanel = ({ gcnvOptions, updateGcnvOptions }) => {

  console.log(gcnvOptions, updateGcnvOptions || 1)
  return (
    <div>
      <CategoryH3>GCNV OPTIONS</CategoryH3><br />
      <OptionDiv>
        Highlighted samples: &nbsp;
      </OptionDiv>
    </div>)
}

GcnvOptionsPanel.propTypes = {
  gcnvOptions: PropTypes.object,
  updateGcnvOptions: PropTypes.func,
}


const mapStateToProps = (state) => ({
  gcnvOptions: getGcnvOptions(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateGcnvOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_VCF_OPTIONS',
      updates: newSettings,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(GcnvOptionsPanel)
