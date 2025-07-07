# Smart Whiteboard Web App

This is the frontend web application for the Smart Whiteboard System, built using **Vite.js** with **React** and **Tailwind CSS**.

The system includes a web-based dashboard for remote control and monitoring of the whiteboard eraser. The dashboard provides the following features:

- **Real-Time Control**:
   - Execute MQTT commands such as `capture`, `erase`, and `status` directly from the web interface.
   - Toggle session states and manage motor operations remotely.

- **Data Visualization**:
   - Display session data retrieved from the Supabase database.
   - View captured whiteboard images and metadata.

- **Scheduler Management**:
   - Configure and manage automated tasks such as scheduled captures and erasures.
   - Enable or disable schedules dynamically.

- **System Monitoring**:
   - View real-time system status updates via MQTT.
   - Monitor logs and error reports for troubleshooting.
   The dashboard is built using modern web technologies, including Vite.js. It communicates with the system through MQTT and Supabase APIs for seamless integration.
## Demo

You can visit demo [here](https://smaaart-eraser.vercel.app/)


https://github.com/user-attachments/assets/bb0e6e26-4ece-4036-a980-e65c54e2440b



## AI services

github repo of ai services endpoints from [here](https://github.com/MHND09/Ai-summary) and documentation [https://ai-summary-chi.vercel.app](https://ai-summary-chi.vercel.app/)

## 🛠️ Tech Stack

- [Vite.js](https://vitejs.dev/) – Fast development build tool
- [React](https://react.dev/) – JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [Node.js](https://nodejs.org/) – Runtime environment

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---
* .env was uploaded intentionally 

### 📦 Installation

1. **Clone the repository:**

   git clone https://github.com/your-username/smart-whiteboard-app.git
   cd smart-whiteboard-app 

2.	**Install dependencies:**
   npm install

3. **🧪 Running the Development Server:**
  npm run dev
