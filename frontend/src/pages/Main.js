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
    const [showAddDiscussion, setShowAddDiscussion] = useState(false); 
    const [newDiscussion, setNewDiscussion] = useState({
        naslov: '',
        opis: '',
    });
    const [userEmail, setUserEmail] = useState('');
    const [userVotes, setUserVotes] = useState({});
    const [selectedVotes, setSelectedVotes] = useState({});
    const [hasVoted, setHasVoted] = useState({});
    const [expandedInfo, setExpandedInfo] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [newGlasanje, setNewGlasanje] = useState({
        naslov: '',
        datum_istece: '',
    });
    const [sastanakCreated, setSastanakCreated] = useState(false);


    const fetchDiscussions = async (searchQuery) => {
        try {
            const response = await axios.get('http://localhost:4000/data/allDiscussions', {
                withCredentials: true, 
            });
            let filteredDiscussions = response.data;
            console.log(filteredDiscussions);
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
                    console.log(discussion);
                    console.log("AAAAAAAAAAAAAAAAAAAAA");
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
  
    const fetchResponses = async (discussionId) => {
        try {
            const response = await axios.get('http://localhost:4000/data/discussionResponses', {
                params: { id_diskusije: discussionId },
            },                {withCredentials: true} 
        );

            const wrappedXmlString = `<odgovori>${response.data.odgovori}</odgovori>`;
            const broj_preostalih_odgovora = response.data.br_odgovora;
            setRemainingResponses((prev) => ({
                ...prev,
                [discussionId]: broj_preostalih_odgovora,
            }));

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(wrappedXmlString, "text/xml");
    
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
                tekst: newResponse,
            },{withCredentials: true}
        );
            console.log('Response added:', response.data);
            setNewResponse(''); 
            fetchResponses(selectedDiscussionId); 
        } catch (error) {
            console.error('Error adding response:', error);
        }
    };

    const handleVoteSubmit = async (formaId, vote) => {
        try {
            const response = await axios.post(
                'http://localhost:4000/glasanje',
                { GlasanjeId: formaId, vote },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
    
            if (response.data.success) {
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
            const params = new URLSearchParams(location.search);

            const searchQuery = params.get('search_query');

            await fetchDiscussions(searchQuery);

        } catch (error) {
            console.error('Error submitting vote:', error);
        }
    };
    
    
    const handleRadioChange = (formaId, value) => {
        setSelectedVotes((prevSelectedVotes) => ({ ...prevSelectedVotes, [formaId]: value }));
    };
    
    const createSastanak = async (id,naslov,kreator,opis,da,ne) => {
        try {
            const response = await axios.post('http://localhost:4000/data/createMeeting', { id ,naslov,kreator,opis});
            if (response.data.link) {
                setDiscussions((prevDiscussions) =>
                    prevDiscussions.map((discussion) =>
                        discussion.id === id
                            ? { ...discussion, sastanak: response.data.link }
                            : discussion
                    )
                );
            } else if (response.data.error) {
                console.error(response.data.error);
                setDiscussions((prevDiscussions) =>
                    prevDiscussions.map((discussion) =>
                        discussion.id === id
                            ? { ...discussion, sastanak: response.data.message }
                            : discussion
                    )
                );
            }
        } catch (err) {
            console.error('Error creating sastanak:', err);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search_query');

        fetchDiscussions(searchQuery);
    }, [location.search]);


    const handleAddDiscussion = async (e) => {
        e.preventDefault();
        
        const { naslov, opis } = newDiscussion;
        const { naslov: naslovGlasanja, datum_istece } = newGlasanje;
    
        if (!naslov.trim()) {
            console.log('Naslov diskusije je obavezan.');
            return;
        }
        if (naslovGlasanja.trim() && !datum_istece){
            console.log("Datum je obavezan");
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:4000/data/addDiscussion', {
                naslov,
                opis,
            }, {
                withCredentials: true,
            });
    
            const newDiscussion = response.data.newDiscussion; 
            const id_diskusije = newDiscussion.id; 
            console.log('New discussion ID:', id_diskusije);
    
            if (naslovGlasanja.trim()) {
                await axios.post('http://localhost:4000/data/bindNewForm', {
                    id_diskusije,
                    naslov: naslovGlasanja,
                    datum_istece,
                }, {
                    withCredentials: true,
                });
            }
    
            setNewDiscussion({ naslov: '', opis: '' });
            setNewGlasanje({ naslov: '', opis: '', datum_istece: '' });
            setShowAddDiscussion(false);
            fetchDiscussions();
        } catch (error) {
            console.error('Error adding discussion and glasanje:', error);
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
                            <label>
                                Naslov glasanja:
                                <input
                                    type="text"
                                    value={newGlasanje.naslov}
                                    onChange={(e) =>
                                        setNewGlasanje({ ...newGlasanje, naslov: e.target.value })
                                    }
                                />
                            </label>
                            <label>
                                Datum isteka:
                                <input
                                    type="date"
                                    value={newGlasanje.datum_istece}
                                    onChange={(e) =>
                                        setNewGlasanje({ ...newGlasanje, datum_istece: e.target.value })
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexFlow: 'column'}}>
                            
                            
                        <h3>{discussion.naslov}</h3>
{discussion.sastanak ? (
    discussion.sastanak === 'create' ? (
        <button
            className="sastanak-button"
            onClick={() => {
                createSastanak(discussion.id, discussion.naslov, discussion.kreator, discussion.opis, discussion.glasovanje_da, discussion.glasovanje_ne);
                setSastanakCreated(true); // Ensure this state is set when the button is clicked
            }}
            style={{ marginLeft: 'auto' }}
        >
            Kreiraj sastanak
        </button>
    ) : (
        <p>
                        <strong>Sastanak je dostupan na stranici:</strong> <a href="https://ezgrada-2.onrender.com/" target="_blank" rel="noopener noreferrer">https://ezgrada-2.onrender.com/</a>

        </p>
    )
) : null}


                        </div>
                        <p><strong>Autor:</strong> {discussion.kreator}</p>
                        <p><strong>Opis:</strong> {discussion.opis}</p>
                        <p><strong>Datum objavljeno:</strong> {new Date(discussion.datum_stvorena).toLocaleDateString()}</p>
                        

                        {discussion.forma && (
                            <div className="forma-section">
                                <h4><strong></strong> {discussion.forma.naslov}</h4>
                                <p><strong>Datum stvoreno:</strong> {new Date(discussion.forma.datum_stvoreno).toLocaleDateString()}</p>
                                <p><strong>Datum ističe:</strong> {new Date(discussion.forma.datum_istece).toLocaleDateString()}</p>
                                <p><strong>Autor:</strong> {discussion.forma.kreator}</p>

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

<button
className="archive-button"
onClick={() => window.location.href = 'http://localhost:5000/archive'}>Arhiva
</button>
            </div>
        </div>
    );
}
