import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Main.css';
export default function Main() {
    const [discussions, setDiscussions] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [userVotes, setUserVotes] = useState({});
    const [selectedVotes, setSelectedVotes] = useState({});
    const [hasVoted, setHasVoted] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedInfo, setExpandedInfo] = useState({}); // State to track expanded info for each discussion

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userEmailResponse, discussionsResponse] = await Promise.all([
                    axios.get('http://localhost:4000/glasanje/userEmail', {
                        withCredentials: true,
                    }),
                    axios.get('http://localhost:4000/glasanje/discussions'),
                ]);

                setUserEmail(userEmailResponse.data.email);
                setDiscussions(discussionsResponse.data);

                if (userEmailResponse.data.email) {
                    const votes = {};
                    const votedDiscussions = {};

                    for (let discussion of discussionsResponse.data) {
                        const response = await axios.get('http://localhost:4000/glasanje/userVote', {
                            params: { email: userEmailResponse.data.email, discussionId: discussion.id },
                            withCredentials: true,
                        });

                        if (response.data.voted) {
                            votes[discussion.id] = response.data.vote;
                            votedDiscussions[discussion.id] = true;
                        }
                    }

                    setUserVotes(votes);
                    setHasVoted(votedDiscussions);
                }
            } catch (error) {
                console.error('Greška prilikom dohvaćanja podataka:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleVoteSubmit = async (discussionId, vote) => {
        if (!userEmail) {
            alert('Morate biti prijavljeni da biste glasali');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:4000/glasanje',
                {
                    userId: userEmail,
                    discussionId,
                    vote,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
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

                setUserVotes((prevVotes) => ({
                    ...prevVotes,
                    [discussionId]: vote,
                }));

                setHasVoted((prevHasVoted) => ({
                    ...prevHasVoted,
                    [discussionId]: true,
                }));

                setSelectedVotes((prevSelectedVotes) => ({
                    ...prevSelectedVotes,
                    [discussionId]: '',
                }));
            }
        } catch (error) {
            console.error('Greška prilikom slanja glasa:', error);
        }
    };

    const handleRadioChange = (discussionId, value) => {
        setSelectedVotes((prevSelectedVotes) => ({
            ...prevSelectedVotes,
            [discussionId]: value,
        }));
    };

    const toggleInfo = (discussionId) => {
        setExpandedInfo((prev) => ({
            ...prev,
            [discussionId]: !prev[discussionId],
        }));
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner">Učitavanje...</div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <div className="discussion-list">
                {discussions.map((discussion) => (
                    <div key={discussion.id} className="discussion-item">
                        <h3>{discussion.naslov}</h3>
                        <p><strong>Kreator:</strong> {discussion.kreator}</p>
                        <div className="DatumIme">
                            <p>Datum kreiranja: {new Date(discussion.datum_stvoreno).toLocaleDateString()}</p>
                            <p>Datum isteka: {new Date(discussion.datum_isteko).toLocaleDateString()}</p>
                        </div>

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
                                            name={`vote_${discussion.id}`}
                                            value="da"
                                            checked={selectedVotes[discussion.id] === 'da'}
                                            onChange={() => handleRadioChange(discussion.id, 'da')}
                                            disabled={hasVoted[discussion.id]}
                                        />
                                        Da
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`vote_${discussion.id}`}
                                            value="ne"
                                            checked={selectedVotes[discussion.id] === 'ne'}
                                            onChange={() => handleRadioChange(discussion.id, 'ne')}
                                            disabled={hasVoted[discussion.id]}
                                        />
                                        Ne
                                    </label>
                                    <button
                                        className="submit-vote-button"
                                        onClick={() => handleVoteSubmit(discussion.id, selectedVotes[discussion.id])}
                                        disabled={!selectedVotes[discussion.id] || hasVoted[discussion.id]}
                                    >
                                        Pošaljite glas
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            className="toggle-info-button"
                            onClick={() => toggleInfo(discussion.id)}
                        >
                            {expandedInfo[discussion.id] ? 'Sakrij dodatne informacije' : 'Prikaži dodatne informacije'}
                        </button>

                        {expandedInfo[discussion.id] && (
                            <div className="additional-info">
                                <p>Ovo su dodatne informacije o diskusiji: {discussion.opis || 'Nema dodatnih informacija.'}</p>
                            </div>
                        )}

                        <hr className="discussion-separator" />
                    </div>
                ))}
            </div>
            <Link to="/Upit" className="navigation-button">+</Link>
            <button className="archive-button">Arhiva</button>
        </div>
    );
}
