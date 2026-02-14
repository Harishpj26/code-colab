import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import './SearchPanel.css';

function SearchPanel({ editorRef, isOpen: propsIsOpen, onClose }) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [replaceTerm, setReplaceTerm] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [matchCount, setMatchCount] = useState(0);
    const [currentMatch, setCurrentMatch] = useState(0);

    const isControlled = propsIsOpen !== undefined;
    const isOpen = isControlled ? propsIsOpen : internalIsOpen;

    const togglePanel = () => {
        if (isControlled) onClose && onClose();
        else setInternalIsOpen(!internalIsOpen);
    };

    const performSearch = () => {
        if (!editorRef.current || !searchTerm) return;

        const editor = editorRef.current;
        const query = searchTerm; // Always string search

        const cursor = editor.getSearchCursor(query, null, !caseSensitive);
        let count = 0;

        while (cursor.findNext()) {
            count++;
        }

        setMatchCount(count);
        if (count > 0) {
            setCurrentMatch(1);
            const newCursor = editor.getSearchCursor(query, null, !caseSensitive);
            if (newCursor.findNext()) {
                editor.setSelection(newCursor.from(), newCursor.to());
                editor.scrollIntoView({ from: newCursor.from(), to: newCursor.to() }, 100);
            }
        }
    };

    const findNext = () => {
        if (!editorRef.current || !searchTerm) return;

        const editor = editorRef.current;
        const query = searchTerm;
        const cursor = editor.getSearchCursor(query, editor.getCursor(), !caseSensitive);

        if (cursor.findNext()) {
            editor.setSelection(cursor.from(), cursor.to());
            editor.scrollIntoView({ from: cursor.from(), to: cursor.to() }, 100);
            setCurrentMatch((prev) => (prev < matchCount ? prev + 1 : 1));
        }
    };

    const findPrevious = () => {
        if (!editorRef.current || !searchTerm) return;

        const editor = editorRef.current;
        const query = searchTerm;
        const cursor = editor.getSearchCursor(query, editor.getCursor(), !caseSensitive);

        if (cursor.findPrevious()) {
            editor.setSelection(cursor.from(), cursor.to());
            editor.scrollIntoView({ from: cursor.from(), to: cursor.to() }, 100);
            setCurrentMatch((prev) => (prev > 1 ? prev - 1 : matchCount));
        }
    };

    const replaceOne = () => {
        if (!editorRef.current || !searchTerm) return;

        const editor = editorRef.current;
        const selection = editor.getSelection();

        if (selection === searchTerm) {
            editor.replaceSelection(replaceTerm);
            findNext();
        }
    };

    const replaceAll = () => {
        if (!editorRef.current || !searchTerm) return;

        const editor = editorRef.current;
        const query = searchTerm;
        const cursor = editor.getSearchCursor(query, null, !caseSensitive);

        while (cursor.findNext()) {
            cursor.replace(replaceTerm);
        }

        setMatchCount(0);
        setCurrentMatch(0);
    };

    return (
        <div className="search-wrapper">
            {/* FAB - Only show if NOT controlled */}
            {!isControlled && (
                <motion.button
                    className="fab search-fab"
                    onClick={togglePanel}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ bottom: '150px', right: '20px' }}
                    title="Search & Replace (Ctrl+F)"
                >
                    <FaSearch />
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`search-panel glass-card ${isControlled ? 'embedded' : 'floating'}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.15, ease: "easeOut" }} // Faster animation
                    >
                        {/* Streamlined - No Header, just absolute close button */}
                        <button className="close-btn-absolute" onClick={togglePanel}>
                            <FaTimes />
                        </button>

                        <div className="search-inputs">
                            <div className="input-row">
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyUp={(e) => e.key === 'Enter' && performSearch()}
                                    autoFocus
                                />
                                <div className="search-controls">
                                    <button className="btn-glass icon-btn" onClick={findPrevious} title="Previous">
                                        <FaChevronUp />
                                    </button>
                                    <button className="btn-glass icon-btn" onClick={findNext} title="Next">
                                        <FaChevronDown />
                                    </button>
                                    <span className="match-count">{matchCount > 0 ? `${currentMatch}/${matchCount}` : '0'}</span>
                                </div>
                            </div>

                            <div className="input-row">
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Replace..."
                                    value={replaceTerm}
                                    onChange={(e) => setReplaceTerm(e.target.value)}
                                />
                                <div className="replace-controls">
                                    <button className="btn-glass small-text-btn" onClick={replaceOne}>Replace</button>
                                    <button className="btn-glass small-text-btn" onClick={replaceAll}>All</button>
                                </div>
                            </div>

                            <div className="search-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={caseSensitive}
                                        onChange={(e) => setCaseSensitive(e.target.checked)}
                                    />
                                    <span>Case Sensitive</span>
                                </label>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SearchPanel;
