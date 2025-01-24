import { useState, useEffect } from "react";
import './SignUp.css';

export default function Upit() {

    const [error, setError] = useState('');


    useEffect(() => {
        document.body.classList.add('signup-body');
        return () => {
            document.body.classList.remove('signup-body');
        };
    }, []);

    // Auth funkcija izmjenjena tako da koristi navigate iz useNavigate
    const auth = async () => {
        try {
            const response = await fetch('https://be30c39fc6db.ngrok.app/request', { method: 'POST' });
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
