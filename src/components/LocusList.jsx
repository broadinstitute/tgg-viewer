import React from 'react'
import styled from 'styled-components'


const LinkButton = styled.a`
  cursor: pointer;
`

export const LocusList = ({locusList, setLocus}) =>
  <div>
    {
      locusList.map(locus =>
        <div key={locus}><LinkButton onClick={() => {setLocus(locus)}}>{locus}</LinkButton></div>
      )
    }
    <LinkButton onClick={() => {console.log(locusList)}}>
      {(locusList || []).length > 0  ? 'Edit Locus List' : 'Add Locus List To Side Bar'}
    </LinkButton>
  </div>

//const mapStateToProps = state => ({
//  user: getUser(state),
//})

//export { LocusList as LocusListComponent }

//export default connect(mapStateToProps)(LocusList)

