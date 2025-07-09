import { useEffect, useState } from 'react';

const messages = [
  'Authenticating user session...',
  'Initializing components...',
  'Syncing with cloud services...',
  'Loading personalized content...',
  'Finalizing secure handshake...',
  'Almost there...'
];

export default function Loader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader-container">
      <svg className="ring" viewBox="25 25 50 50">
        <circle className="ring-circle" cx="50" cy="50" r="20" />
      </svg>

      <p className="loader-message">{messages[messageIndex]}</p>

      <style jsx>{`
        .loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;

  /* ✅ Realistic, modern blur effect */
  backdrop-filter: blur(0.7px) saturate(180%);
  -webkit-backdrop-filter: blur(0.7px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.4); /* Soft glass look */

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease-in-out;
}
.loader-container {
  opacity: 1;
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}


        .ring {
          width: 60px;
          height: 60px;
          animation: rotate 2s linear infinite;
          margin-bottom: 20px;
          color: 	#4285F4; 
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .ring-circle {
          fill: none;
           stroke: #34A853; 
          stroke-width: 4;
          stroke-dasharray: 1, 200;
          stroke-dashoffset: 0;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }

        .loader-message {
          font-size: 1.05rem;
          color: #555;
          text-align: center;
          animation: fadeIn 0.4s ease;
        }

        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dash {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
