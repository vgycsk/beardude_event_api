
import React from 'react'
import css from './style.css'

function App ({ children }) {
  return <div className={css.app}>{children}</div>
}

export default App
