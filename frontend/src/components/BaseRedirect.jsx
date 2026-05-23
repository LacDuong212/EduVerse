import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const FUN_EMOJIS = ["🚀", "✨", "🤩", "🐶", "🎉", "🌟", "🔥", "🤯", "🛸", "🍕", "🦄", "🛹", "🐱", "💃", "👾", "🐔", "🌈"];
const BOOTSTRAP_VARIANTS = ["danger", "orange", "warning", "pistachio", "success", "info", "primary", "indigo", "pink"];

const BaseRedirect = () => {
  const navigate = useNavigate();
  
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);

  useEffect(() => {
    const partyInterval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % FUN_EMOJIS.length);
      setVariantIndex((prev) => (prev + 1) % BOOTSTRAP_VARIANTS.length);
    }, 500);

    const redirectTimeout = setTimeout(() => {
      navigate("/home", { replace: true });
    }, 1000); 

    return () => {
      clearInterval(partyInterval);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  const currentVariant = BOOTSTRAP_VARIANTS[variantIndex];

  return (
    <div 
      className="d-flex flex-column align-items-center justify-content-center vh-100"
      style={{ minHeight: "100vh", position: "fixed", top: 0, left: 0, width: "100%", zIndex: 9999 }}
    >
      <div className="text-center p-4">
        <div 
          className="mb-4"
          style={{ 
            fontSize: "6rem", 
            lineHeight: 1,
            transform: "scale(1.1)",
            transition: "transform 0.1s ease-in-out"
          }}
        >
          {FUN_EMOJIS[emojiIndex]}
        </div>
        
        <h3 className={`fw-black mb-1 text-${currentVariant}`} style={{ transition: "color 0.1s ease" }}>
          HOLD ON TO YOUR SEAT!
        </h3>
        <p className="mb-4">Redirecting your session safely...</p>
        
        <div className="d-flex justify-content-center gap-2">
          <Spinner animation="grow" variant={currentVariant} size="sm" />
          <Spinner animation="grow" variant={BOOTSTRAP_VARIANTS[(variantIndex + 1) % BOOTSTRAP_VARIANTS.length]} size="sm" />
          <Spinner animation="grow" variant={BOOTSTRAP_VARIANTS[(variantIndex + 2) % BOOTSTRAP_VARIANTS.length]} size="sm" />
        </div>
        
      </div>
    </div>
  );
};

export default BaseRedirect;