# 🚀 ColabCode - Real-Time Code Collaboration App

## 📋 Project Overview
ColabCode is a real-time collaborative code editor that allows multiple users to code together in the same room. It features:
- **Real-time collaboration** using Socket.IO
- **Code execution** via JDoodle and Judge0 APIs
- **Multiple language support** (Python, Java, C, C++)
- **React frontend** with Material-UI
- **Express backend** with WebSocket support

---

## 🛠️ Prerequisites

Before running this project, ensure you have:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

---

## 📦 Installation & Setup

### Step 1: Install Dependencies

The project has two parts: **backend** and **frontend**. Both need their dependencies installed.

#### Backend Setup
```bash
cd backend
npm install
```

#### Frontend Setup
```bash
cd frontend
npm install
```

> **Note:** It looks like you already have `node_modules` folders, so dependencies may already be installed!

---

## ⚙️ Environment Configuration

### Backend Environment Variables
The backend uses a `.env` file located at `backend/.env`:

```env
JDOODLE_CLIENTID=8cf03c2461974aac12912bcc029fa4e2
JDOODLE_CLIENTSECRET=c164b8656aa2673401b0050da57c9301c0ed16accd443d768fb1402d2e58bb2e
PORT=5000
```

✅ **Already configured!** Your JDoodle API credentials are set up.

### Frontend Environment Variables
The frontend uses a `.env` file located at `frontend/.env`:

```env
REACT_APP_BACKEND_URL="http://localhost:5000"
```

✅ **Already configured!** The frontend is set to connect to the backend on port 5000.

---

## 🚀 Running the Application

You need to run **both** the backend and frontend servers simultaneously.

### Option 1: Using Two Terminal Windows

#### Terminal 1 - Start Backend Server
```bash
cd backend
npm start
```

Expected output:
```
Server is running on port 5000
JDoodle Client ID: 8cf03c2461974aac12912bcc029fa4e2
```

#### Terminal 2 - Start Frontend Server
```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
You can now view client in the browser.
Local: http://localhost:3000
```

### Option 2: Using PowerShell (Windows)

Open PowerShell in the project root and run:

```powershell
# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\A MINE\programming\Mini-project\ColabCode\backend'; npm start"

# Start frontend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\A MINE\programming\Mini-project\ColabCode\frontend'; npm start"
```

---

## 🌐 Accessing the Application

Once both servers are running:

1. **Frontend:** Open your browser and navigate to [http://localhost:3000](http://localhost:3000)
2. **Backend:** Running on [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing the Application

### Basic Functionality Test:
1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Create a new room or join an existing one
3. Enter a username
4. Start coding!

### Multi-User Test:
1. Open the app in **two different browser windows** (or use incognito mode)
2. Join the same room with different usernames
3. Type code in one window and watch it appear in real-time in the other

### Code Execution Test:
1. Write some code (e.g., Python: `print("Hello World")`)
2. Click the "Run" button
3. Check the output panel

---

## 📁 Project Structure

```
ColabCode/
├── backend/
│   ├── index.js           # Main server file with Socket.IO and Express
│   ├── Actions.js         # Socket.IO action constants
│   ├── package.json       # Backend dependencies
│   ├── .env              # Environment variables (JDoodle API keys)
│   └── Dockerfile        # Docker configuration for backend
│
├── frontend/
│   ├── src/              # React source files
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   ├── .env             # Environment variables (backend URL)
│   └── Dockerfile       # Docker configuration for frontend
│
└── SETUP_GUIDE.md       # This file!
```

---

## 🔧 Troubleshooting

### Issue: "Port 3000 is already in use"
**Solution:** Kill the process using port 3000 or change the port:
```bash
# Find and kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Port 5000 is already in use"
**Solution:** Change the PORT in `backend/.env` or kill the process:
```bash
# Find and kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "Cannot connect to backend"
**Solution:** 
1. Ensure backend server is running on port 5000
2. Check `frontend/.env` has correct backend URL
3. Verify no firewall is blocking the connection

### Issue: "Code compilation fails"
**Solution:**
1. Check JDoodle API credentials in `backend/.env`
2. Verify internet connection (APIs require internet)
3. Check JDoodle API rate limits (free tier has limits)

### Issue: "npm install fails"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

---

## 🎯 Quick Start Commands

```bash
# From project root directory

# Install all dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# Run backend (in one terminal)
cd backend && npm start

# Run frontend (in another terminal)
cd frontend && npm start
```

---

## 📝 Available Scripts

### Backend
- `npm start` - Starts the backend server with nodemon (auto-restart on changes)

### Frontend
- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

---

## 🔑 API Keys

The project uses:
- **JDoodle API** for code compilation (already configured)
- **Judge0 API** as an alternative compiler (no key required)

---

## 🐳 Docker Support

Both backend and frontend have Dockerfile configurations for containerized deployment.

---

## 📞 Need Help?

If you encounter any issues:
1. Check that both servers are running
2. Verify environment variables are set correctly
3. Check browser console for errors (F12)
4. Check backend terminal for error messages

---

**Happy Coding! 🎉**
