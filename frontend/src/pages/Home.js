import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();

    const fetchSearchResults = async (query) => {
        try {
            setLoading(true);
            setError(null);

            const url = query
                ? `http://localhost:4000/fetchDiscusion/search` // FETCH ZA FILTER, ISTO RUTER
                : `http://localhost:4000/fetchDiscusion/all`;   //FETCH ZA SVE, TO CEMO U RUTER

            const response = await axios.get(url, {
                params: query ? { query } : {}, //salji sam u 1. slucaju ako je search
            });

            setSearchResults(response.data);
        } catch (err) {
            setError(
                `Fali backend za rezultat; ${
                    query ? `Upit koji je poslan je ovaj: ${query}` : "Svi rezultati nisu dostupni"
                }`
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search_query');

        // Fetch funkcija, na njoj radimo
        fetchSearchResults(searchQuery);
    }, [location.search]);

    return (
        <div>
            <h1>HOME STRANICA</h1>
            <p>
                Ovdje ce se nalaziti naša početna home stranica. U njoj ce biti diskusije.<br />
                Neki message board i voting sustav
            </p>

            {loading ? (
                <p>Loading search results...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <ul>
                    {searchResults.map((result, index) => (
                        <li key={index}>{result}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
