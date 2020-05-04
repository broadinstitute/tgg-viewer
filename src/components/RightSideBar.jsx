import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import EditLocusList from './EditLocusList'
import BamOptionsPanel from './optionsPanels/BamOptionsPanel'
import VcfOptionsPanel from './optionsPanels/VcfOptionsPanel'
import SpliceJunctionsOptionsPanel from './optionsPanels/SpliceJunctionsOptionsPanel'
import GcnvOptionsPanel from './optionsPanels/GcnvOptionsPanel'

import {
  getRightSideBarLocusList,
  getEnabledDataTypes,
} from '../redux/selectors'

class RightSideBar extends React.PureComponent
{
  render() {
    const {
      locusList,
      enabledDataTypes,
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

        {enabledDataTypes.includes('alignment') && <BamOptionsPanel />}
        {enabledDataTypes.includes('vcf') && <VcfOptionsPanel />}
        {(enabledDataTypes.includes('coverage') || enabledDataTypes.includes('junctions')) && <SpliceJunctionsOptionsPanel />}
        {enabledDataTypes.includes('gcnv_bed') && <GcnvOptionsPanel />}
      </div>)
  }
}

RightSideBar.propTypes = {
  locusList: PropTypes.array,
  enabledDataTypes: PropTypes.array,
  setLocus: PropTypes.func,
  setLocusList: PropTypes.func,
}

const mapStateToProps = (state) => ({
  locusList: getRightSideBarLocusList(state),
  enabledDataTypes: getEnabledDataTypes(state),
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
})

export default connect(mapStateToProps, mapDispatchToProps)(RightSideBar)
