import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import za useNavigate

export default function Upit() {
    const navigate = useNavigate(); // Inicijaliziraj useNavigate
    const [ime, setIme] = useState('');
    const [prezime, setPrezime] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordAgain, setPasswordAgain] = useState('');
    const [poruka, setPoruka] = useState('');
    const [error, setError] = useState('');
    const [selectValue, setSelectValue] = useState('');
    const [selectData, setSelectData] = useState([]);

    // Auth funkcija izmjenjena tako da koristi navigate iz useNavigate
    const auth = async () => {
        try {
            const response = await fetch('http://localhost:4000/request', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Failed to fetch the authorization URL.');
            }
            const data = await response.json();
    
            // EKSTERAL GOOGLE AUTH SAMO TO IMAMO
            window.location.href = data.url; 
        } catch (error) {
            console.error('Error during authentication:', error);
            setError(<p className="error">Authentication failed. Please try again.</p>);
        }
    };
    

    const handleLoginRedirect = () => {
        navigate('/login'); // Preusmjeri na /login
    };

    return (
        <div className="signup-container">
            <h1>Kreacija Računa</h1>
            <div className="signup-content">
                <p>Da biste kreirali račun, molimo vas prijavite se putem Google authentifikacije:</p>
                
                <button className="google-auth-button" onClick={auth}>
                    Prijavite se putem Google-a
                </button>

            </div>
        </div>
    );

};
