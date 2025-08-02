const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
/**
 * Appends a message to the chat box and scrolls to the bottom.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The message text.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(sender, text) {
  const msgElement = document.createElement("div");
  msgElement.classList.add("message", sender);
  msgElement.textContent = text; // Using textContent is safer (prevents XSS)
  chatBox.appendChild(msgElement);
  // For line breaks to render, add 'white-space: pre-wrap;' to your .message CSS
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgElement;
}
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) {
    return;
  }

  // Add user's message to the chat box
  appendMessage("user", userMessage);
  input.value = ""; // Clear the input field

  // Show a temporary "Thinking..." bot message
  const thinkingMessageElement = appendMessage("bot", "Thinking...");

  try {
    // Send the user's message to the backend
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404, 500)
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Replace "Thinking..." with the AI's reply or an error message
    if (data && data.result) {
      thinkingMessageElement.textContent = data.result;
    } else {
      thinkingMessageElement.textContent = "Sorry, no response received.";
    }
  } catch (error) {
    console.error("Failed to get response:", error);
    // Show a generic error message on network failure or other issues
    thinkingMessageElement.textContent = "Failed to get response from server.";
  } finally {
    // Ensure the final message is visible
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
