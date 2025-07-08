// Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';


function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <h1>Harmony Explorer</h1>
      </Link>
      
      <div className="navbar-nav">
        <ul>
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;