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


    const [showAddDiscussion, setShowAddDiscussion] = useState(false); // Manage add discussion form visibility
    const [newDiscussion, setNewDiscussion] = useState({
        naslov: '',
        opis: '',
    });
    const [Glasanjes, setGlasanjes] = useState([]);
    const [userEmail, setUserEmail] = useState('');
        const [userVotes, setUserVotes] = useState({});
        const [selectedVotes, setSelectedVotes] = useState({});
        const [hasVoted, setHasVoted] = useState({});
        
        const [expandedInfo, setExpandedInfo] = useState({});
        const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
        const [newGlasanje, setNewGlasanje] = useState({
            naslov: '',
            opis: '',
            datum_istece: '',
        });
    const fetchDiscussions = async (searchQuery) => {
        try {
            const response = await axios.get('http://localhost:4000/data/allDiscussions', {
                withCredentials: true,  // Ensures cookies are sent with the request if needed
            });
            let filteredDiscussions = response.data;
            console.log(filteredDiscussions);
            // If searchQuery exists, filter discussions based on title (naslov)
            if (searchQuery) {
                filteredDiscussions = filteredDiscussions.filter((discussion) =>
                    discussion.naslov.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
    
            const [userEmailResponse, GlasanjesResponse] = await Promise.all([
                axios.get('http://localhost:4000/glasanje/userEmail', { withCredentials: true }),
                axios.get('http://localhost:4000/glasanje/Glasanjes'),
            ]);

            setUserEmail(userEmailResponse.data.email);
            //setGlasanjes(GlasanjesResponse.data);
            setDiscussions(filteredDiscussions);
            if (userEmailResponse.data.email) {
                const votes = {};
                const votedGlasanjes = {};

                for (let discussion of filteredDiscussions) {
                    if (discussion.forma){
                    console.log("forma: ", discussion.forma);
                    const user_glasanje = await axios.get('http://localhost:4000/glasanje/userVote', {
                        params: { email: userEmailResponse.data.email, GlasanjeId: discussion.forma.id },
                        withCredentials: true,
                    });
                    console.log(user_glasanje);
                    if (user_glasanje.data.voted) {
                        votes[discussion.forma.id] = user_glasanje.data.vote ? "da" : "ne";
                        votedGlasanjes[discussion.forma.id] = true;
                    }
                    }
                }
                console.log("votes: ", votes);
                console.log("votedGlasanjes: ",votedGlasanjes);
                setUserVotes(votes);
                setHasVoted(votedGlasanjes);
            }

            
            
        } catch (error) {
            console.error('Error fetching discussions:', error);
            setError('Failed to fetch discussions');
        } finally {
            setLoading(false);
        }
    };


    const toggleInfo = (GlasanjeId) => {
        setExpandedInfo((prev) => ({ ...prev, [GlasanjeId]: !prev[GlasanjeId] }));
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGlasanje((prev) => ({ ...prev, [name]: value }));
    };
    

    // Fetch responses to a selected discussion
    const fetchResponses = async (discussionId) => {
        try {
            const response = await axios.get('http://localhost:4000/data/discussionResponses', {
                params: { id_diskusije: discussionId },
            },                {withCredentials: true} 
        );

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
                //korisnik: 'User1', // Replace with dynamic user data if needed
                tekst: newResponse,
            },{withCredentials: true}

        
        );
            console.log('Response added:', response.data);
            setNewResponse(''); // Clear the input
            fetchResponses(selectedDiscussionId); // Refresh responses
        } catch (error) {
            console.error('Error adding response:', error);
        }
    };

    // ova funkcija jos ne radi dobro, treba se popraviti
    const handleVoteSubmit = async (formaId, vote) => {
        try {
            const response = await axios.post(
                'http://localhost:4000/glasanje',
                { GlasanjeId: formaId, vote },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
    
            if (response.data.success) {
                // Update state after a successful vote
                setDiscussions((prevDiscussions) =>
                    prevDiscussions.map((discussion) =>
                        discussion.forma && discussion.forma.id === formaId
                            ? {
                                  ...discussion,
                                  forma: {
                                      ...discussion.forma,
                                      glasovanje_da: vote === 'da' ? discussion.forma.glasovanje_da + 1 : discussion.forma.glasovanje_da,
                                      glasovanje_ne: vote === 'ne' ? discussion.forma.glasovanje_ne + 1 : discussion.forma.glasovanje_ne,
                                  },
                              }
                            : discussion
                    )
                );
    
                setUserVotes((prevVotes) => ({ ...prevVotes, [formaId]: vote }));
                setHasVoted((prevHasVoted) => ({ ...prevHasVoted, [formaId]: true }));
                setSelectedVotes((prevSelectedVotes) => ({ ...prevSelectedVotes, [formaId]: '' }));
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
        }
    };
    
    const handleRadioChange = (formaId, value) => {
        setSelectedVotes((prevSelectedVotes) => ({ ...prevSelectedVotes, [formaId]: value }));
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

                <button className="add-discussion-button" onClick={() => setShowAddDiscussion(!showAddDiscussion)}>+</button>

            {showAddDiscussion && (
                <div className="overlay">
                    <div className="overlay-content">
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
                            <button
                                type="button"
                                onClick={() => setShowAddDiscussion(false)}
                                className="close-button"
                            >
                                Zatvori
                            </button>
                        </form>
                    </div>
                </div>
            )}


                {discussions.map((discussion) => (
                    <div key={discussion.id} className="discussion-box">
                        <h3>{discussion.naslov}</h3>
                        <p><strong>Autor:</strong> {discussion.kreator}</p>
                        <p><strong>Opis:</strong> {discussion.opis}</p>
                        <p><strong>Datum objavljeno:</strong> {new Date(discussion.datum_stvorena).toLocaleDateString()}</p>
                        

                        {discussion.forma && (
                            <div className="forma-section">
                                <h4><strong></strong> {discussion.forma.naslov}</h4>
                                <p><strong>Glasova 'Da':</strong> {discussion.forma.glasovanje_da}</p>
                                <p><strong>Glasova 'Ne':</strong> {discussion.forma.glasovanje_ne}</p>
                                <p><strong>Datum stvoreno:</strong> {new Date(discussion.forma.datum_stvoreno).toLocaleDateString()}</p>
                                <p><strong>Datum ističe:</strong> {new Date(discussion.forma.datum_istece).toLocaleDateString()}</p>
                                <p><strong>Kreator forme:</strong> {discussion.forma.kreator}</p>

                                <div className="voting-box">
                                    <h4>Slažete li se?</h4>
                                    {hasVoted[discussion.forma.id] ? (
                                        <div className="vote-results">
                                            <p>Vaš glas: {userVotes[discussion.forma.id]}</p>
                                            <p>Da: {discussion.forma.glasovanje_da}</p>
                                            <p>Ne: {discussion.forma.glasovanje_ne}</p>
                                        </div>
                                    ) : (
                                        <div className="radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={`vote_${discussion.forma.id}`}
                                                    value="da"
                                                    checked={selectedVotes[discussion.forma.id] === 'da'}
                                                    onChange={() => handleRadioChange(discussion.forma.id, 'da')}
                                                />
                                                Da
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={`vote_${discussion.forma.id}`}
                                                    value="ne"
                                                    checked={selectedVotes[discussion.forma.id] === 'ne'}
                                                    onChange={() => handleRadioChange(discussion.forma.id, 'ne')}
                                                />
                                                Ne
                                            </label>
                                            <button
                                                className="submit-vote-button"
                                                onClick={() => handleVoteSubmit(discussion.forma.id, selectedVotes[discussion.forma.id])}
                                                disabled={!selectedVotes[discussion.forma.id]}
                                            >
                                                Pošaljite glas
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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
                                    <button 
                                    type="submit" 
                                    disabled={remainingResponses[selectedDiscussionId] === 0}
                                    >
                                    Pošaljite odgovor
                                    </button>

                                    {remainingResponses[selectedDiscussionId] === 0 && (
                                    <span style={{ color: 'red', marginLeft: '10px' }}>Diskusija nema više dostupnih poruka</span>
                                    )}
                                </form>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
