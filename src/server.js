import express from "express";

const app = express();

// Requests and Responses

const handleHome = (req, res) => {
  return res.send("I still love you.");
};

const handleLogin = (req, res) => {
  return res.send("log in here.");
};

app.get("/", handleHome);
app.get("/login", handleLogin);

// Listening to User

const PORT = 3000;

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
