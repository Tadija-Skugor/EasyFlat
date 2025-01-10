import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            if (searchQuery.trim()) {
                fetchSearchResults(searchQuery.trim());
            }
        }
    };

    const fetchSearchResults = async (query) => {
        try {
            const response = await fetch(`http://localhost:4000/search?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data); // Save the results in the state
                navigate('/search-results', { state: { results: data, query } }); // Redirect to results page
            } else {
                console.error('Error fetching search results:', response.statusText);
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    };

    const handleLogout = () => {
        fetch('http://localhost:4000/logout', {
            method: 'POST',
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    window.location.reload();
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
                    placeholder="Search..."
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
                <Link to="/glasanje">
                    <img
                        src={'../assets/images/nekaslika.png'}
                        alt="glasanje"
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
