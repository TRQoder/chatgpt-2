import React from 'react'
import './index.css'
import AppRoutes from './routes/AppRoutes'
import {Toaster} from 'react-hot-toast'

function App() {
  return (
    <>
      <AppRoutes />
       <Toaster position="top-center" reverseOrder={false} />
    </>
  )
}

export default App
