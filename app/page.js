"use client";
import { useState, useEffect } from "react";
import { Button, TextField, Typography, Select, MenuItem, Container, Box, Snackbar, IconButton, Paper } from "@mui/material";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import CloseIcon from '@mui/icons-material/Close';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState(null);

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const MODEL_NAME = "gemini-1.0-pro";
  const genAI = new GoogleGenerativeAI(API_KEY);

  const generationConfig = {
    temperature: 0.9,
    topP: 1,
    maxOutputTokens: 2048,
    responseMimeType: "text/plain",
  };

  const safetySetting = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }
  ];

  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = await genAI
          .getGenerativeModel({ model: MODEL_NAME })
          .startChat({
            generationConfig,
            safetySetting,
            history: messages.map((msg) => ({
              text: msg.text,
              role: msg.role,
            })),
          });
        setChat(newChat);
      } catch (error) {
        setError("Failed to initialize chat. Please try again.");
      }
    };

    initChat();
  }, []);

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: "user",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");
      if (chat) {
        const result = await chat.sendMessage(userInput);
        const botMessage = {
          text: result.response.text(),
          role: "bot",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      setError("Failed to send message. Please try again.");
    }
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  const getThemeColors = () => {
    switch (theme) {
      case "light":
        return {
          primary: "#ffffff",
          secondary: "#f0f0f0",
          accent: "#2196f3",
          text: "#333333",
        };
      case "dark":
        return {
          primary: "#121212",
          secondary: "#1e1e1e",
          accent: "#ffeb3b",
          text: "#e0e0e0",
        };
      default:
        return {
          primary: "#ffffff",
          secondary: "#f0f0f0",
          accent: "#2196f3",
          text: "#333333",
        };
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const { primary, secondary, accent, text } = getThemeColors();

  return (
    <Container
      component={Paper}
      style={{ backgroundColor: primary, height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" style={{ color: text }}>Virtual Assistant ChatBot</Typography>
        <Box display="flex" alignItems="center">
          <Typography variant="body2" style={{ color: text, marginRight: '8px' }}>Theme:</Typography>
          <Select
            value={theme}
            onChange={handleThemeChange}
            style={{ color: text, borderColor: text }}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </Select>
        </Box>
      </Box>
      <Box
        flex={1}
        overflow="auto"
        style={{ backgroundColor: secondary, borderRadius: '4px', padding: '8px' }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection={msg.role === "user" ? "row-reverse" : "row"}
            mb={2}
          >
            <Box
              p={2}
              borderRadius="8px"
              style={{
                backgroundColor: msg.role === "user" ? accent : primary,
                color: msg.role === "user" ? "#ffffff" : text,
                maxWidth: '75%',
              }}
            >
              {msg.text}
            </Box>
            <Typography
              variant="caption"
              style={{ color: text, marginLeft: '8px', alignSelf: 'flex-end' }}
            >
              {msg.role === "bot" ? "Bot" : "You"} - {msg.timestamp.toLocaleTimeString()}
            </Typography>
          </Box>
        ))}
      </Box>
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          message={error}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      )}
      <Box display="flex" alignItems="center" mt={2}>
        <TextField
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          variant="outlined"
          fullWidth
          style={{ marginRight: '8px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          style={{ backgroundColor: accent, color: '#ffffff' }}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
}