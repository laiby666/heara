# He-Ara Project 💡

A premium landing page and lead management system for the "Mark 1" smart switch.
The project consists of a **Vanilla JavaScript** frontend and a **FastAPI (Python)** backend with **MongoDB**.

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

1. **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
2. **MongoDB**: Must be installed and running locally. [Download MongoDB](https://www.mongodb.com/try/download/community)
3. **VS Code** (Recommended): With the "Live Server" extension installed.

---

## 🚀 Installation

1. **Clone or Download** the project repository.
2. **Navigate** to the project folder in your terminal.

### Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

---

## ▶️ Running the Application

You need to run the Backend and Frontend simultaneously.

### 1. Start the Backend Server (API)

Make sure MongoDB is running in the background. Then, from the `backend` folder:

```bash
uvicorn main:app --reload
```

*   **API Status:** The server will start at `http://127.0.0.1:8000`.
*   **API Documentation:** You can view the automatic docs at `http://127.0.0.1:8000/docs`.

### 2. Start the Frontend

To avoid CORS issues, the HTML files must be served via a local server (not by double-clicking the file).

**Using VS Code (Recommended):**
1. Open the project folder in VS Code.
2. Right-click on `index.html`.
3. Select **"Open with Live Server"**.
4. The site will open automatically at `http://127.0.0.1:5500`.

---

## 🛠 Project Structure

*   `index.html` - Main landing page.
*   `admin.html` - Admin dashboard to view and manage leads.
*   `script.js` - Frontend logic (UI, API calls, Translations).
*   `backend/` - Python FastAPI server and database logic.