import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCode, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import './SnippetsPanel.css';

function SnippetsPanel({ onInsertSnippet, isOpen: propsIsOpen, onClose }) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [snippets, setSnippets] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSnippet, setNewSnippet] = useState({ name: '', code: '', category: 'General' });

    const isControlled = propsIsOpen !== undefined;
    const isOpen = isControlled ? propsIsOpen : internalIsOpen;

    const CATEGORIES = ['General', 'Loops', 'Functions', 'Data Structures', 'Algorithms'];

    useEffect(() => {
        const saved = sessionStorage.getItem('colabcode-snippets');
        if (saved) {
            try {
                setSnippets(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load snippets:', e);
            }
        } else {
            // Default snippets
            const defaultSnippets = [
                { id: 1, name: 'For Loop', code: 'for (let i = 0; i < n; i++) {\n  // code\n}', category: 'Loops' },
                { id: 2, name: 'Function', code: 'function myFunction(param) {\n  // code\n  return result;\n}', category: 'Functions' },
                { id: 3, name: 'Array Map', code: 'const result = array.map(item => {\n  return item;\n});', category: 'Data Structures' },
            ];
            setSnippets(defaultSnippets);
            sessionStorage.setItem('colabcode-snippets', JSON.stringify(defaultSnippets));
        }
    }, []);

    const saveSnippets = (newSnippets) => {
        setSnippets(newSnippets);
        sessionStorage.setItem('colabcode-snippets', JSON.stringify(newSnippets));
    };

    const addSnippet = () => {
        if (!newSnippet.name || !newSnippet.code) return;

        const snippet = {
            id: Date.now(),
            ...newSnippet,
        };

        saveSnippets([...snippets, snippet]);
        setNewSnippet({ name: '', code: '', category: 'General' });
        setShowAddForm(false);
    };

    const deleteSnippet = (id) => {
        saveSnippets(snippets.filter((s) => s.id !== id));
    };

    const insertSnippet = (code) => {
        onInsertSnippet(code);
        if (isControlled) {
            onClose && onClose();
        } else {
            setInternalIsOpen(false);
        }
    };

    const groupedSnippets = snippets.reduce((acc, snippet) => {
        if (!acc[snippet.category]) acc[snippet.category] = [];
        acc[snippet.category].push(snippet);
        return acc;
    }, {});

    const togglePanel = () => {
        if (isControlled) onClose && onClose();
        else setInternalIsOpen(!internalIsOpen);
    }

    return (
        <div className="snippets-wrapper">
            {/* FAB - Only show if NOT controlled */}
            {!isControlled && (
                <motion.button
                    className="fab snippets-fab"
                    onClick={togglePanel}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ bottom: '290px', right: '20px' }}
                    title="Code Snippets"
                >
                    <FaCode />
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`snippets-panel glass-card ${isControlled ? 'embedded' : 'floating'}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.15, ease: "easeOut" }} // Faster animation
                    >
                        {/* Streamlined Header - Minimal */}
                        <div className="snippets-controls">
                            <button className="btn-glass icon-btn add-btn" onClick={() => setShowAddForm(!showAddForm)} title="Add Snippet">
                                <FaPlus /> Add New
                            </button>
                            <button className="close-btn" onClick={togglePanel}>
                                <FaTimes />
                            </button>
                        </div>

                        {showAddForm && (
                            <div className="add-snippet-form">
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Snippet Name"
                                    value={newSnippet.name}
                                    onChange={(e) => setNewSnippet({ ...newSnippet, name: e.target.value })}
                                />
                                <select
                                    className="glass-input"
                                    value={newSnippet.category}
                                    onChange={(e) => setNewSnippet({ ...newSnippet, category: e.target.value })}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <textarea
                                    className="glass-input snippet-textarea"
                                    placeholder="Code..."
                                    value={newSnippet.code}
                                    onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
                                    rows={4}
                                />
                                <button className="btn-gradient" onClick={addSnippet}>Save</button>
                            </div>
                        )}

                        <div className="snippets-list">
                            {Object.entries(groupedSnippets).map(([category, categorySnippets]) => (
                                <div key={category} className="snippet-category">
                                    <h5 className="category-title">{category}</h5>
                                    {categorySnippets.map((snippet) => (
                                        <motion.div
                                            key={snippet.id}
                                            className="snippet-item"
                                            whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => insertSnippet(snippet.code)}
                                        >
                                            <div className="snippet-info">
                                                <span className="snippet-name">{snippet.name}</span>
                                                <span className="snippet-code-preview" title={snippet.code}>
                                                    {snippet.code.substring(0, 50).replace(/\n/g, ' ')}...
                                                </span>
                                            </div>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteSnippet(snippet.id);
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SnippetsPanel;
