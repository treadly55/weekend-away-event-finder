// src/agent.js
import { openai } from './openaiClient.js';
import { availableFunctions } from './tools.js';
import { systemPrompt } from './systemPrompt.js';

// Updated function signature to accept city, eventApiKeyString, and weatherDate
export async function runWeekendAgent(city, eventApiKeyString, weatherDate, progressCallback) {

    progressCallback(`Initializing agent for ${city} with event key: '${eventApiKeyString}' and weather date: '${weatherDate}'`);
    
    const userQuery = `Fetch events for city '${city}' using event key '${eventApiKeyString}'. Then, fetch the weather for '${city}' on '${weatherDate}'. Finally, recommend the top three most exciting events suitable for the weather. Follow the system prompt's formatting instructions precisely for the final output.`;

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery }
    ];

    const MAX_ITERATIONS = 5; // 1. getEvents, 2. getWeather, 3. AI processes and responds.
    const actionRegex = /Action:\s*(\w+):\s*({.*?})/s;

    try {
        for (let i = 0; i < MAX_ITERATIONS; i++) {
            progressCallback(`Iteration #${i + 1}: Thinking...`);
            console.log(`--- Iteration ${i + 1} ---`);
            console.log("Messages sent to OpenAI:", JSON.stringify(messages, null, 2));

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: 0.1,
            });

            const responseMessage = response.choices[0].message;
            const responseText = responseMessage.content;

            console.log("OpenAI Raw Response:", responseText);
            if (!responseText) {
                 progressCallback("Agent provided an empty response. Ending interaction.");
                 console.warn("Agent provided empty response text.");
                 messages.push({role: "assistant", content: ""});
                 return "I seem to be at a loss for words! Could you try again?";
            }
            messages.push(responseMessage);

            const actionMatch = responseText.match(actionRegex);

            if (actionMatch) {
                const actionName = actionMatch[1].trim();
                const actionArgsRaw = actionMatch[2].trim();
                let actionArgs;

                if (actionName !== "getEvents" && actionName !== "getWeather") {
                     console.warn(`Agent tried to call unexpected tool: ${actionName}`);
                     progressCallback(`Error: Agent tried to use an invalid tool '${actionName}'.`);
                     messages.push({ role: "assistant", content: `Observation: Error - Invalid tool '${actionName}'. Only 'getEvents' and 'getWeather' are available.` });
                     continue;
                }

                try {
                    actionArgs = JSON.parse(actionArgsRaw);
                    console.log(`Attempting to call tool '${actionName}' with parsed arguments:`, actionArgs);
                    progressCallback(`Calling tool: ${actionName} with args: ${JSON.stringify(actionArgs)}`);
                } catch (e) {
                    console.error(`Error parsing action arguments JSON: '${actionArgsRaw}'`, e);
                    progressCallback(`Error understanding action arguments for ${actionName}.`);
                    messages.push({ role: "assistant", content: `Observation: Error parsing the arguments JSON provided: '${actionArgsRaw}'. Please ensure arguments are valid JSON.` });
                    continue;
                }
                
                // Validate arguments for each tool
                if (actionName === "getEvents" && (!actionArgs.city || !actionArgs.eventKey)) {
                    console.error("Missing required arguments (city or eventKey) for getEvents:", actionArgs);
                    progressCallback("Error: Missing city or eventKey argument for getEvents tool.");
                    messages.push({ role: "assistant", content: "Observation: Error - Missing 'city' or 'eventKey' in arguments for getEvents." });
                    continue;
                }
                if (actionName === "getWeather" && (!actionArgs.city || !actionArgs.date)) {
                    console.error("Missing required arguments (city or date) for getWeather:", actionArgs);
                    progressCallback("Error: Missing city or date argument for getWeather tool.");
                    messages.push({ role: "assistant", content: "Observation: Error - Missing 'city' or 'date' in arguments for getWeather." });
                    continue;
                }
                
                try {
                    console.log(`CONFIRMED: Executing tool function availableFunctions['${actionName}']`);
                    let toolResult;
                    if (actionName === "getEvents") {
                        toolResult = await availableFunctions[actionName](
                            actionArgs.city, 
                            actionArgs.eventKey,
                            actionArgs.categories // Optional for getEvents
                        );
                    } else if (actionName === "getWeather") {
                        toolResult = await availableFunctions[actionName](
                            actionArgs.city,
                            actionArgs.date // Specific date for getWeather
                        );
                    }
                    messages.push({ role: "assistant", content: `Observation: ${toolResult}` });
                    progressCallback(`Received observation from ${actionName}.`);
                    console.log(`Observation from ${actionName}:`, toolResult);
                } catch (e) {
                    console.error(`Error executing tool ${actionName}:`, e);
                    progressCallback(`Error executing tool ${actionName}.`);
                    messages.push({ role: "assistant", content: `Observation: Error running ${actionName}: ${e.message}` });
                }

                 if (!responseText.includes("PAUSE")) {
                    console.warn("AI response had an Action but may not have included PAUSE explicitly after the JSON.");
                }
            } else {
                progressCallback("Agent finished. Processing final answer.");
                console.log("Final response from AI:", responseText);
                return responseText.trim();
            }
        }
        progressCallback("Agent reached maximum iterations.");
        return "Sorry, I couldn't finalize the suggestions within the allowed steps.";

    } catch (error) {
        console.error("Error in agent loop:", error);
        if (typeof progressCallback === 'function') {
            progressCallback("An error occurred while processing your request.");
        } else {
            console.error("progressCallback is not a function in catch block either. Original error:", error.message);
        }
        
        if (error.response && error.response.data && error.response.data.error) {
            console.error("OpenAI API Error Details:", error.response.data.error.message);
            return `Error communicating with AI: ${error.response.data.error.message}`;
        }
        return `An unexpected error occurred: ${error.message}`;
    }
}
