import { useEffect, useState, useRef } from "react";
import { FaArrowUp, FaCopy, FaMagic } from "react-icons/fa";
import { callChat } from "../services/api";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatBot = () => {
  const location = useLocation();
  const [input, setInput] = useState(location.state?.input || "");
  const [messages, setMessages] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loading, setLoading] = useState();
  const [thinkingPhrase, setThinkingPhrase] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const funnyThinkingPhrases = [
    "Summoning the Genie’s wisdom...",
    "Polishing my magic lamp...",
    "Consulting the ancient scrolls of knowledge...",
    "Channeling the mystical energies...",
    "Granting wishes, one answer at a time...",
    "Whispering to the spirits of wisdom...",
    "Harnessing the cosmic powers...",
    "Unlocking the secrets of the Genie realm...",
    "Deciphering the runes of intelligence...",
    "Gathering stardust for a magical response..."
  ];  

  useEffect(() => {
    let intervalId;
    if (loading) {
      intervalId = setInterval(() => {
        setThinkingPhrase((prev) => (prev + 1) % funnyThinkingPhrases.length);
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [loading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    try {
      setLoading(true);
      const data = await callChat(input);

      const botMessage = { sender: "bot", text: data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { sender: "bot", text: "Sorry, an error occurred." };
      setMessages((prev) => [...prev, errorMessage]);
    }
    
    setLoading(false)
    setInput("");
  };

  useEffect(() => {
    if (location.state?.input) {
      sendMessage(location.state.input);
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");

      if (!inline && match) {
        const codeContent = String(children).replace(/\n$/, "");
        const language = match[1];
        const codeId = `code-${Math.random().toString(36).substring(2, 9)}`;

        return (
          <div className="relative group" key={codeId}>
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={language}
              PreTag="div"
              {...props}
            >
              {codeContent}
            </SyntaxHighlighter>
            <button
              onClick={() => copyToClipboard(codeContent, codeId)}
              className="absolute top-2 right-2 p-2 bg-gray-800 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Copy code"
            >
              <FaCopy size={16} />
              {copiedIndex === codeId && (
                <span className="absolute -top-8 right-0 text-xs bg-black text-white px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </button>
          </div>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    a({ node, children, ...props }) {
      // Handle links with custom target="_blank"
      return (
        <a {...props} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  };

  return (
    <div className="flex flex-col w-full mt-10 max-h">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 sm:mx-8 mb-14 scrollbar-hide">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.sender === "user"
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white self-end ml-auto shadow-md max-w-lg"
                : "bg-yellow-200 text-black shadow-sm w-full max-w-3xl"
            }`}
          >
            {msg.sender === "user" ? (
              <p className="text-sm leading-relaxed">{msg.text}</p>
            ) : (
              <div className="prose max-w-none text-sm leading-relaxed">
                <ReactMarkdown components={components}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="p-3 rounded-lg bg-yellow-200 text-black shadow-sm w-full max-w-3xl animate-pulse">
            <div className="flex items-center gap-3">
              <FaMagic className="text-purple-600 animate-spin text-xl" />
              <p className="font-medium text-purple-800">
                {funnyThinkingPhrases[thinkingPhrase]}
                <span className="animate-[bounce_1s_infinite]">.</span>
                <span className="animate-[bounce_1s_infinite_0.2s]">.</span>
                <span className="animate-[bounce_1s_infinite_0.4s]">.</span>
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 py-3 bg-cyan-300 rounded-full shadow-lg flex items-center space-x-3 border border-gray-300">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="SmartGenie is here for you..."
          className="flex-1 px-3 py-2 border-none rounded-lg focus:outline-none text-black shadow-sm resize-none max-h-24"
          rows="1"
          style={{ overflowY: "auto", wordWrap: "break-word" }}
        />
        <button
          onClick={() => sendMessage()}
          className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:opacity-80 transition-all duration-300 shadow-sm"
        >
          <FaArrowUp className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
