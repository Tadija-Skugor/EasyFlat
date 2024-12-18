import React, { useState, useEffect } from "react";
import axios from "axios";
import './CentarZaPoruke.css';

function CentarZaPoruke() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);

    const fetchMessages = async () => {
        try {
            const emailKorisnika = await axios.post('http://localhost:4000/userInfo', {}, { withCredentials: true });
            setInfo(emailKorisnika.data);
            console.log(emailKorisnika);
    
            const response = await axios.get("http://localhost:4000/poruke", {
                withCredentials: true,
            });
    
            console.log("Fetched messages:", response.data);  // Ispis poruka nakon što ih dohvatimo
    
            setMessages(response.data); 
            setLoading(false);
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError(`Failed to load messages: ${err.response?.data?.error || err.message}`);
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchMessages();
    }, []);

    const deleteFunction = async (naslov, tekst) => {
        console.log("Pokusaj brisanja", { naslov, tekst });
        try {
            const response = await axios.post(
                'http://localhost:4000/poruke/obrisiRazgovor',
                { naslov: naslov, tekst: tekst },
                { withCredentials: true }
            );
    
            console.log("Obrisano odgovor:", response.data);
    
            setMessages(prevMessages => prevMessages.filter(
                message => message.messageText !== tekst || message.senderEmail !== naslov
            ));
            
        } catch (error) {
            console.error('Error :', error);
        }
    };
    
    
    


    return (
        <div className="message-center">
            <h2>Centar za Poruke</h2>
            
            {/* Provjera je li admin */}
            {info && info.email.startsWith("easyflatprogi@") ? (
                loading ? (
                    <p>Učitavanje poruka...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <div className="message-box">
                        {messages.length === 0 ? (
                            <p>Nema poruka za prikaz.</p>
                        ) : (
                            messages.map((message, index) => (
                                <div className="message-field" key={index}>
                                    <div className="message-header">
                                        <span className="sender">{message.senderEmail}</span>
                                    </div>
                                    <div className="message-body">
                                        <p>{message.messageText}</p>
                                        <button onClick={() => deleteFunction(message.senderEmail, message.messageText)}>
                                            Obriši obavijest
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )
            ) : (
                // Else ne admin
                loading ? (
                    <p>Učitavanje poruka...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <div className="message-box">
                        {messages.length === 0 ? (
                            <p>Nema poruka za prikaz.</p>
                        ) : (
                            messages.map((message, index) => (
                                <div className="message-field" key={index}>
                                    <div className="message-header">
                                        <span className="sender">{message.senderEmail}</span>
                                    </div>
                                    <div className="message-body">
                                        <p>{message.messageText}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )
            )}
        </div>
    );
}

export default CentarZaPoruke;
