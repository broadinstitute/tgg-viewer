import React from 'react'
import { Provider } from 'react-redux'

import BaseLayout from './components/BaseLayout'
import rootReducer from './redux/rootReducer'
import { configureStore } from './redux/configureStore'

function App() {
  return <Provider store={configureStore(rootReducer)}>
    <BaseLayout />
  </Provider>
}

export default App
