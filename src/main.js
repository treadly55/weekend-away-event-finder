import { runWeekendAgent } from './agent.js';
import '/style.css'; 

const EVENT_API_KEY_FOR_TODAY = "date:today";
const EVENT_API_KEY_FOR_TOMORROW = "date:tomorrow";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const citySelect = document.getElementById('city-select');
  const timeframeButtons = document.querySelectorAll('.timeframe-buttons button');
  const resultsArea = document.getElementById('results-area');
  const initialPromptMessage = document.getElementById('initial-prompt-message');
  const retrySection = document.getElementById('retry-section');
  const retryButton = document.getElementById('btn-retry');

  let isAgentRunning = false;

  function resetUIForNewSearch() {
    resultsArea.innerHTML = ''; // Clear all dynamic content
        resultsArea.style.display = 'none'; // Hide results area
        resultsArea.classList.remove('results-in-progress'); // Remove progress styling class
        resultsArea.classList.remove('results-area-loading'); // Remove loading box class  
        if (initialPromptMessage) {
        }
    retrySection.classList.add('hidden');
    citySelect.disabled = false;
    citySelect.value = ""; 
    timeframeButtons.forEach(btn => btn.disabled = false);
  }

  async function handleTimeframeClick(event) {
    if (isAgentRunning) {
      console.log("Agent is already running.");
      return;
    }

    const selectedCityValue = citySelect.value;
    if (!selectedCityValue) {
            // If resultsArea is intended to show this error, make it visible first
            resultsArea.style.display = 'block';
            resultsArea.classList.remove('results-in-progress'); // Not in progress state for this error
            resultsArea.classList.remove('results-area-loading'); // Not loading
      resultsArea.innerHTML = '<p style="color: red;">Please select a city first.</p>';
      if (initialPromptMessage) initialPromptMessage.style.display = 'none';
      retrySection.classList.add('hidden');
      return;
    }
    const selectedCityForAPI = selectedCityValue;
    const selectedCityDisplay = selectedCityValue.split(',')[0];

    const eventApiKeyStringInternal = event.target.dataset.timeframeKey;
    let actualEventApiKey;
    let weatherDate;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    switch(eventApiKeyStringInternal) {
      case 'today':
        actualEventApiKey = EVENT_API_KEY_FOR_TODAY;
        weatherDate = formatDate(today);
        break;
      case 'tomorrow':
        actualEventApiKey = EVENT_API_KEY_FOR_TOMORROW;
        weatherDate = formatDate(tomorrow);
        break;
      default:
        console.error("Unknown timeframe key:", eventApiKeyStringInternal);
                resultsArea.style.display = 'block'; // Show results area for error
                resultsArea.classList.remove('results-in-progress');
                resultsArea.classList.remove('results-area-loading');
        resultsArea.innerHTML = '<p style="color: red;">Invalid timeframe selected.</p>';
        if (initialPromptMessage) initialPromptMessage.style.display = 'none';
        retrySection.classList.add('hidden');
        return;
    }

    const timeframeDescription = event.target.textContent;

    isAgentRunning = true;
    timeframeButtons.forEach(btn => btn.disabled = true);
    citySelect.disabled = true;
    
        // Prepare resultsArea for progress display
        resultsArea.innerHTML = ''; // Clear previous content
    if (initialPromptMessage) {
          initialPromptMessage.style.display = 'none'; 
        }
        
    // Show a simple loading message and scroll to it
    resultsArea.innerHTML = `<p>Finding events in ${selectedCityDisplay} for ${timeframeDescription}...</p>`;
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });    
    retrySection.classList.add('hidden');

    try {
     console.log(`Calling Agent for City: ${selectedCityForAPI}, Event Key: ${actualEventApiKey}, Weather Date: ${weatherDate}`);

      const recommendations = await runWeekendAgent(
        selectedCityForAPI,
        actualEventApiKey,
        weatherDate,
        () => {}
      );
  

      resultsArea.innerHTML = `
      <h2>Top Event Suggestions for ${selectedCityDisplay}</h2>
      <p>${recommendations.replace(/\n/g, '<br>')}</p>`;
      console.log("Final Recommendations:", recommendations);
      retrySection.classList.remove('hidden');
    } catch (error) {
      console.error("Error getting recommendations:", error);
      resultsArea.innerHTML = `<p style="color: red;">Sorry, an error occurred: ${error.message}</p>`;
      retrySection.classList.remove('hidden');
    } finally {
      isAgentRunning = false;
    }
  }

  timeframeButtons.forEach(button => {
    button.addEventListener('click', handleTimeframeClick);
  });

  if (retryButton) {
    retryButton.addEventListener('click', () => {
      console.log("Retry button clicked.");
      resetUIForNewSearch();
    });
  }
});