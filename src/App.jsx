import { useState } from 'react'
import './App.css'
import { PasskeyDemo } from './components/PasskeyDemo'

function App() {
  return (
    <div className="App">
      <h1>Passkey Demo</h1>
      <p>Interactive demonstration of WebAuthn/Passkey authentication</p>
      <PasskeyDemo />
    </div>
  )
}

export default App
