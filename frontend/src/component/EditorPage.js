import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import { useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";
import SearchPanel from "./SearchPanel";
import SnippetsPanel from "./SnippetsPanel";
import {
  FaCopy, FaSignOutAlt, FaPlay,
  FaPalette, FaSearch, FaCode, FaEraser
} from "react-icons/fa";
import Split from 'react-split';
import "./EditorPage.css";

// List of supported languages
const LANGUAGES = ["python3", "java", "cpp14", "cpp17", "c"];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [activePanel, setActivePanel] = useState(null); // 'theme', 'search', 'snippets'

  const codeRef = useRef(null);
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  // Function to generate a unique color based on username
  const generateColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`; // Brighter colors for better visibility
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== Location.state?.username) {
          toast.success(`${username} joined the room.`);
        }
        const updatedClients = clients.map((client) => ({
          ...client,
          color: generateColor(client.username),
        }));
        setClients(updatedClients);

        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });

      // Listen for synced output
      socketRef.current.on(ACTIONS.SYNC_OUTPUT, ({ output }) => {
        setOutput(output);
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
      socketRef.current?.off(ACTIONS.SYNC_OUTPUT);
    };
  }, []);

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID copied!`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const runCode = async () => {
    if (!codeRef.current) {
      toast.error("No code to compile!");
      return;
    }

    setIsCompiling(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/compile`, {
        code: codeRef.current,
        language: selectedLanguage.toLowerCase(),
        method: "jdoodle",
      });

      const newOutput = response.data.output || "No output received";
      setOutput(newOutput);

      // Broadcast output to room
      socketRef.current.emit(ACTIONS.SYNC_OUTPUT, {
        roomId,
        output: newOutput
      });

      toast.success("Code executed successfully!");
    } catch (error) {
      console.error("Error compiling code:", error);
      const errorOutput = error.response?.data?.error || "An error occurred while compiling.";
      setOutput(errorOutput);

      // Broadcast error too
      socketRef.current.emit(ACTIONS.SYNC_OUTPUT, {
        roomId,
        output: errorOutput
      });

      toast.error("Compilation failed!");
    } finally {
      setIsCompiling(false);
    }
  };

  const clearOutput = () => {
    setOutput("");
    socketRef.current.emit(ACTIONS.SYNC_OUTPUT, {
      roomId,
      output: ""
    });
  };

  const insertSnippet = (code) => {
    if (editorRef.current) {
      const cursor = editorRef.current.getCursor();
      editorRef.current.replaceRange(code, cursor);
      editorRef.current.focus();
    }
  };

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  return (
    <div className="editor-page">
      {/* Header / Navbar */}
      <header className="editor-header glass-card">
        <div className="header-left">
          <img src="/images/codecolab.jpeg" alt="Logo" className="header-logo" />
          <button
            className="btn-gradient"
            onClick={copyRoomId}
            title="Copy Room ID"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaCopy /> Copy Room ID
          </button>
        </div>

        <div className="header-center">
        </div>

        <div className="header-right">
          <button className="btn-glass leave-btn" onClick={leaveRoom}>
            <FaSignOutAlt /> Leave
          </button>
          <div className="user-avatar-small" style={{ background: generateColor(Location.state?.username) }}>
            {clients.find(client => client.username === Location.state?.username)?.memberId || Location.state?.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <Split
        className="editor-main-layout split-horizontal"
        sizes={[20, 80]}
        minSize={200}
        expandToMin={false}
        gutterSize={8}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
      >
        {/* Left Sidebar - Members */}
        <div className="editor-sidebar glass-card" style={{ overflow: 'hidden' }}>
          <h3 className="members-title">Members</h3>
          <div className="members-list">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} color={client.color} memberId={client.memberId} />
            ))}
          </div>
        </div>

        {/* Center - Editor & Terminal Split View */}
        <div className="editor-workspace" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Action Bar within Workspace */}
          <div className="workspace-toolbar glass-card" style={{ flexShrink: 0 }}>
            <div className="toolbar-left-group">
              <div className="lang-select-wrapper">
                <select
                  className="glass-input language-select"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Toolbar Actions */}
              <div className="toolbar-actions">
                <button
                  className={`btn-glass toolbar-btn icon-only ${activePanel === 'theme' ? 'active' : ''}`}
                  onClick={() => togglePanel('theme')}
                  title="Change Theme"
                >
                  <FaPalette />
                </button>
                <button
                  className={`btn-glass toolbar-btn ${activePanel === 'search' ? 'active' : ''}`}
                  onClick={() => togglePanel('search')}
                  title="Search & Replace"
                >
                  <FaSearch /> <span>Search</span>
                </button>
                <button
                  className={`btn-glass toolbar-btn ${activePanel === 'snippets' ? 'active' : ''}`}
                  onClick={() => togglePanel('snippets')}
                  title="Code Snippets"
                >
                  <FaCode /> <span>Snippets</span>
                </button>
              </div>
            </div>

            <button
              className="btn-gradient run-btn"
              onClick={runCode}
              disabled={isCompiling}
            >
              <FaPlay /> {isCompiling ? "Running..." : "Run Code"}
            </button>
          </div>

          <Split
            className="split-view split-horizontal"
            sizes={[60, 40]}
            minSize={100}
            expandToMin={false}
            gutterSize={8}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
            style={{ display: 'flex', flexDirection: 'row', height: '100%' }}
          >
            {/* Code Editor */}
            <div className="editor-pane glass-card">
              <Editor
                socketRef={socketRef}
                roomId={roomId}
                onCodeChange={(code) => {
                  codeRef.current = code;
                }}
                editorRef={editorRef}
                clients={clients}
                username={Location.state?.username}
              />
            </div>

            {/* Output Terminal */}
            <div className="terminal-pane glass-card">
              <div className="terminal-header">
                <h4>Terminal Output</h4>
                <button
                  className="btn-glass toolbar-btn"
                  onClick={clearOutput}
                  title="Clear Output"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                >
                  <FaEraser /> <span>Clear</span>
                </button>
              </div>
              <div className="terminal-content">
                <pre>{output || 'Click "Run Code" to see output here...'}</pre>
              </div>
            </div>
          </Split>
        </div>
      </Split>

      {/* Floating/Overlay Panels - Controlled by Toolbar */}
      <AnimatePresence>
        {activePanel === 'theme' && (
          <div className="overlay-panel theme-overlay">
            <ThemeSwitcher isOpen={true} onClose={() => setActivePanel(null)} />
          </div>
        )}
        {activePanel === 'search' && (
          <div className="overlay-panel search-overlay">
            <SearchPanel editorRef={editorRef} isOpen={true} onClose={() => setActivePanel(null)} />
          </div>
        )}
        {activePanel === 'snippets' && (
          <div className="overlay-panel snippets-overlay">
            <SnippetsPanel onInsertSnippet={insertSnippet} isOpen={true} onClose={() => setActivePanel(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EditorPage;
