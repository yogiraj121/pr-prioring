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
// Add styles for chat widget
const chatStyles = `
  .chat-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .chat-toggle-btn {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: #1a365d;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.2s ease;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .chat-toggle-btn:hover {
    transform: scale(1.05);
    background: #2c5282;
  }

  .chat-container {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 320px;
    height: 450px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 5px 25px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .chat-header {
    padding: 12px 16px;
    background: #1a365d;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  .chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    background: #f8f9fa;
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
    height: calc(100% - 120px);
  }

  .chat-messages {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: min-content;
  }

  .chat-form-container {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .chat-form-container h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #1a365d;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    color: #4a5568;
    font-size: 12px;
  }

  .form-group input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    transition: border-color 0.2s ease;
  }

  .form-group input:focus {
    outline: none;
    border-color: #1a365d;
  }

  .chat-input-container {
    padding: 10px;
    background: white;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .chat-input {
    flex: 1;
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    transition: border-color 0.2s ease;
  }

  .chat-input:focus {
    outline: none;
    border-color: #1a365d;
  }

  .send-button {
    width: 32px;
    height: 32px;
    background: #1a365d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
  }

  .send-button:hover {
    background: #2c5282;
  }

  .send-button:disabled {
    background: #e2e8f0;
    cursor: not-allowed;
  }

  .submit-button {
    width: 100%;
    padding: 8px 12px;
    background: #1a365d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.2s ease;
  }

  .submit-button:hover {
    background: #2c5282;
  }

  .submit-button:disabled {
    background: #e2e8f0;
    cursor: not-allowed;
  }

  .message {
    max-width: 80%;
    padding: 10px 14px;
    margin-bottom: 8px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.4;
  }

  .message.user {
    background: #1a365d;
    color: white;
    margin-left: auto;
    border-bottom-right-radius: 4px;
  }

  .message.bot {
    background: #f1f5f9;
    color: #1a365d;
    margin-right: auto;
    border-bottom-left-radius: 4px;
  }

  .message-time {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 4px;
    text-align: right;
  }

  @media (max-width: 768px) {
    .chat-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      border-radius: 0;
    }

    .chat-body {
      padding: 10px;
    }

    .chat-input-container {
      padding: 8px;
    }

    .chat-input {
      padding: 8px;
    }

    .send-button {
      width: 36px;
      height: 36px;
    }
  }

  .welcome-message-bubble {
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 12px;
    max-width: 300px;
    z-index: 999;
  }

  .welcome-message-content {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .welcome-message-avatar {
    width: 32px;
    height: 32px;
    background: #1a365d;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    flex-shrink: 0;
  }

  .welcome-message-text {
    font-size: 14px;
    line-height: 1.4;
    color: #333;
  }

  @media (max-width: 768px) {
    .welcome-message-bubble {
      bottom: 100px;
      right: 20px;
      max-width: calc(100% - 40px);
    }
  }
`;

// Add landing page styles
const landingStyles = `
  .landing-container {
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
  }

  @media (max-width: 768px) {
    .nav-header,
    .hero-section,
    .features-section,
    .cta-section {
      display: none !important;
    }

    .landing-container {
      background: #f5f5f5;
    }
  }

  .nav-header {
    background: #fff;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 100;
  }

  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #007bff;
    text-decoration: none;
  }

  .nav-buttons {
    display: flex;
    gap: 1rem;
  }

  .nav-button {
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
  }

  .login-btn {
    color: #007bff;
    border: 1px solid #007bff;
  }

  .signup-btn {
    background: #007bff;
    color: white;
    border: 1px solid #007bff;
  }

  .hero-section {
    padding: 8rem 2rem 4rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    text-align: center;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 3rem;
    color: #212529;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: #6c757d;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .features-section {
    padding: 4rem 2rem;
    background: #fff;
  }

  .features-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .feature-card {
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-5px);
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    color: #007bff;
  }

  .feature-title {
    font-size: 1.25rem;
    color: #212529;
    margin-bottom: 1rem;
  }

  .feature-description {
    color: #6c757d;
    line-height: 1.6;
  }

  .cta-section {
    padding: 4rem 2rem;
    background: #007bff;
    color: white;
    text-align: center;
  }

  .cta-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .cta-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .cta-button {
    display: inline-block;
    padding: 1rem 2rem;
    background: white;
    color: #007bff;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: transform 0.2s;
  }

  .cta-button:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .landing-content { display: none !important; }
  }
`;

const LandingPageWithChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useChatCustomization();

  return (
    <>
      <Header />
      <Hero />
      <Companies />
      <Hero2 />
      <Payment />
      <Footer />
      <div className="chat-widget">
        {!isOpen && settings?.welcomeMessage && (
          <div className="welcome-message-bubble">
            <div className="welcome-message-content">
              <div className="welcome-message-avatar">H</div>
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
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = chatStyles + landingStyles;
document.head.appendChild(styleSheet);

export default LandingPageWithChatbot;
