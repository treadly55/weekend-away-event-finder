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
resultsArea.innerHTML = '';
    resultsArea.style.display = 'none';
    
    // Restore the initial prompt message for the next search
    if (!resultsArea.contains(initialPromptMessage)) {
        resultsArea.appendChild(initialPromptMessage);
    }
    initialPromptMessage.style.display = 'block';


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
      resultsArea.style.display = 'block';
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
        resultsArea.style.display = 'block';
resultsArea.innerHTML = '<p style="color: red;">Invalid timeframe selected.</p>';
if (initialPromptMessage) initialPromptMessage.style.display = 'none';
retrySection.classList.add('hidden');
return;
}

const timeframeDescription = event.target.textContent;

isAgentRunning = true;
timeframeButtons.forEach(btn => btn.disabled = true);
citySelect.disabled = true;

    // **MODIFIED SECTION**
    // 1. Clear previous content and hide initial prompt
    resultsArea.innerHTML = ''; 
if (initialPromptMessage) {
        initialPromptMessage.style.display = 'none'; 
}
    
    // 2. Show the results area and a simple loading message
    resultsArea.style.display = 'block'; 
    resultsArea.innerHTML = `<p style="text-align: center;">Finding events in ${selectedCityDisplay} for ${timeframeDescription}...</p>`;

    // 3. Scroll to the loading message
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

retrySection.classList.add('hidden');

    // We no longer need the detailed progress log function.
    // The `runWeekendAgent` function now receives a dummy function.
    const dummyProgressCallback = () => {};

try {
console.log(`Calling Agent for City: ${selectedCityForAPI}, Event Key: ${actualEventApiKey}, Weather Date: ${weatherDate}`);

const recommendations = await runWeekendAgent(
selectedCityForAPI,
actualEventApiKey,
weatherDate,
dummyProgressCallback // Pass the empty function
);

resultsArea.innerHTML = `<h2>Top Event Suggestions for ${selectedCityDisplay} (${timeframeDescription})</h2><p>${recommendations.replace(/\n/g, '<br>')}</p>`;
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
