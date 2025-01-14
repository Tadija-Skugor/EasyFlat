import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Main.css';

export default function Home() {
    const [searchResults, setSearchResults] = useState([]);
    const [discussions, setDiscussions] = useState([]);
    const [responses, setResponses] = useState(''); // Initialize as a string
    const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
    const [newResponse, setNewResponse] = useState('');
    const [remainingResponses, setRemainingResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    // Fetch search results based on the query string
    const fetchSearchResults = async (query) => {
        try {
            setLoading(true);
            setError(null);

            const url = query
                ? `http://localhost:4000/fetchDiscusion/search`
                : `http://localhost:4000/fetchDiscusion/all`;

            const response = await axios.get(url, {
                params: query ? { query } : {},
            });

            setSearchResults(response.data);
        } catch (err) {
            setError(
                `Fali backend za rezultat; ${
                    query ? `Upit koji je poslan je ovaj: ${query}` : 'Svi rezultati nisu dostupni'
                }`
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch discussions with optional filtering based on the search query
    const fetchDiscussions = async (searchQuery) => {
        try {
            const response = await axios.get('http://localhost:4000/data/allDiscussions');
            let filteredDiscussions = response.data;

            // If searchQuery exists, filter discussions based on title (naslov)
            if (searchQuery) {
                filteredDiscussions = filteredDiscussions.filter((discussion) =>
                    discussion.naslov.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setDiscussions(filteredDiscussions);
        } catch (error) {
            console.error('Error fetching discussions:', error);
        }
    };

    // Fetch responses to a selected discussion
    const fetchResponses = async (discussionId) => {
        try {
            const response = await axios.get('http://localhost:4000/data/discussionResponses', {
                params: { id_diskusije: discussionId },
            });
            console.log(response);
            // spremi sve odgovore u wrapper element 'odgovori' kako bi parseFromString kod radio ispravno
            const wrappedXmlString = `<odgovori>${response.data.odgovori}</odgovori>`;
            const broj_preostalih_odgovora = response.data.br_odgovora;
            setRemainingResponses((prev) => ({
                ...prev,
                [discussionId]: broj_preostalih_odgovora,
            }));

            // parsiranje XMLa u DOM objekt
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(wrappedXmlString, "text/xml");
    
            // izdvajanje odgovora iz DOM objekta
            const responseElements = xmlDoc.getElementsByTagName("odgovor");
            const parsedResponses = Array.from(responseElements).map((responseElement) => ({
                korisnik: responseElement.getElementsByTagName("korisnik")[0].textContent,
                tekst: responseElement.getElementsByTagName("tekst")[0].textContent,
            }));
    
            setResponses(parsedResponses);
            setSelectedDiscussionId(discussionId);
        } catch (error) {
            console.error("Error fetching responses:", error);
            setResponses([]); // Reset responses to empty string on error
        }
    };

    // Handle adding a new response
    const handleAddResponse = async (e) => {
        e.preventDefault();
        if (!selectedDiscussionId) return;

        // ne moze se poslati odgovor ako je polje odgovora prazno 
        if (!newResponse.trim()) {
            console.log('The textarea is empty. Please enter a response before submitting.');
            return; 
        }

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

    // Effect for loading search query or fetching all discussions
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search_query');

        fetchSearchResults(searchQuery);
        fetchDiscussions(searchQuery); // Pass the searchQuery to filter discussions
    }, [location.search]);

    // Toggle responses visibility
    const toggleResponsesVisibility = (discussionId) => {
        if (selectedDiscussionId === discussionId) {
            setSelectedDiscussionId(null); // Hide responses if the same discussion is clicked again
            setResponses(''); // Reset the responses if they are hidden
        } else {
            fetchResponses(discussionId); // Fetch responses if a different discussion is selected
        }
    };

    if (loading) {
        return <div>Učitavanje podataka...</div>;
    }

    return (
        <div className="home-container">
            {/*
            <h1>HOME STRANICA</h1>
            <p>
                Ovdje ce se nalaziti naša početna home stranica. U njoj ce biti diskusije.<br />
                Neki message board i voting sustav
            </p>
            */}

            {loading ? (
                <p>Loading search results...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <div className="search-results">
                    <h2>Rezultati pretrage</h2>
                    <ul>
                        {searchResults.map((result, index) => (
                            <li key={index}>{result}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="discussions-wrapper">
                <h2>Diskusije</h2>
                {discussions.map((discussion) => (
                    <div key={discussion.id} className="discussion-box">
                        <h3>{discussion.naslov}</h3>
                        <p><strong>Autor:</strong> {discussion.kreator}</p>
                        <p><strong>Opis:</strong> {discussion.opis}</p>
                        <p><strong>Datum objavljeno:</strong> {new Date(discussion.datum_stvorena).toLocaleDateString()}</p>
                        <button onClick={() => toggleResponsesVisibility(discussion.id)}>
                            {selectedDiscussionId === discussion.id ? 'Sakrij odgovore' : 'Vidi odgovore'}
                        </button>

                        {selectedDiscussionId === discussion.id && (
                            <div className="responses-section">
                                <h3>Odgovori na diskusiju</h3>
                                {responses.length > 0 ? (
                                    <ul>
                                        {responses.map((response, index) => (
                                            <li key={index}>
                                                <p><strong>Korisnik:</strong> {response.korisnik}</p>
                                                <p><strong>Tekst:</strong> {response.tekst}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Još nema odgovora.</p>
                                )}
                                <form onSubmit={handleAddResponse}>
                                    <textarea
                                        value={newResponse}
                                        onChange={(e) => setNewResponse(e.target.value)}
                                        placeholder="Dodaj odgovor..."
                                    />
                                    <button type="submit" disabled={remainingResponses[selectedDiscussionId] === 0}>Pošaljite odgovor</button>
                                </form>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
