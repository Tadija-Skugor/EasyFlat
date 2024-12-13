import { useEffect } from "react";
import './Footer.css'; // Import the CSS file

export default function Footer() {
    const adjustFooterPosition = () => {
        const contentHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        const footer = document.querySelector(".footer");

        if (contentHeight < viewportHeight) {
            footer.style.position = "fixed";
            footer.style.bottom = "0";
            footer.style.width = "100%";

            // Add bottom padding to the body to ensure no overlap
            document.body.style.paddingBottom = `${footer.offsetHeight}px`;
        } else {
            footer.style.position = "static";
            document.body.style.paddingBottom = "0";
        }
    };

    useEffect(() => {
        adjustFooterPosition();
        window.addEventListener("resize", adjustFooterPosition);

        return () => window.removeEventListener("resize", adjustFooterPosition);
    }, []);

    return (
        <div className="footer">
            <p>@EasyFlat FER 2024.</p>
        </div>
    );
}
