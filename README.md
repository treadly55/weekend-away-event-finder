# 🎉 City Event Finder

**City Event Finder** is a proof-of-concept web application powered by the OpenAI Assistants API working as an AI agent to find and curate events in different major Australian capital cities. The Assistant considers both the upcoming weather for the selected city and the upcoming events in that location before making an informed suggestion.

The application relies on SerpApi for event data, and OpenWeatherMap for weather forecasts.


## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: Vite
- **Backend**: Netlify Functions (Node.js)

### APIs Used:
- OpenAI API (for AI agent logic)
- SerpApi (for event data)
- OpenWeatherMap (for weather forecasts)

**Hosting**: [Netlify](https://netlify.com)

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing.

### 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name

# For the frontend AI Agent calls
VITE_OPENAI_API_KEY="your_openai_api_key_here"

# For the backend Netlify Functions
SERPAPI_API_KEY="your_serpapi_api_key_here"
WEATHER_API_KEY="your_openweathermap_api_key_here"

# Project structure
/
├── public/              # Static assets (icons, manifest, service worker)
│   ├── icons/
│   ├── manifest.json
│   └── sw.js
├── src/                 # Frontend source code
│   ├── agent.js         # AI agent logic and OpenAI prompt
│   ├── main.js          # Core application logic and event handlers
│   ├── openaiclient.js  # OpenAI client setup
│   └── tools.js         # Functions that call the backend
├── netlify/functions/   # Serverless backend functions
│   └── get-events.cjs   # Fetches event data from SerpApi


## 📄 License

This project is licensed under the [MIT License](LICENSE).