// import { useState } from 'react'

import './App.css'
import CandleStickChart from './components/CandlestickChart'


function App() {


  return (
    <>

   <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#0e1e2b',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'

   }}>Hello World!   
    <CandleStickChart/>
    </div>
    </>
  )
}

export default App
