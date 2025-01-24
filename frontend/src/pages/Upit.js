import { useState, useEffect } from "react";
import axios from "axios";
import './Upit.css';

export default function Upit() {
    const [email, setEmail] = useState('');
    const [poruka, setPoruka] = useState('');
    const [error, setError] = useState('');
    const [selectData, setSelectData] = useState([]);
    const [selectValue, setSelectValue] = useState('');
    const [protectedData, setProtectedData] = useState(null);

    useEffect(() => {
        let processing = true;
        axiosFetchData(processing);
        fetchProtectedData();
        return () => { processing = false; }
    }, []);

    const axiosFetchData = async (processing) => {
        try {
            const response = await axios.get('https://be30c39fc6db.ngrok.app/users', {
                withCredentials: true,
            });

            if (processing) {
                setSelectData(response.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const fetchProtectedData = async () => {
        try {
            const response = await axios.get('https://be30c39fc6db.ngrok.app/protected', {
                withCredentials: true,
            });
            setProtectedData(response.data);
        } catch (error) {
            console.error("Error fetching protected data:", error);
        }
    };


    const axiosPostData = async () => {
        const postData = {
            email: email,
            website: selectValue,
            poruka: poruka
        };
        await axios.post('https://be30c39fc6db.ngrok.app/contact', postData, {
            withCredentials: true
        })
        .then(res => setError(<p className="success">{res.data}</p>))
        .catch(err => {
            console.error("Error submitting data:", err);
            if (err.response && err.response.status === 401) {
                setError(<p className="error">Unauthorized: You must log in first.</p>);
            } else {
                setError(<p className="error">Something went wrong. Please try again.</p>);
            }
        });
    };

    const posao = (e) => {
        e.preventDefault();
        if (!poruka) {
            setError(<p className="required">Poruka ne smije biti prazna</p>);
        } else {
            setError('');
            axiosPostData();
        }
    };

    return (
        <>
            <h1 className="form-header">Forma za obavijesti</h1>
            <form className="kontakt-forma" onSubmit={posao}>
                <label>Naslov</label>
                <input type="text" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label>Poruka</label>
                <textarea id="poruka" name="poruka" value={poruka} onChange={(e) => setPoruka(e.target.value)} required></textarea>

                {error}

                <button type="submit">Pošaljite</button>
            </form>

            { /*{protectedData && (
                <div>
                    <h2>Protected Data:</h2>
                    <pre>{JSON.stringify(protectedData, null, 2)}</pre>
                </div>
            )}*/ }
            
            
        </>
    );
}
