import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";
import "codemirror/theme/dracula.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/solarized.css";
import "codemirror/theme/material.css";
import "codemirror/theme/3024-day.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/search/search";
import "codemirror/addon/search/searchcursor";
import "codemirror/addon/dialog/dialog";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";
import { useTheme } from "../context/ThemeContext";

function Editor({ socketRef, roomId, onCodeChange, editorRef, clients, username }) {
  const { theme } = useTheme();
  const editorInstanceRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: theme.editorTheme || "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          lineWrapping: true,
          indentUnit: 2,
          tabSize: 2,
          extraKeys: {
            "Ctrl-Space": "autocomplete",
          },
        }
      );

      editorInstanceRef.current = editor;
      if (editorRef) {
        editorRef.current = editor;
      }

      editor.setSize(null, "100%");

      editor.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (editorInstanceRef.current && theme) {
      editorInstanceRef.current.setOption("theme", theme.editorTheme || "dracula");
    }
  }, [theme]);

  // Receive code changes from server
  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && editorInstanceRef.current) {
          const cursor = editorInstanceRef.current.getCursor(); // Save cursor position
          editorInstanceRef.current.setValue(code);
          editorInstanceRef.current.setCursor(cursor); // Restore cursor position
        }
      });
    }
    return () => {
      socket?.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  // Cursor Tracking Logic
  const markersRef = useRef({}); // Store markers by socketId

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !editorInstanceRef.current) return;

    const editor = editorInstanceRef.current;

    // 1. Emit local cursor moves
    const handleCursorActivity = () => {
      const cursor = editor.getCursor();
      socket.emit(ACTIONS.CURSOR_MOVE, {
        roomId,
        position: { line: cursor.line, ch: cursor.ch },
        username // Send username for remote clients
      });
    };

    editor.on("cursorActivity", handleCursorActivity);

    // 2. Handle remote cursor moves
    const handleRemoteCursor = ({ position, socketId, username }) => {
      if (!position) return;

      // Remove existing marker for this user if it exists
      if (markersRef.current[socketId]) {
        markersRef.current[socketId].clear();
      }

      // Create cursor widget
      const cursorColor = clients.find(c => c.socketId === socketId)?.color || '#ffcc00';

      const cursorWidget = document.createElement('div');
      cursorWidget.className = 'remote-caret';
      cursorWidget.style.borderLeftColor = cursorColor;

      const label = document.createElement('div');
      label.className = 'remote-caret-label';
      label.style.backgroundColor = cursorColor;
      label.innerText = username;
      cursorWidget.appendChild(label);

      // Add bookmark to editor
      const marker = editor.setBookmark(position, { widget: cursorWidget });
      markersRef.current[socketId] = marker;
    };

    socket.on(ACTIONS.CURSOR_MOVE, handleRemoteCursor);

    // Cleanup when user leaves
    const handleUserLeft = ({ socketId }) => {
      if (markersRef.current[socketId]) {
        markersRef.current[socketId].clear();
        delete markersRef.current[socketId];
      }
    };
    socket.on(ACTIONS.DISCONNECTED, handleUserLeft);

    return () => {
      editor.off("cursorActivity", handleCursorActivity);
      socket.off(ACTIONS.CURSOR_MOVE);
      socket.off(ACTIONS.DISCONNECTED, handleUserLeft);
    };
  }, [socketRef.current, clients, roomId, username]);

  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      <textarea id="realtimeEditor"></textarea>
    </div>
  );
}

export default Editor;