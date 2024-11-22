import React from 'react'
import PropTypes from 'prop-types'
import Navbar from '../inicio/Navbar'
import { Outlet } from 'react-router-dom'


const MainLayout = ({children}) => {
  return (
    <div className='contenedor-uno'>
    <Navbar />
      <div className='contentuno'>
        {children}
        <Outlet/>
      </div>
      
    </div>
  )
}
MainLayout.propTypes = {
  children: PropTypes.node,
}

export default MainLayout
