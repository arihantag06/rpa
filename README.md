# Automation Workflow Builder

A modern web-based automation workflow builder with **real-time live browser streaming**. Build and execute browser automation workflows with XPath-based interactions and watch them run in real-time.

## ✨ Features

- **Visual Workflow Builder** - Drag-and-drop interface for creating automation workflows
- **Live Browser Streaming** - Real-time browser view with full control via VNC
- **XPath-Based Automation** - Precise element selection using XPath selectors
- **Multiple Step Types**:
  - Navigate to URL
  - Click elements
  - Type text into inputs
  - Wait for specified duration
  - Take screenshots

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Docker Desktop (for live browser)

### Step 1: Start the Live Browser (Docker)

```bash
docker-compose -f docker-compose.windows.yml up -d
```

This starts a Chrome browser with VNC support.

### Step 2: Start the Backend

```bash
cd backend
pip install -r requirements.selenium.txt
python app_selenium_live.py
```

### Step 3: Start the Frontend

```bash
npm install
npm run dev
```

### Step 4: Open Your App

Go to http://localhost:5173 and start automating! 🎉

---

## 📺 Live Browser Access

**In Your App:**
- Main app with 🔴 LIVE indicator: http://localhost:5173

**Direct VNC View:**
- Browser desktop: http://localhost:7900 (Click "Connect")

---

## 🎯 How to Use

1. **Create a Workflow** - Click "Create Workflow" or select existing
2. **Add Steps** - Click "Add Step" and choose action type
3. **Configure Steps** - Fill in URLs, XPath selectors, or text
4. **Run Workflow** - Click "Run Workflow" and watch it execute live!

### XPath Examples

```xpath
//input[@id='username']
//button[contains(text(), 'Submit')]
//div[@class='login-form']//input[@type='email']
//*[@data-testid='submit-button']
```

---

## 📁 Project Structure

```
automation/
├── src/
│   ├── components/
│   │   ├── RealCloudBrowser.tsx      # Live browser display
│   │   ├── WorkflowManager.tsx       # Workflow list
│   │   ├── WorkflowStep.tsx          # Individual step
│   │   └── StepSelector.tsx          # Step type picker
│   ├── contexts/
│   │   └── WorkflowContext.tsx       # Global state
│   ├── routes/
│   │   └── automation/page.tsx       # Main page
│   └── types/
│       └── workflow.ts               # TypeScript types
├── backend/
│   ├── app_selenium_live.py          # Backend API
│   └── requirements.selenium.txt     # Python deps
├── docker-compose.windows.yml        # Docker setup
└── package.json
```

---

## 🔧 Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- @dnd-kit (drag & drop)
- Lucide React (icons)

**Backend:**
- Python Flask
- Selenium WebDriver
- Flask-SocketIO

**Browser:**
- Selenium Standalone Chrome
- Built-in VNC server
- noVNC web client

---

## 🛑 Stop Services

```bash
# Stop Docker container
docker-compose -f docker-compose.windows.yml down

# Backend and frontend: Ctrl+C in their terminals
```

---

## 🧪 API Endpoints

- `POST /api/execute-step` - Execute a single step
- `POST /api/execute-workflow` - Execute entire workflow
- `POST /api/browser` - Browser control commands
- `GET /api/health` - Health check
- `GET /api/browser-stream-info` - Stream configuration
- `GET /api/browser-state` - Current browser state

---

## 🐛 Troubleshooting

### Docker not starting
```bash
# Check Docker Desktop is running
docker version
```

### Port conflicts
```bash
# Check if ports are free
netstat -ano | findstr :4444
netstat -ano | findstr :7900
```

### Live browser not showing
1. Verify Docker container is running: `docker ps`
2. Check http://localhost:7900 directly
3. Look for 🔴 LIVE indicator in app

---

## 📚 Learn More

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Playwright (alternative)](https://playwright.dev/)
- [XPath Cheatsheet](https://devhints.io/xpath)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for browser automation**
