import './App.css';
import Home from "./component/Home";
import { Routes, Route } from "react-router-dom";
import EditorPage from './component/EditorPage';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/editor/:roomId' element={<EditorPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
