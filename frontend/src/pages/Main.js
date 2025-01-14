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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const [showAddDiscussion, setShowAddDiscussion] = useState(false); // Manage add discussion form visibility
    const [newDiscussion, setNewDiscussion] = useState({
        naslov: '',
        opis: '',
    });
    

    const fetchDiscussions = async (searchQuery) => {
        try {
            const response = await axios.get('http://localhost:4000/data/allDiscussions', {
                withCredentials: true,  // Ensures cookies are sent with the request if needed
            });
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
            setError('Failed to fetch discussions');
        } finally {
            setLoading(false);
        }
    };
    

    // Fetch responses to a selected discussion
    const fetchResponses = async (discussionId) => {
        try {
            const response = await axios.get('http://localhost:4000/data/discussionResponses', {
                params: { id_diskusije: discussionId },
            },                {withCredentials: true} 
        );

            // spremi sve odgovore u wrapper element 'odgovori' kako bi parseFromString kod radio ispravno
            const wrappedXmlString = `<odgovori>${response.data}</odgovori>`;
    
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
            },{                withCredentials: true
            }

        
        );
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

        fetchDiscussions(searchQuery); // Pass the searchQuery to filter discussions
    }, [location.search]);


    
    const handleAddDiscussion = async (e) => {
        e.preventDefault();

        const { naslov, opis } = newDiscussion;

        if (!naslov.trim() || !opis.trim()) {
            console.log('All fields are required.');
            return;
        }

        try {
            await axios.post('http://localhost:4000/data/addDiscussion', {
                naslov,
                opis
            }, {
                withCredentials: true  // Ensure cookies are sent with the request
            });
            

            setNewDiscussion({ naslov: '', opis: ''});
            setShowAddDiscussion(false);
            fetchDiscussions();
        } catch (error) {
            console.error('Error adding discussion:', error);
        }
    };
    const toggleResponsesVisibility = (discussionId) => {
        if (selectedDiscussionId === discussionId) {
            setSelectedDiscussionId(null);
            setResponses(''); 
        } else {
            fetchResponses(discussionId);
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
                <p>Učitavanje podataka...</p>
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

                <button onClick={() => setShowAddDiscussion(!showAddDiscussion)}>
                    {showAddDiscussion ? 'Zatvori formu' : 'Dodaj novu diskusiju'}
                </button>

                {showAddDiscussion && (
                    <form className="add-discussion-form" onSubmit={handleAddDiscussion}>
                        <h3>Dodaj novu diskusiju</h3>
                        <label>
                            Naslov:
                            <input
                                type="text"
                                value={newDiscussion.naslov}
                                onChange={(e) =>
                                    setNewDiscussion({ ...newDiscussion, naslov: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Opis:
                            <textarea
                                value={newDiscussion.opis}
                                onChange={(e) =>
                                    setNewDiscussion({ ...newDiscussion, opis: e.target.value })
                                }
                            />
                        </label>

                        <button type="submit">Dodaj diskusiju</button>
                    </form>
                )}

                {discussions.map((discussion) => (
                    <div key={discussion.id} className="discussion-box">
                        <h3>{discussion.naslov}</h3>
                        <p><strong>Autor:</strong> {discussion.kreator}</p>
                        <p><strong>Opis:</strong> {discussion.opis}</p>
                        <p><strong>Datum objavljeno:</strong> {new Date(discussion.datum_stvorenja).toLocaleDateString()}</p>
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
                                    <button type="submit">Pošaljite odgovor</button>
                                </form>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
