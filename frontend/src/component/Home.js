import React, { useState, useMemo } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Home.css";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // Memoize stars metadata to prevent re-render on typing
  const stars = useMemo(() => {
    return [...Array(50)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      transform: `scale(${Math.random()})`,
    }));
  }, []);

  // Memoize meteors metadata
  const meteors = useMemo(() => {
    return [...Array(25)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 10 + 10}s`,
    }));
  }, []);

  const generateRoomId = () => {
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room ID generated!");
  };

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      toast.error("Both fields are required!");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
    toast.success("Joined successfully!");
  };

  const handleEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="home-page">
      {/* Space Background Layer */}
      <div className="space-background">
        {/* Background Planet Image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(/images/planet1.avif)`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            opacity: 0.2, // 20% opacity as requested
            pointerEvents: 'none',
            zIndex: -1, // Ensure it's behind everything
          }}
        />
        {/* Stars */}
        {stars.map((style, i) => (
          <span key={i} className="star" style={style}></span>
        ))}
        {/* Planets */}
        <div className="planet planet-lg"></div>
        <div className="planet planet-sm"></div>
      </div>

      {/* Meteor Animation */}
      <div className="meteor-container">
        {meteors.map((style, i) => (
          <span key={i} style={style}></span>
        ))}
      </div>

      {/* Main content */}
      <motion.div
        className="home-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo and title */}
        <motion.div
          className="home-header"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <motion.h1
            className="home-title"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: {
                  delay: 0.5,
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {Array.from("Code-Colab").map((letter, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>
          <p className="home-subtitle">Real-time Collaborative Code Editor</p>
        </motion.div>

        {/* Form card */}
        <motion.div
          className="home-card glass-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <div className="input-group">
            <label className="input-label" htmlFor="roomId">Room ID</label>
            <input
              type="text"
              id="roomId"
              className="glass-input"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleEnter}
            />
          </div>

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="glass-input"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleEnter}
            />
          </div>

          <motion.button
            onClick={joinRoom}
            className="btn-gradient join-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Join Room
          </motion.button>

          <div className="divider">
            <span>or</span>
          </div>

          {/* <button onClick={generateRoomId} className="btn-glass generate-btn">
            Generate New Room ID
          </button> */}
          <motion.button
            onClick={generateRoomId}
            className="btn-gradient join-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Generate New Room ID
          </motion.button>
        </motion.div>

        {/* Features */}
        <motion.div
          className="home-features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {/* <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <span>Real-time Sync</span>
          </div>
          // Removed Chat and Themes as requested 
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <span>Code Execution</span>
          </div> */}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;
