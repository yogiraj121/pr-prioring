import { Link } from "react-router-dom";
import Chatbot from "./Chatbot";
import { useState } from "react";
import { useChatCustomization } from "../context/ChatCustomizationContext";
import Header from "./LandingPage/Header";
import Hero from "./LandingPage/Hero";
import Companies from "./LandingPage/Companies";
import Hero2 from "./LandingPage/Hero2";
import Payment from "./LandingPage/Payment";
import Footer from "./LandingPage/Footer";
import eclipse from "../../public/images/Ellipse 5.png";
import "../styles/Landin.css";
// Add styles for chat widget

// Add landing page styles

const LandingPageWithChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useChatCustomization();

  return (
    <>
      <div className="landing-container">
        <Header />
        <Hero />
        <Companies />
        <Hero2 />
        <Payment />
        <Footer />
      </div>
      <div className="chat-widget">
        {!isOpen && settings?.welcomeMessage && (
          <div className="welcome-message-bubble">
            <div className="welcome-message-content">
              <div className="welcome-message-avatar">
                <img src={eclipse} alt="eclipse" />
              </div>
              <div className="welcome-message-text">
                {settings.welcomeMessage}
              </div>
            </div>
          </div>
        )}
        <Chatbot isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    </>
  );
};

// Add styles to document

export default LandingPageWithChatbot;
