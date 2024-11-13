import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Main() {
    const [discussions, setDiscussions] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [userVotes, setUserVotes] = useState({});
    const [selectedVotes, setSelectedVotes] = useState({});
    const [hasVoted, setHasVoted] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch user email from session
    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const response = await axios.get('https://a10c1e80c4ce.ngrok.app/glasanje/userEmail', {
                    withCredentials: true,
                });
                setUserEmail(response.data.email);
            } catch (error) {
                console.error('Error fetching user email:', error);
            }
        };

        fetchUserEmail();
    }, []);

    // Fetch discussions from backend
    useEffect(() => {
        const fetchDiscussions = async () => {
            try {
                setLoading(true); // Set loading to true before starting data fetch
                const response = await axios.get('https://a10c1e80c4ce.ngrok.app/glasanje/discussions');
                setDiscussions(response.data);
            } catch (error) {
                console.error('Error fetching discussions:', error);
                setLoading(false);
            }
        };

        fetchDiscussions();
    }, []);

    // Check if user has voted for each discussion
    useEffect(() => {
        if (userEmail && discussions.length > 0) {
            const checkUserVotes = async () => {
                const votes = {};
                const votedDiscussions = {};

                for (let discussion of discussions) {
                    const response = await axios.get(`https://a10c1e80c4ce.ngrok.app/glasanje/userVote`, {
                        params: { email: userEmail, discussionId: discussion.id },
                        withCredentials: true,
                    });
                    if (response.data.voted) {
                        votes[discussion.id] = response.data.vote;
                        votedDiscussions[discussion.id] = true;
                    }
                }

                setUserVotes(votes);
                setHasVoted(votedDiscussions);
                setLoading(false); // Set loading to false after the check is complete
            };

            checkUserVotes();
        }
    }, [userEmail, discussions]); // Trigger after userEmail and discussions are fetched

    const handleVoteSubmit = async (discussionId, vote) => {
        if (!userEmail) {
            alert('You must be logged in to vote');
            return;
        }

        try {
            const response = await axios.post('https://a10c1e80c4ce.ngrok.app/glasanje', {
                userId: userEmail,
                discussionId,
                vote,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

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
            console.error('Error submitting vote:', error);
        }
    };

    const handleRadioChange = (discussionId, value) => {
        setSelectedVotes((prevSelectedVotes) => ({
            ...prevSelectedVotes,
            [discussionId]: value,
        }));
    };

    if (loading) {
        return <div className="loading-screen">Loading...</div>; // Show loading screen while data is being fetched
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
                                    <p>Vaš glas: {userVotes[discussion.id] === 'da' ? 'Da' : 'Ne'}</p>
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

                        <hr className="discussion-separator" />
                    </div>
                ))}
            </div>
            <Link to="/Upit" className="navigation-button">+</Link>
            <button className="archive-button">Arhiva</button>
        </div>
    );
}
