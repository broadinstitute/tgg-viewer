import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { SashimiPlot } from 'shared/components/sashimi/SashimiPlot'
import { sortBy } from 'lodash'

class CenterPanel extends React.Component
{
  static propTypes = {
    samplesInfo: PropTypes.object,
    selectedSampleNames: PropTypes.array,
  }

  render = () =>
    <div>
      {
        Object.entries(this.props.samplesInfo).map(
          ([categoryName, samples]) =>
            <div key={categoryName}>
              {
                sortBy(Object.values(samples).filter(s => this.props.selectedSampleNames.includes(s.name)), ['order', 'label']).map(
                  sample =>
                    <SashimiPlot
                      key={sample.name}
                      title={sample.name}
                      width={1200}
                      height={300}
                      coverageColor="#001DAF"
                      coverageData={coverageData}
                      junctionData={junctionData}
                      info={sample}
                    />,
                )
              }
            </div>,
        )
      }
    </div>
}

const mapStateToProps = state => ({
  samplesInfo: state.samplesInfo,
  selectedSampleNames: state.selectedSampleNames,
})

export { CenterPanel as CenterPanelComponent }

export default connect(mapStateToProps)(CenterPanel)
