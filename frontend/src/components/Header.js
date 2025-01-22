import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            const trimmedQuery = searchQuery.trim();
            if (trimmedQuery) {
                navigate(`/main?search_query=${encodeURIComponent(trimmedQuery)}`);
            } else {
                navigate('/main'); // Navigate to /home if the input is empty
                window.location.reload();

            }
            setSearchQuery(''); // Clear the input field
        }
    };

    const handleLogout = () => {
        fetch('http://localhost:4000/logout', {
            method: 'POST',
            credentials: 'include', // kredencijali iako mislim da moze bez njih jer nema provjere na backendu
        })
            .then((response) => {
                if (response.ok) {
                    window.location.reload(); // Refresh jer te sam vrati na signup pa nema potrebe za redirekciju
                } else {
                    console.error('Logout failed');
                }
            })
            .catch((error) => {
                console.error('Error during logout:', error);
            });
    };

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
                <input
                    type="text"
                    placeholder="Pretraži diskusije..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                />
            </div>

            <div className="nav-right">
                <Link to="/korisnikInfo">
                    <img
                        src={require('../assets/images/user.png')}
                        alt="korisnikInfo"
                        className="nav-icon"
                    />
                </Link>
                <Link to="/zgrade">
                    <img
                        src={require('../assets/images/building.png')}
                        alt="buildings"
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
                {/* <Link to="/main">
                    <img
                        src={require('../assets/images/home.png')}
                        alt="Home"
                        className="nav-icon"
                    />
                </Link> */}
                <Link to="/glasanje">
                    <img
                        src={require('../assets/images/vote.png')}
                        alt="glasanje"
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
                {/* Tipa za logout */}
                <div onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <img
                        src={require('../assets/images/log-in.png')}
                        alt="Log Out"
                        className="nav-icon"
                    />
                </div>
            </div>
        </nav>
    );
}
