import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import './ThemeSwitcher.css';

function ThemeSwitcher({ isOpen: propsIsOpen, onClose }) {
    const { currentTheme, changeTheme, allThemes } = useTheme();
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isControlled = propsIsOpen !== undefined;
    const isOpen = isControlled ? propsIsOpen : internalIsOpen;

    const togglePanel = () => {
        if (isControlled) onClose && onClose();
        else setInternalIsOpen(!internalIsOpen);
    };

    return (
        <>
            {/* Floating Action Button */}
            {/* FAB Removed - Controlled by Toolbar */}

            {/* Theme Switcher Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="theme-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={togglePanel}
                        />

                        {/* Panel */}
                        <motion.div
                            className="theme-panel glass-card"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                            <div className="theme-panel-header">
                                <h3>Choose Theme</h3>
                                <button className="close-btn" onClick={togglePanel}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="theme-grid">
                                {Object.entries(allThemes).map(([key, theme]) => (
                                    <motion.div
                                        key={key}
                                        className={`theme-card ${currentTheme === key ? 'active' : ''}`}
                                        onClick={() => {
                                            changeTheme(key);
                                            setTimeout(() => {
                                                if (isControlled) onClose && onClose();
                                                else setInternalIsOpen(false);
                                            }, 300);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div
                                            className="theme-preview"
                                            style={{
                                                background: theme.colors.background,
                                                borderColor: theme.colors.primary,
                                            }}
                                        >
                                            <div className="preview-line" style={{ background: theme.colors.primary }}></div>
                                            <div className="preview-line" style={{ background: theme.colors.foreground }}></div>
                                            <div className="preview-line" style={{ background: theme.colors.comment }}></div>
                                        </div>
                                        <div className="theme-name">{theme.name}</div>
                                        {currentTheme === key && (
                                            <motion.div
                                                className="active-indicator"
                                                layoutId="activeTheme"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default ThemeSwitcher;
