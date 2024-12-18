import React, { useState, useEffect } from "react";
import axios from "axios";
import './CentarZaPoruke.css';

function CentarZaPoruke() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get("http://localhost:4000/poruke", {
                    withCredentials: true,
                });
                setMessages(response.data); 
                setLoading(false);
            } catch (err) {
                console.error("Error fetching messages:", err);
                setError(`Failed to load messages: ${err.response?.data?.error || err.message}`);
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    return (
        <div className="message-center">
            <h2>Centar za Poruke</h2>

            {loading ? (
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
            )}
        </div>
    );
}

export default CentarZaPoruke;
