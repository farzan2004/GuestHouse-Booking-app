// Chatbot.jsx

import { useState, useRef, useEffect } from "react";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const userToken = localStorage.getItem("guestToken");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! How can I help you with the guest house today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastBookings, setLastBookings] = useState([]);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const tryBookingNumberCancel = async (inputText, config) => {
    if (!lastBookings.length) return false;
    const match = inputText.trim().match(/(?:cancel\s*booking\s*)?(\d+)/i);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (idx >= 0 && idx < lastBookings.length) {
        const bookingId = lastBookings[idx]._id;
        await axios.delete(
          `http://localhost:5000/api/user/Cancelbookings/${bookingId}`,
          config
        );
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "✅ Booking cancelled successfully!" },
        ]);
        setLastBookings([]);
        setInput("");
        setLoading(false);
        return true;
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "❌ Invalid booking number." },
        ]);
        setInput("");
        setLoading(false);
        return true;
      }
    }
    return false;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const config = {
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    };

    if (await tryBookingNumberCancel(input, config)) return;

    try {
      const chatResponse = await axios.post(
        "http://localhost:5000/api/chat",
        { messages: [...messages, userMessage] },
        config
      );

      const { reply, intent, bookingId } = chatResponse.data;
      let botReply = { sender: "bot", text: reply };

      if (intent === "show_bookings") {
        const res = await axios.get("http://localhost:5000/api/user/user/bookings", config);
        setLastBookings(res.data.bookings);
        botReply.text = res.data.bookings?.length
          ? "Your bookings:\n" +
            res.data.bookings
              .map(
                (b, i) =>
                  `${i + 1}. ${b.room?.type || b.room_type} | ${b.checkInDate?.slice(0, 10)} → ${b.checkOutDate?.slice(0, 10)} | ${b.status}`
              )
              .join("\n")
          : "No bookings found";
        setMessages((prev) => [...prev, botReply]);
      }

      else if (intent === "cancel_booking") {
        const res = await axios.get("http://localhost:5000/api/user/user/bookings", config);
        const activeBookings = res.data.bookings?.filter(
          b => b.status !== "Cancelled" && b.status !== "Rejected"
        );
        setLastBookings(activeBookings);
        if (activeBookings?.length > 1) {
          botReply.text =
            "You have multiple active bookings. Please specify which one to cancel (e.g., 'Cancel booking 1' or just '1').";
        } else if (activeBookings?.length === 1) {
          const bookingId = activeBookings[0]._id;
          await axios.delete(
            `http://localhost:5000/api/user/Cancelbookings/${bookingId}`,
            config
          );
          botReply.text = "✅ Booking cancelled successfully!";
          setLastBookings([]);
        } else {
          botReply.text = "You have no active bookings to cancel.";
        }
        setMessages((prev) => [...prev, botReply]);
      }

      else if (intent === "show_profile") {
        const profileRes = await axios.get("http://localhost:5000/api/user/getProfileData", config);
        const u = profileRes.data.userData || {};
        const profileFacts = `User profile: Name: ${u.name}, Email: ${u.email}, Phone: ${u.phone}`;
        const contextForLLM = [userMessage, { sender: "bot", text: profileFacts }];
        const llmRes = await axios.post(
          "http://localhost:5000/api/chat",
          { messages: contextForLLM },
          config
        );
        let replyText = llmRes.data.reply?.trim();
        const isInvalid =
          !replyText ||
          replyText === "." ||
          replyText.toLowerCase().includes("didn’t understand") ||
          replyText.toLowerCase().includes("please try again") ||
          replyText.length < 10;

        if (isInvalid) {
          const q = userMessage.text.toLowerCase();
          if (q.includes("email")) {
            replyText = `Your email is: ${u.email}`;
          } else if (q.includes("phone")) {
            replyText = `Your phone number is: ${u.phone}`;
          } else {
            replyText = `👤 Profile Details:\nName: ${u.name}\nEmail: ${u.email}\nPhone: ${u.phone}`;
          }
        }
        setMessages((prev) => [...prev, { sender: "bot", text: replyText }]);
        setInput("");
        setLoading(false);
        return;
      }

      else if (intent === "request_booking") {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "📌 I'm unable to make a reservation directly. Please use our online booking page or call the front desk at **123-456-7890**.\n\nIs there anything else I can help you with?",
          },
        ]);
        setInput("");
        setLoading(false);
        return;
      }

      else {
        setMessages((prev) => [...prev, botReply]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Service unavailable";
      setMessages((prev) => [...prev, { sender: "bot", text: `❌ Error: ${errorMsg}` }]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  const toggleChat = () => setIsOpen((x) => !x);

  return (
    <>
      {/* Floating Button */}
      <button
    onClick={toggleChat}
    style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      width: 50,
      height: 50,
      borderRadius: "50%",
      backgroundColor: "#537afa",
      color: "white",
      border: "none",
      cursor: "pointer",
      zIndex: 1000,
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      fontSize: "1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    aria-label={isOpen ? "Close chat" : "Open chat"}
    title={isOpen ? "Close chat" : "Open chat"}
  >
    💬
  </button>
      {!isOpen && (
    <div
      style={{
        position: "fixed",
        bottom: 30,
        right: 85,
        background: "#fff",
        color: "#333",
        padding: "10px 18px",
        borderRadius: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #eee",
        fontSize: "0.85rem",
        fontWeight: 500,
        zIndex: 1001,
        whiteSpace: "nowrap",
      }}
    >
      Need help?
    </div>
  )}

      {/* Chat Box */}

      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: 90,
          right: 20,
          width: 400,
          height: 600,
          maxHeight: "80vh",
          borderRadius: 18,
          backgroundColor: "#fff",
          boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 1000,
        }}>
          <div style={{
            padding: 18,
            background: "#4733B7",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.1rem",
            textAlign: "center",
          }}>
            Guest House Chatbot
          </div>
          <div ref={chatBoxRef} style={{
            flex: 1,
            minHeight: 120,
            maxHeight: 400,
            height: 400,
            overflowY: "auto",
            background: "#f9f8fe",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 10,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 14,
                maxWidth: "80%",
                wordBreak: "break-word",
                lineHeight: 1.4,
                marginLeft: msg.sender === "user" ? "auto" : undefined,
                background: msg.sender === "user"
                  ? "linear-gradient(90deg,#3370fc,#91e5fc)"
                  : "#f1f2fa",
                color: msg.sender === "user" ? "#fff" : "#242239",
              }}>
                <span style={{ fontSize: "1.2em", flexShrink: 0 }}>
                  {msg.sender === "user" ? "🧑" : "🤖"}
                </span>
                <span style={{ whiteSpace: "pre-line" }}>{msg.text}</span>
              </div>
            ))}
            {loading && (
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 14,
                background: "#f1f2fa",
                color: "#242239"
              }}>
                <span style={{ fontSize: "1.2em" }}>🤖</span>
                <span>⏳ Thinking...</span>
              </div>
            )}
          </div>
          <div style={{
            padding: 12,
            borderTop: "1px solid #ddd",
            background: "#f6f4fa",
            display: "flex",
            gap: 8,
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              style={{
                flex: 1,
                border: "none",
                padding: "10px 14px",
                borderRadius: 8,
                background: "#ecebf7",
                fontSize: "0.95em",
                outline: "none",
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                background: loading ? "#ccc" : "linear-gradient(90deg,#537afa,#6cd5fb)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0 20px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
