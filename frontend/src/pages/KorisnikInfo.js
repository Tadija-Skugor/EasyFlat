import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProfPrev({ info }) {
    return (
        <div className='prof_card'>
            <img src={info.slika} alt="Profile" />
            <div className='prof_title'>{info.ime}</div>
            <div className='prof_status'>{info.status}</div>
            <div>{info.email}</div>
            <div>{info.telefon}</div>
            <div>Stan {info.stanBr}</div>
        </div>
    );
}

function ProfPodat({ info }) {
    return (
        <div className='prof_data'>
            <div className ='prof_title'>Podatci o Korisniku</div>
            <div>Ime i Prezime</div>
            <div>{info.ime}</div>
            <div>Status</div>
            <div>{info.status}</div>
            <div>E Pošta</div>
            <div>{info.email}</div>
            <div>Stan</div>
            <div>{info.stanBr}</div>
            <button className='prof_uredi'>Uredi</button>
        </div>
    );
}

function Profil({ info }) {
    return (
        <div className='prof_contain'>
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
