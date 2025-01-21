import React from 'react';


function Contact1() {
    return (
        <div className="contact-container">
            <h1 className="contact-header">Kontaktirajte nas ako imate bilo kakvih problema</h1>

            <p className="contact-description">
                Ako imate bilo kakvih pitanja, problema ili želite dodatne informacije, slobodno nas kontaktirajte putem
                dolje navedenih opcija. Naša ekipa će se potruditi da vam što prije odgovori.
            </p>

            <ul className="contact-list">
                <li className="contact-item">
                    <a href="/contact" className="contact-link">
                        <img className="contact-image" src={require('../assets/images/LC_hephaistos.jpg')} alt="Slika zgrade" />
                    </a>
                    <p className="contact-info">
                        <a href="/contact" className="contact-link">Kontakt informacije o zgradama</a>
                    </p>
                </li>
                <li className="contact-item">
                    <a href="/contact" className="contact-link">
                        <img className="contact-image" src={require('../assets/images/easyflatLogo.png')} alt="Slika firme" />
                    </a>
                    <p className="contact-info">
                        <a href="/contact" className="contact-link">Kontakt informacije o našoj firmi</a>
                    </p>
                </li>
            </ul>
        </div>
    );
}

export default Contact1;