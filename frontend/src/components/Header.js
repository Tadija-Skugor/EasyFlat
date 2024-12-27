import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'

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

            <div className="nav-center">
                <input type="text" placeholder="Search..." className="search-bar" />
            </div>

            <div className="nav-right">
                <Link to="/korisnikInfo">
                    <img
                        src={require('../assets/images/user.png')}
                        alt="korisnikInfo"
                        className="nav-icon"
                    />
                </Link>
                <Link to="/inbox">
                    <img
                        src={require('../assets/images/mail-inbox-app.png')}
                        alt="Inbox"
                        className="nav-icon"
                    />
                </Link>
                <Link to="/home">
                    <img
                        src={require('../assets/images/home.png')}
                        alt="Home"
                        className="nav-icon"
                    />
                </Link>
                <Link to="/contact">
                    <img
                        src={require('../assets/images/phone-call.png')}
                        alt="Contact"
                        className="nav-icon"
                    />
                </Link>
                <Link to="/upit">
                    <img
                        src={require('../assets/images/question.png')}
                        alt="Upit"
                        className="nav-icon"
                    />
                </Link>
                <Link to="/signup">
                    <img
                        src={require('../assets/images/log-in.png')}
                        alt="Sign Up"
                        className="nav-icon"
                    />
                </Link>
            </div>
        </nav>
    );
}
