import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Main() {
    const [discussions, setDiscussions] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [userVotes, setUserVotes] = useState({}); // Pohranjujemo glasove korisnika po diskusijama
    const [selectedVotes, setSelectedVotes] = useState({}); // Pohranjujemo glasove korisnika po diskusijama (novi objekt)

    const [hasVoted, setHasVoted] = useState({}); // Pohranjuje je li korisnik već glasao za svaku diskusiju

    // Dohvati e-mail korisnika iz sesije
    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const response = await axios.get('http://localhost:4000/glasanje/userEmail', {
                    withCredentials: true,  // Omogućuje slanje kolačića sa zahtjevom
                });
                setUserEmail(response.data.email);
            } catch (error) {
                console.error('Greška prilikom dohvaćanja e-maila korisnika:', error);
            }
        };

        fetchUserEmail();
    }, []);

    // Dohvati diskusije iz backend-a
    useEffect(() => {
        const fetchDiscussions = async () => {
            try {
                const response = await axios.get('http://localhost:4000/glasanje/discussions');
                setDiscussions(response.data);
            } catch (error) {
                console.error('Greška prilikom dohvaćanja diskusija:', error);
            }
        };

        fetchDiscussions();
    }, []);

    // Provjerite je li korisnik već glasao za određenu diskusiju
    useEffect(() => {
        if (userEmail) {
            const checkUserVotes = async () => {
                const votes = {};
                const votedDiscussions = {};

                for (let discussion of discussions) {
                    const response = await axios.get(`http://localhost:4000/glasanje/userVote`, {
                        params: { email: userEmail, discussionId: discussion.id },
                        withCredentials: true,
                    });
                    if (response.data.voted) {
                        votes[discussion.id] = response.data.vote; // Spremite glas korisnika
                        votedDiscussions[discussion.id] = true; // Označi da je korisnik već glasao
                    }
                }

                setUserVotes(votes); // Pohranjujemo glasove korisnika
                setHasVoted(votedDiscussions); // Označavamo diskusije na koje je korisnik glasao
            };

            checkUserVotes();
        }
    }, [userEmail, discussions]);  // Pokreće se kada se promijeni userEmail ili discussions

    // Funkcija za glasanje
    const handleVoteSubmit = async (discussionId, vote) => {
        if (!userEmail) {
            alert('Morate biti prijavljeni da biste glasali');
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/glasanje', {
                userId: userEmail,
                discussionId,
                vote,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,  // Omogućuje slanje kolačića sa zahtjevom
            });

            if (response.data.success) {
                // Ažuriraj glasove na frontend-u
                setDiscussions((prevDiscussions) =>
                    prevDiscussions.map((discussion) =>
                        discussion.id === discussionId
                            ? {
                                  ...discussion,
                                  glasovanje_da: vote === 'da' ? discussion.glasovanje_da + 1 : discussion.glasovanje_da,
                                  glasovanje_ne: vote === 'ne' ? discussion.glasovanje_ne + 1 : discussion.glasovanje_ne,
                              }
                            : discussion
                    )
                );

                // Pohranjujemo glas korisnika
                setUserVotes((prevVotes) => ({
                    ...prevVotes,
                    [discussionId]: vote,
                }));

                // Označi da je korisnik već glasao
                setHasVoted((prevHasVoted) => ({
                    ...prevHasVoted,
                    [discussionId]: true,
                }));

                // Resetiraj odabrani glas za tu diskusiju
                setSelectedVotes((prevSelectedVotes) => ({
                    ...prevSelectedVotes,
                    [discussionId]: '', // Resetiramo glas za diskusiju
                }));
            }
        } catch (error) {
            console.error('Greška prilikom slanja glasa:', error);
        }
    };

    const handleRadioChange = (discussionId, value) => {
        setSelectedVotes((prevSelectedVotes) => ({
            ...prevSelectedVotes,
            [discussionId]: value, // Pohranjuje glas za tu diskusiju
        }));
    };

    return (
        <div className="main-container">
            <div className="discussion-list">
                {discussions.map((discussion) => (
                    <div key={discussion.id} className="discussion-item">
                        <h3>{discussion.naslov}</h3>
                        <p><strong>Kreator:</strong> {discussion.kreator}</p>
                        <p><strong>Datum kreiranja:</strong> {new Date(discussion.datum_stvoreno).toLocaleDateString()}</p>
                        <p><strong>Datum isteka:</strong> {new Date(discussion.datum_isteko).toLocaleDateString()}</p>

                        <div className="voting-box">
                            <h4>Slažete li se?</h4>
                            {hasVoted[discussion.id] ? (
                                <div className="vote-results">
                                    <p>Vaš glas: {userVotes[discussion.id]}</p>
                                    <p>Da: {discussion.glasovanje_da}</p>
                                    <p>Ne: {discussion.glasovanje_ne}</p>
                                </div>
                            ) : (
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`vote_${discussion.id}`} // Dodajemo jedinstven name za svaki set radio tipki
                                            value="da"
                                            checked={selectedVotes[discussion.id] === 'da'}
                                            onChange={() => handleRadioChange(discussion.id, 'da')}
                                            disabled={hasVoted[discussion.id]} // Onemogućeno ako je korisnik već glasao
                                        />
                                        Da
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`vote_${discussion.id}`} // Dodajemo jedinstven name za svaki set radio tipki
                                            value="ne"
                                            checked={selectedVotes[discussion.id] === 'ne'}
                                            onChange={() => handleRadioChange(discussion.id, 'ne')}
                                            disabled={hasVoted[discussion.id]} // Onemogućeno ako je korisnik već glasao
                                        />
                                        Ne
                                    </label>
                                    <button
                                        className="submit-vote-button"
                                        onClick={() => handleVoteSubmit(discussion.id, selectedVotes[discussion.id])}
                                        disabled={!selectedVotes[discussion.id] || hasVoted[discussion.id]} // Onemogućeno ako nije odabran glas ili je već glasano
                                    >
                                        Pošaljite glas
                                    </button>
                                </div>
                            )}
                        </div>

                        <hr className="discussion-separator" />
                    </div>
                ))}
            </div>

            <button className="archive-button">Arhiva</button>

            <Link to="/Upit" className="navigation-button">+</Link>
        </div>
    );
}
