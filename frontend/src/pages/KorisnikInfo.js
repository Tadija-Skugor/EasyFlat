import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProfPrev({ info }) {
    return (
        <div id='card'>
            <img src={info.slika} alt="Profile" />
            <div id='title'>{info.ime}</div>
            <div id='status'>{info.status}</div>
            <div>{info.email}</div>
            <div>{info.telefon}</div>
            <div>Stan {info.stanBr}</div>
        </div>
    );
}

function ProfPodat({ info }) {
    return (
        <div id='data'>
            <div id='title'>Podatci o Korisniku</div>
            <div>Ime i Prezime</div>
            <div>{info.ime}</div>
            <div>Status</div>
            <div>{info.status}</div>
            <div>E Pošta</div>
            <div>{info.email}</div>
            <div>Stan</div>
            <div>{info.stanBr}</div>

            <button className='uredi'>Uredi</button>
        </div>
    );
}

function Profil({ info }) {
    return (
        <div id='contain'>
            <ProfPrev info={info} />
            <ProfPodat info={info} />
        </div>
    );
}

export default function KorsninkInfo() {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('http://localhost:4000/userInfo', {}, {
                    withCredentials: true
                });
                setInfo(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();
    }, []);

    if (!info) {
        return <div>Loading...</div>;
    }

    return <Profil info={info} />;
}
