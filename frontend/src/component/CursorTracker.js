import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './CursorTracker.css';

function CursorTracker({ socketRef, roomId, username, clients }) {
    const cursorsRef = useRef({});
    const localCursorTimeout = useRef(null);

    useEffect(() => {
        if (!socketRef.current) return;

        // Listen for cursor movements from other users
        socketRef.current.on('CURSOR_MOVE', ({ position, username: cursorUsername, socketId }) => {
            if (cursorUsername !== username) {
                cursorsRef.current[socketId] = {
                    username: cursorUsername,
                    position,
                    color: clients.find(c => c.socketId === socketId)?.color || '#667eea',
                };
                // Force re-render
                forceUpdate();
            }
        });

        return () => {
            socketRef.current?.off('CURSOR_MOVE');
        };
    }, [socketRef, username, clients]);

    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const handleEditorCursorMove = (editorInstance) => {
        if (!socketRef.current || !editorInstance) return;

        const cursor = editorInstance.getCursor();
        const coords = editorInstance.cursorCoords(cursor);

        clearTimeout(localCursorTimeout.current);
        localCursorTimeout.current = setTimeout(() => {
            socketRef.current.emit('CURSOR_MOVE', {
                roomId,
                username,
                position: {
                    line: cursor.line,
                    ch: cursor.ch,
                    left: coords.left,
                    top: coords.top,
                },
            });
        }, 100); // Throttle cursor updates
    };

    return (
        <div className="cursor-tracker">
            {Object.entries(cursorsRef.current).map(([socketId, cursor]) => (
                <motion.div
                    key={socketId}
                    className="remote-cursor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, x: cursor.position.left, y: cursor.position.top }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    style={{ borderColor: cursor.color }}
                >
                    <div className="cursor-label" style={{ background: cursor.color }}>
                        {cursor.username}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export default CursorTracker;
