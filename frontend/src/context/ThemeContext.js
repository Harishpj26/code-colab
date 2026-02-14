import React, { createContext, useState, useContext, useEffect } from 'react';

// Define available themes
export const THEMES = {
    dracula: {
        name: 'Dracula',
        editorTheme: 'dracula',
        colors: {
            primary: '#bd93f9',
            background: '#282a36',
            foreground: '#f8f8f2',
            comment: '#6272a4',
        }
    },
    monokai: {
        name: 'Monokai',
        editorTheme: 'monokai',
        colors: {
            primary: '#f92672',
            background: '#272822',
            foreground: '#f8f8f2',
            comment: '#75715e',
        }
    },
    nord: {
        name: 'Nord',
        editorTheme: 'nord',
        colors: {
            primary: '#88c0d0',
            background: '#2e3440',
            foreground: '#d8dee9',
            comment: '#616e88',
        }
    },
    solarizedLight: {
        name: 'Solarized Light',
        editorTheme: 'solarized light',
        colors: {
            primary: '#268bd2',
            background: '#fdf6e3',
            foreground: '#657b83',
            comment: '#93a1a1',
        }
    },
    solarizedDark: {
        name: 'Solarized Dark',
        editorTheme: 'solarized dark',
        colors: {
            primary: '#268bd2',
            background: '#002b36',
            foreground: '#839496',
            comment: '#586e75',
        }
    },
    material: {
        name: 'Material',
        editorTheme: 'material',
        colors: {
            primary: '#82aaff',
            background: '#263238',
            foreground: '#eeffff',
            comment: '#546e7a',
        }
    },
    oneDark: {
        name: 'One Dark',
        editorTheme: '3024-day',
        colors: {
            primary: '#61afef',
            background: '#282c34',
            foreground: '#abb2bf',
            comment: '#5c6370',
        }
    },
};

// Create Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState('dracula');
    const [customColors, setCustomColors] = useState(null);

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('colabcode-theme');
        const savedCustomColors = localStorage.getItem('colabcode-custom-colors');

        if (savedTheme && THEMES[savedTheme]) {
            setCurrentTheme(savedTheme);
        }

        if (savedCustomColors) {
            try {
                setCustomColors(JSON.parse(savedCustomColors));
            } catch (e) {
                console.error('Failed to parse custom colors:', e);
            }
        }
    }, []);

    // Save theme to localStorage when it changes
    const changeTheme = (themeName) => {
        if (THEMES[themeName]) {
            setCurrentTheme(themeName);
            localStorage.setItem('colabcode-theme', themeName);
        }
    };

    // Save custom colors
    const saveCustomColors = (colors) => {
        setCustomColors(colors);
        localStorage.setItem('colabcode-custom-colors', JSON.stringify(colors));
    };

    // Get active theme (custom or preset)
    const getActiveTheme = () => {
        if (customColors) {
            return {
                name: 'Custom',
                editorTheme: THEMES[currentTheme].editorTheme,
                colors: customColors,
            };
        }
        return THEMES[currentTheme];
    };

    const value = {
        currentTheme,
        changeTheme,
        customColors,
        saveCustomColors,
        clearCustomColors: () => {
            setCustomColors(null);
            localStorage.removeItem('colabcode-custom-colors');
        },
        theme: getActiveTheme(),
        allThemes: THEMES,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
