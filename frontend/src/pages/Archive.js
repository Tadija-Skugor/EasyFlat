import axios from "axios";
import React, { useState, useEffect } from 'react';

export default function Main(){
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchArchivedDiscussion = async () => {
        try{
            const response = await axios.get('http://localhost:4000/archive/allArchived', {
                withCredentials: true,  // Ensures cookies are sent with the request if needed
            });
            setDiscussions(response.data);
        } catch (error) {
            console.error('Error fetching discussions:', error);
            //setError('Failed to fetch discussions');
        } finally {
            setLoading(false);
        }
        
    };

    useEffect(() => {
        fetchArchivedDiscussion();
      }, []);

    return(
        <><h1>Arhivirane diskusije:</h1>
        <div className="archive-wrapper">
            {discussions.map((discussion) => (
                <div key={discussion.id} className="discussion-box">
                    <h3>{discussion.naslov}</h3>
                    <p><strong>Autor:</strong> {discussion.kreator}</p>
                    <p><strong>Opis:</strong> {discussion.opis}</p>
                    <p><strong>Datum objavljeno:</strong> {new Date(discussion.datum_stvorena).toLocaleDateString()}</p>
                    {discussion.naslov_glasanja && (
                        <div className="forma-section">
                            <h4><strong></strong> {discussion.naslov_glasanja}</h4>
                            <p><strong>Glasova 'Da':</strong> {discussion.glasovi_da}</p>
                            <p><strong>Glasova 'Ne':</strong> {discussion.glasovi_ne}</p>
                        </div>
                    )}
                </div>
            ))}
        </div></>
    );
}