import axios from "axios";
import React, { useState, useEffect } from 'react';

export default function Main(){
    const [discussions, setDiscussions] = useState([]);
    const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState('');

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

    const toggleResponsesVisibility = (discussionId) => {
        if (selectedDiscussionId === discussionId) {
            setSelectedDiscussionId(null);
            setResponses(''); 
        } else {
            fetchResponses(discussionId);
        }
    };

    const fetchResponses = async (discussionId) => {
            try {
                const response = await axios.get('http://localhost:4000/archive/archivedResponses', {
                    params: { id_diskusije: discussionId },
                },                {withCredentials: true} 
            );
    
                // spremi sve odgovore u wrapper element 'odgovori' kako bi parseFromString kod radio ispravno
                const wrappedXmlString = `<odgovori>${response.data.odgovori}</odgovori>`;
    
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
                        <><><div className="forma-section">
                            <h4><strong></strong> {discussion.naslov_glasanja}</h4>
                            <p><strong>Glasova 'Da':</strong> {discussion.glasovi_da}</p>
                            <p><strong>Glasova 'Ne':</strong> {discussion.glasovi_ne}</p>
                        </div>
                            <button onClick={() => toggleResponsesVisibility(discussion.id)}>
                                {selectedDiscussionId === discussion.id ? 'Sakrij odgovore' : 'Vidi odgovore'}
                            </button></><div>
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
                                    <p>Nema odgovora.</p>
                                )}
                            </div>
                        )}
                            </div></>
                    )}
                </div>
            ))}
        </div></>
    );
}