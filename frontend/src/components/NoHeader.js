import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
    return (
        <nav className="nav-bar">
            <div className="nav-left">
                <Link to="/main">
                    <img
                        src={require('../assets/images/easyflatLogo.png')}
                        alt="EasyFlat Logo"
                        className="logo"
                    />
                </Link>
                <p className="brand-name">EasyFlat</p>
            </div>

            

        </nav>
    );
}
