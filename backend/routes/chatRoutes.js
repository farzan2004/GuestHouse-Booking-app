import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { findAvailableRoomsLogic } from "../controller/userController.js";
dotenv.config();

const chatRouter = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Put key in .env
const MODEL = "gemini-2.0-flash";

// ---------------- SYSTEM PROMPT ----------------
const systemPrompt = `
You are a helpful Guest House virtual assistant.


If the user says:
- "Show my bookings" or "my name" or  "my email" or "my phone number" or "my number" or any query about personal information→ return: { "intent": "show_profile" }

If a user asks for "contact", "email", "phone number", or "how to reach you", provide the following information clearly:
"You can contact the Guest House administration via:
- Email: igh@bitmesra.ac.in or ar.ap@bitmesra.ac.in
- Phone: +91 8084995830 or +91 9163636375"


If you receive:
"User profile: Name: ..., Email: ..., Phone: ..."
And the user's question is: "what is my email?", "what is my phone?", or "show my profile"

You must:
- Answer using only the fields requested
- Be very clear
- Never respond with "I didn't understand", or echo the profile context
- Never say "Here are your profile details" — just answer directly

Examples:

User: what is my email?  
Assistant: Your email is qmpzwnox1920@gmail.com.

User: show my profile  
Assistant: Name: David Warner  
Email: qmpzwnox1920@gmail.com  
Phone: 00000-00000


Room types:
- Deluxe: ₹3100/night (2 guests)
- Executive: ₹2400/night (2 guests)
- Luxury: ₹1300/night (2 guests)
- Family: ₹900/night (2 guests)
- Standard: ₹500/night (2 guests)

Each room holds 2 guests. Help users with prices, booking-related info, availability rules, and profile-based queries.

For request types:
If the user says:
- "Cancel one of my bookings" → return: { "intent": "cancel_booking" }
- "Show my bookings" → return: { "intent": "show_bookings" }

Use plain JSON responses only when intent is required. For all other user messages, respond in helpful natural English.

When you see 'User profile: Name: ..., Email: ..., Phone: ...' in the conversation, ALWAYS answer ONLY the specific user question using those fields, in natural, clear English. NEVER repeat or re-state 'User profile: ...' to the user as your answer. ONLY show the requested information (for example, if the user asks for email, just output the email).

For availability checks:
- If the user asks "are rooms free" or "check availability" and provides a room type and dates, return JSON:
{ "intent": "check_availability", "room_type": "<Standard/Deluxe/Family/Executive>", "dates": ["YYYY-MM-DD", "YYYY-MM-DD"] }

- If they ask about availability but DO NOT provide a room type, ask them for it.
- If they ask about availability but DO NOT provide dates, ask them for the dates.

Example:
User: are executive rooms free next week
Assistant: For what dates next week would you like me to check?

Example:
User: any rooms for july 25 to 28
Assistant: Certainly! Which type of room are you interested in? We have Standard, Deluxe, Executive, and Family rooms.

Example:
User: check availability for a deluxe room from august 5 to august 8 2025
Assistant: { "intent": "check_availability", "room_type": "Deluxe", "dates": ["2025-08-05", "2025-08-08"] }


Frequently asked questions you can answer:

- Q: Are pets allowed?  
  A: No, pets are not allowed in the guest house.

- Q: Can I cook in the room?  
  A: No. Cooking and washing are not allowed inside rooms.

- Q: Can I bring visitors or friends to my room?  
  A: Only registered guests are allowed in the rooms. Unauthorized visitors are not permitted.

- Q: Are alcoholic drinks allowed?  
  A: No, alcoholic drinks are not allowed on the premises.

- Q: How do I cancel my booking?  
  A: Please use the cancellation feature via the guest house portal.

- Q: What is the check-in/check-out policy?  
  A: Check-in is from 12:00 PM onwards. Check-out is by 11:00 AM.

- Q: Can I change my booking dates?  
  A: Date changes are subject to availability. Please use the booking portal or contact staff.

If a user asks a question that is not in your FAQ and is not about bookings, profile, or availability (like room size, specific locations, or special requests), respond with the following:
"I can only assist with general questions, bookings, and availability. For specific requests like that, it's best to contact the Guest House directly.

You can reach them at:
- Email: igh@bitmesra.ac.in or ar.ap@bitmesra.ac.in
- Phone: +91 8084995830 or +91 9163636375"

If a user asks any of these or similar questions, respond politely with the appropriate answer. If the question is not listed or unclear, respond with:  
"I'm not sure about that. Would you like help with bookings or available rooms?"

`;

// ---------------- Gemini API call ----------------
const sendToGemini = async (messageHistory) => {
  const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    ...messageHistory.slice(1).map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
  ];
  const response = await axios.post(url, { contents });
  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
};

// ---------------- CHAT ROUTE ----------------
chatRouter.post("/", async (req, res) => {
  const { messages } = req.body;

  try {
    
    const lastText = messages[messages.length - 1]?.text?.trim() || "";
    const hasProfileContext = lastText.startsWith("User profile:");

    // Ask LLM for reply
    const rawReply = await sendToGemini(messages);
    const reply = (rawReply || "").trim();

    // 1️⃣ Response to profile info message
    if (hasProfileContext) {
      if (!reply || reply === "." || reply.length < 5) {
        return res.json({
          reply: "Here are your profile details as requested.",
        });
      }
      return res.json({ reply });
    }

    // 2️⃣ Try to extract { intent: ... } from JSON-format reply
    let parsedIntent = null;
    try {
      // Use regex to find a JSON block anywhere in the assistant's answer
      const match = reply.match(/\{[\s\S]*?\}/);
      parsedIntent = match ? JSON.parse(match[0]) : null;
    } catch { parsedIntent = null; }

    if (parsedIntent?.intent === "check_availability") {
      const { room_type, dates } = parsedIntent;

      if (!room_type) {
        return res.json({ reply: "Certainly! Which type of room are you interested in? We have Standard, Deluxe, Executive, and Family rooms." });
      }
      if (!dates || dates.length < 2) {
        return res.json({ reply: `For what dates would you like to check the ${room_type} room?` });
      }

      // We have what we need, let's check the database!
      const [checkInDate, checkOutDate] = dates;
      const result = await findAvailableRoomsLogic(room_type, checkInDate, checkOutDate);

      let botReply;
      if (result.success) {
        botReply = `✅ Yes, we have ${room_type} rooms available from ${checkInDate} to ${checkOutDate}. You can proceed to the booking page to confirm your stay!`;
      } else {
        botReply = `❌ Unfortunately, we don't have any ${room_type} rooms available for those dates. Would you like to try a different date range or room type?`;
      }
      return res.json({ reply: botReply });
    }

    if (parsedIntent?.intent) {
      // Handle the booking, profile, or other intent in frontend
      return res.json({ ...parsedIntent, reply: "" });
    }

    // 3️⃣ Otherwise, return the natural language reply or fallback
    return res.json({
      reply: reply || "🤖 Sorry, I didn't understand. Could you please try again?",
    });
  } catch (error) {
    const errorMsg =
      error.response?.data?.error?.message ||
      error.message ||
      "Unexpected server error.";
    return res.status(500).json({
      reply: `❌ Assistant error: ${errorMsg}`,
    });
  }
});

export default chatRouter;
