'use client'
import React, { useState, useEffect } from 'react';

const messages = [
  "    First, complete your verification.",
  "   Then, move on to login.",
  "   Watch the videos and earn money!",
];

const colors = ["text-yellow-400", "text-blue-500", "text-red-600"];

const TypewriterPage = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let message = messages[messageIndex];
    let i = 0;
    setDisplayedText(''); // Clear the previous message before starting a new one
    const interval = setInterval(() => {
      if (i < message.length) {
        setDisplayedText((prev) => prev + message[i]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setMessageIndex((prev) => (prev + 1) % messages.length); // Cycle through messages
        }, 1000);
      }
    }, 100);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [messageIndex]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 sm:px-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          <span className={`${colors[messageIndex]} text-5xl font-extrabold`}>
            {displayedText}
          </span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-200">
          Register your account as needed..!
        </p>
      </div>
    </div>
  );
};


export default TypewriterPage;
