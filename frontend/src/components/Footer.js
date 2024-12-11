import { useLayoutEffect, useState } from "react";

export default function Footer() {
    const [footerStyle, setFooterStyle] = useState({
        position: "static",
        marginTop: "20px",
        width: "100%",
        textAlign: "center",
        backgroundColor: "#f1f1f1",
        padding: "10px 0",
    });

    const adjustFooterPosition = () => {
        const contentHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;

        if (contentHeight <= viewportHeight) {
            setFooterStyle((prevStyle) => ({
                ...prevStyle,
                position: "fixed",
                bottom: "0",
                marginTop: "0",
            }));
        } else {
            setFooterStyle((prevStyle) => ({
                ...prevStyle,
                position: "static",
                marginTop: "20px",
            }));
        }
    };

    useLayoutEffect(() => {
        adjustFooterPosition();
        window.addEventListener("resize", adjustFooterPosition);

        return () => window.removeEventListener("resize", adjustFooterPosition);
    }, []);

    return (
        <div style={footerStyle}>
            <p>@EasyFlat FER 2024.</p>
        </div>
    );
}
