/* eslint-disable no-shadow */
import PropTypes from 'prop-types'
import React from 'react'
import R from 'ramda'

import { area, line, curveBasis } from 'd3-shape'
import { range } from 'd3-array'
import { path } from 'd3-path'
import { scaleLinear } from 'd3-scale'


export const SashimiPlot = ({
  title,
  width,
  height,
  coverageColor,
  coverageData,
  junctionData,
  info,
}) => {

  console.log(info)

  const x0Pixel = 60
  const y0Pixel = height - 30

  const numCoverageTicks = 10
  const numPosTicks = 7

  const startPos = Math.min(...coverageData.map(r => r[0]))
  const endPos = Math.max(...coverageData.map(r => r[1]))
  const maxCoverage = Math.max(...coverageData.map(r => r[2]))

  const xScale = scaleLinear()
    .domain([startPos, endPos])
    .range([x0Pixel, width])
  const posToPixel = xScale
  const posAxisStep = (Math.ceil((endPos - startPos) / 10) * 10) / numPosTicks

  const yScale = scaleLinear()
    .domain([0, maxCoverage])
    .range([y0Pixel, 0])
  const coverageToPixel = yScale
  const coverageAxisStep = (Math.ceil(maxCoverage / 10) * 10) / numCoverageTicks

  const generateCoverageGraphics = () => {
    const coverageCurvePoints = coverageData.map(r => [[r[0], r[2]], [r[1], r[2]]]).flat()

    const coverageCurve = area().curve(curveBasis)
      .x(p => xScale(p[0]))
      .y0(y0Pixel)
      .y1(p => yScale(p[1]))(coverageCurvePoints)

    return <path fill={coverageColor} d={coverageCurve} />
  }

  const generateJunctionGraphics = () => {
    const generateJunctionCurveAndLabel = (junction, i, n, maxJunctionReads) => {
      const jWidth = junction[1] - junction[0]
      const xPixelStart = xScale(junction[0])
      const xPixel1 = xScale(junction[0] + (0.3 * jWidth))
      const xPixelMid = xScale(junction[0] + (0.5 * jWidth))
      const xPixel2 = xScale(junction[0] + (0.7 * jWidth))
      const xPixelEnd = xScale(junction[1])

      const yPixel = y0Pixel * ((i + 1) / (n + 1))

      const readCount = junction[2]
      const normReadCount = maxJunctionReads > 1000 ? readCount * (1000 / maxJunctionReads) : readCount
      const strokeWidth = (Math.log(normReadCount + 1) / Math.log(5)) + 0.5

      //console.log(yPixel, i, n, junction)
      const points = [
        [xPixelStart, y0Pixel - 2],
        [xPixel1, yPixel],
        [xPixel2, yPixel],
        [xPixelEnd, y0Pixel - 2],
      ]

      const junctionCurve = line()
        .x(p => p[0])
        .y(p => p[1])
        .curve(curveBasis)(points) //curveCatmullRom.alpha(1)

      //<rect x={xPixelMid - 20} y={yPixel - 25} width={20*2} height={10*2} strokeWidth={1} stroke="white" fill="#FFFFFFCC" />
      return [
        <g key={junction}>
          {/* white background curve adds a barely-visible outlines to the blue curve and makes it possible to see where
          the curve ends even when it's within same-color coverage blocks */}
          <path stroke="white" strokeWidth={strokeWidth + 0.25} fill="none" d={junctionCurve} />
          <path stroke={coverageColor} strokeWidth={strokeWidth} fill="none" d={junctionCurve} />
        </g>,
        <g key={junction}>
          <circle cx={xPixelMid} cy={yPixel - 7} r={15} strokeWidth={1} stroke="none" fill="#FFFFFFCC" />
          <text x={xPixelMid} y={yPixel - 2} style={{ textAnchor: 'middle' }}>{junction[2]}</text>
        </g>,
      ]
    }

    const maxJunctionReads = Math.max(...junctionData.map(junction => junction[2]))
    const sortByJunctionSize = R.sortBy(junction => -1 * (junction[1] - junction[0]))
    const junctionGraphics = sortByJunctionSize(junctionData).map((junction, i) =>
      generateJunctionCurveAndLabel(junction, i, junctionData.length, maxJunctionReads))

    const curves = junctionGraphics.map(g => g[0])
    const labels = junctionGraphics.map(g => g[1])

    return [curves, labels]
  }


  //const [min, max] = xScale.range()
  return (
    <svg width={width} height={height}>

      {/* draw y-axis */}
      <text
        styles={{ fontSize: '12px', textAnchor: 'middle' }}
        x={x0Pixel - 50}
        y={height / 2}
        transform={`rotate(270 10 ${height / 2})`}
      >
        {title}
      </text>
      <g>
        {range(coverageAxisStep, maxCoverage, coverageAxisStep).map((cov) => {
            const yPixel = coverageToPixel(cov)
            return (
              <g key={cov}>
                <line x1={x0Pixel - 5} x2={x0Pixel} y1={yPixel} y2={yPixel} stroke="black" strokeWidth={1} />
                <text styles={{ fontSize: '8px', textAnchor: 'end' }} x={x0Pixel - 35} y={yPixel + 3}>{Math.floor(cov)}</text>
              </g>)
          },
        )}
      </g>


      {/* draw x-axis */}
      <line x1={x0Pixel} x2={width} y1={y0Pixel} y2={y0Pixel} stroke="black" strokeWidth={1} />
      {
        range(startPos, endPos, posAxisStep).map((pos) => {
          const xPixel = posToPixel(pos)
          return (
            <g key={pos}>
              <line x1={xPixel} x2={xPixel} y1={y0Pixel + 5} y2={y0Pixel} stroke="black" strokeWidth={1} />
              <text styles={{ fontSize: '8px', textAnchor: 'end' }} x={xPixel - 25} y={y0Pixel + 25}>{Math.floor(pos)}</text>
            </g>)
        },
      )}

      {/* draw coverage curve */}
      {generateCoverageGraphics()}

      {/* draw splice junction curves */}
      {generateJunctionGraphics()}

    </svg>
  )
}

SashimiPlot.propTypes = {
  title: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired, // eslint-disable-line
  coverageColor: PropTypes.string,
  coverageData: PropTypes.array.isRequired,
  junctionData: PropTypes.array.isRequired,
  info: PropTypes.object,
}

SashimiPlot.defaultProps = {
  coverageColor: '#004D7F',
}


export default SashimiPlot
