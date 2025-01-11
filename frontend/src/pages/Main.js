import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Main.css';

export default function Home() {
    const [discussions, setDiscussions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
    const [newResponse, setNewResponse] = useState('');
    const [loading, setLoading] = useState(true);

    // Dohvat diskusija
    useEffect(() => {
        const fetchDiscussions = async () => {
            try {
                const response = await axios.get('http://localhost:4000/data/allDiscussions');
                setDiscussions(response.data);
            } catch (error) {
                console.error('Error fetching discussions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscussions();
    }, []);

    // Dohvat odgovora odredene diskusije
    const fetchResponses = async (discussionId) => {
        try {
            const response = await axios.get('http://localhost:4000/data/discussionResponses', {
                params: { id_diskusije: discussionId },
            });
            setResponses(response.data);
            setSelectedDiscussionId(discussionId);
        } catch (error) {
            console.error('Error fetching responses:', error);
        }
    };

    // Dodavanje odgovora diskusiji
    const handleAddResponse = async (e) => {
        e.preventDefault();
        if (!selectedDiscussionId) return;

        try {
            const response = await axios.post('http://localhost:4000/data/discussionAddResponse', {
                id_diskusije: selectedDiscussionId,
                korisnik: 'User1', // Replace with dynamic user data if needed
                tekst: newResponse,
            });
            console.log('Response added:', response.data);
            setNewResponse(''); // Clear the input
            fetchResponses(selectedDiscussionId); // Refresh responses
        } catch (error) {
            console.error('Error adding response:', error);
        }
    };

    if (loading) {
        return <div>Učitavanje diskusija...</div>;
    }

    return (
        <div className="discussions-wrapper">
            {discussions.map((discussion) => (
                <div key={discussion.id} className="discussion-box">
                    <h3>{discussion.naslov}</h3>
                    <p><strong>Autor:</strong> {discussion.kreator}</p>
                    <p><strong>Opis:</strong> {discussion.opis}</p>
                    <p><strong>Datum objavljeno:</strong> {new Date(discussion.datum_stvorena).toLocaleDateString()}</p>
                    <button onClick={() => fetchResponses(discussion.id)}>Vidi odgovore</button>
                    </div>
                ))}
        </div>

    );
}


