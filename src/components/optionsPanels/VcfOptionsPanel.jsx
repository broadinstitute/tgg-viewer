/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CategoryH3, OptionDiv } from '../SideBarUtils'
import { getVcfOptions } from '../../redux/selectors'

const VcfOptionsPanel = ({ vcfOptions, updateVcfOptions }) => {
  return (
    <div>
      <CategoryH3>VCF TRACK <br />OPTIONS</CategoryH3><br />
      <OptionDiv>
        Display mode: &nbsp;
        <select value={vcfOptions.displayMode} onChange={(e) => updateVcfOptions({ displayMode: e.target.value })}>
          <option value="COLLAPSED">Collapse</option>
          <option value="SQUISHED">Squish</option>
          <option value="EXPANDED">Expand</option>
        </select>
      </OptionDiv>
    </div>)
}

VcfOptionsPanel.propTypes = {
  vcfOptions: PropTypes.object,
  updateVcfOptions: PropTypes.func,
}

const mapStateToProps = (state) => ({
  vcfOptions: getVcfOptions(state),
})

const mapDispatchToProps = (dispatch) => ({
  updateVcfOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_VCF_OPTIONS',
      updates: newSettings,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(VcfOptionsPanel)
