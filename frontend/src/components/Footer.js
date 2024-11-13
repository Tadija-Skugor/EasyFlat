import { useLayoutEffect } from "react";

export default function Footer() {
    
    const adjustFooterPosition = () => {
        const contentHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        const footer = document.querySelector(".footer");

        if (contentHeight < viewportHeight) {
            footer.style.position = "fixed";
            footer.style.bottom = "0";
            footer.style.width = "98%";
        } else {
            footer.style.position = "static";
            footer.style.marginTop = "20px";
        }
    };

    useLayoutEffect(() => {
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
