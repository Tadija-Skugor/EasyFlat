import React from 'react';
import { Link } from 'react-router-dom';

export default function Header(){
  
        return(


          <nav className="nav-bar">
          <div className="nav-left">
          <Link to="/main">
            <img src={require('../assets/images/easyflatLogo.png')} alt="EasyFlat Logo" className="logo" />
        </Link>
              <p className="brand-name">EasyFlat</p>
          </div>

          <div className="nav-center">
              <input type="text" placeholder="Search..." className="search-bar" />
          </div>

          <div className="nav-right">
      <a href="/korisnikinfo">  
        <img src={require('../assets/images/user.png')} alt="Profile" className="profile-image" />
    </a>
</div>


          <ul>
              <li>
                <a href="/home">Ovo je univerzalno zaglavnje za starnice koje isto tako vodi na home</a>
              </li>
              <li>
                <a href="/contact">Ovo je link koji vodi na kontakt stranicu</a>
              </li>
              <li>
                <a href="/upit">Ovo je link koji vodi na upit za stranicz</a>
              </li>
              <li>
                <a href="/signup">Ovo je link koji vodi na signup za stranicz</a>
              </li>

            </ul>
            
      </nav>

        )
        }
