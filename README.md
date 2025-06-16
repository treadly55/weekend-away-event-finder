# 🎉 City Event Finder

**City Event Finder** is a proof-of-concept web application powered by an agentic AI agent which is programmed to find and curate events in different major Australian capital cities. The AI agent considers both the upcoming weather for the selected city and the upcoming events in that location before making an informed suggestion.

The AI agent relies on SerpApi for event data, and OpenWeatherMap for weather forecasts.


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
├── public/              
│   ├── icons/
│   ├── manifest.json
│   └── sw.js
├── src/                 
│   ├── agent.js         
│   ├── main.js          
│   ├── openaiclient.js  
│   └── tools.js        
├── netlify/functions/   
│   └── get-events.cjs   


## 📄 License

This project is licensed under the [MIT License](LICENSE).
