/* eslint-disable react/jsx-indent */

import React from 'react'
import { Provider } from 'react-redux'

import BaseLayout from './components/BaseLayout'
import { createReduxStore } from './redux/rootReducer'

function App() {
  return (
    <Provider store={createReduxStore()}>
      <BaseLayout />
    </Provider>)
}

export default App
