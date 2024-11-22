import React from 'react'
import PropTypes from 'prop-types'
import { Outlet } from 'react-router-dom'



const SimpleLayout = ({children}) => {
  return (
    <div className='contenedor-dos'>
        <div className='contentdos'>
        {children}
        <Outlet/>
      </div>
      
    </div>
  )
}
SimpleLayout.propTypes = {
  children: PropTypes.node,
}


export default SimpleLayout
