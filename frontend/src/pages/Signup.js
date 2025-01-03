import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import za useNavigate
import './SignUp.css';

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

    useEffect(() => {
        document.body.classList.add('signup-body');
        return () => {
            document.body.classList.remove('signup-body');
        };
    }, []);

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
        <div className="signupdiv">
        <div className="signup-container">
            <h1>Pridružite se EasyFlat platformi danas!</h1>
            <div className="signup-content">
                <div className="benefits-section">
                    <h2>Što vam nudi Easy Flat?</h2>
                    <ul className="benefits-list">
                        <li>✔ Poboljšana komunikacija među sustanarima</li>
                        <li>✔ Efikasno rješavanje problema</li>
                        <li>✔ Poboljšano donošenje odluka</li>
                        <li>✔ Brža organizacija financija</li>
                        <li>✔ Dokumentacija razgovora</li>
                    </ul>
                </div>
                
                <button className="google-auth-button" onClick={auth}>
                    Prijavite se putem Google-a
                </button>

            </div>
        </div>
        </div>
    );

};
