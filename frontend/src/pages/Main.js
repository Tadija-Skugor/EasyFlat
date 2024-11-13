import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const discussionsData = [
    {
        id: 1,
        title: "Popravak brave",
        body: "Zadnjih par dana imam problema sa bravom na glavnom ulazu, zanima me je li još netko primejtio problem.",
        date: "2024-10-24",
        name: "Luka Horvat",
        votes: { yes: 0, no: 0 }, 
    },
    {
        id: 2,
        title: "Slavlje 27.10.",
        body: "Ispračavam se unaprijed zbog buke koja će biti 27.10.",
        date: "2024-10-23",
        name: "Ana Kovač",
        votes: { yes: 0, no: 0 }, 
    },
];

export default function Main() {
    const [discussions, setDiscussions] = useState(discussionsData);
    const [selectedVote, setSelectedVote] = useState(null);
    const [hasVoted, setHasVoted] = useState({}); 

    const handleVoteChange = (e) => {
        setSelectedVote(e.target.value);
    };

    const handleVoteSubmit = (discussionId) => {
        if (selectedVote) {
            setDiscussions(prevDiscussions => 
                prevDiscussions.map(discussion => {
                    if (discussion.id === discussionId) {
                        return {
                            ...discussion,
                            votes: {
                                ...discussion.votes,
                                [selectedVote]: discussion.votes[selectedVote] + 1, 
                            },
                        };
                    }
                    return discussion;
                })
            );

            setHasVoted(prevState => ({
                ...prevState,
                [discussionId]: true, 
            }));

            setSelectedVote(null); 
        }
    };

    return (
        <div className="main-container">
            <div className="discussion-list">
                {discussions.map(discussion => (
                    <div key={discussion.id} className="discussion-item">
                        <h3>{discussion.title}</h3>
                        <p>{discussion.body}</p>
                        <div className='DatumIme'>
                           <small>{discussion.name}</small>
                           <small>{discussion.date}</small>
                        </div>


                        <div className="voting-box">
                            <h4>Slažete li se?</h4>
                            {hasVoted[discussion.id] ? ( 
                                <div className="vote-results">
                                    <p>Yes: {discussion.votes.yes}</p>
                                    <p>No: {discussion.votes.no}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                value="yes"
                                                checked={selectedVote === 'yes'}
                                                onChange={handleVoteChange}
                                            />
                                            Yes
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                value="no"
                                                checked={selectedVote === 'no'}
                                                onChange={handleVoteChange}
                                            />
                                            No
                                        </label>
                                    </div>
                                    <button onClick={() => handleVoteSubmit(discussion.id)} className="vote-button">
                                        Glasaj
                                    </button>
                                </>
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
