import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { EditLocusList } from './EditLocusList'
import { BamOptionsPanel } from './optionsPanels/BamOptionsPanel'
import { SpliceJunctionsOptionsPanel } from './optionsPanels/SpliceJunctionsOptionsPanel'
import { VcfOptionsPanel } from './optionsPanels/VcfOptionsPanel'
//import { GvcfOptionsPanel } from './optionsPanels/GvcfOptionsPanel'

import {
  getRightSideBarLocusList,
  getEnabledDataTypes,
  getSjOptions,
  getVcfOptions,
  getBamOptions,
} from '../redux/selectors'

class RightSideBar extends React.PureComponent
{
  render() {
    const {
      locusList,
      enabledDataTypes,
      sjOptions,
      vcfOptions,
      bamOptions,
      updateSjOptions,
      updateVcfOptions,
      updateBamOptions,
      setLocus,
      setLocusList,
    } = this.props

    return (
      <div>
        <EditLocusList
          name="Right Side Bar"
          locusList={locusList}
          setLocus={setLocus}
          setLocusList={setLocusList}
        />

        {enabledDataTypes.includes('alignment') && <BamOptionsPanel
          bamOptions={bamOptions}
          updateBamOptions={updateBamOptions}
        />}
        {enabledDataTypes.includes('vcf') && <VcfOptionsPanel
          vcfOptions={vcfOptions}
          updateVcfOptions={updateVcfOptions}
        />}
        {(enabledDataTypes.includes('coverage') || enabledDataTypes.includes('junctions')) && <SpliceJunctionsOptionsPanel
          sjOptions={sjOptions}
          updateSjOptions={updateSjOptions}
        />}
      </div>)
  }
}

RightSideBar.propTypes = {
  locusList: PropTypes.array,
  enabledDataTypes: PropTypes.array,
  sjOptions: PropTypes.object,
  vcfOptions: PropTypes.object,
  bamOptions: PropTypes.object,
  setLocus: PropTypes.func,
  setLocusList: PropTypes.func,
  updateSjOptions: PropTypes.func,
  updateVcfOptions: PropTypes.func,
  updateBamOptions: PropTypes.func,
}

const mapStateToProps = (state) => ({
  locusList: getRightSideBarLocusList(state),
  enabledDataTypes: getEnabledDataTypes(state),
  sjOptions: getSjOptions(state),
  vcfOptions: getVcfOptions(state),
  bamOptions: getBamOptions(state),
})

const mapDispatchToProps = (dispatch) => ({
  setLocus: (locus) => {
    dispatch({
      type: 'UPDATE_LOCUS',
      newValue: locus,
    })
  },
  setLocusList: (locusList) => {
    dispatch({
      type: 'SET_RIGHT_SIDE_BAR_LOCUS_LIST',
      values: locusList,
    })
  },
  updateSjOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_SJ_OPTIONS',
      updates: newSettings,
    })
  },
  updateBamOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_BAM_OPTIONS',
      updates: newSettings,
    })
  },
  updateVcfOptions: (newSettings) => {
    dispatch({
      type: 'UPDATE_VCF_OPTIONS',
      updates: newSettings,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(RightSideBar)
