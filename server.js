const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  console.log("🔹 Received from browser:", userMessage);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Leverages AI to fact-check and provide reliable medical information. Google extension that checks websites for health misinformation and bias. Users can input their symptoms and receive evidence-based, multi-perspective advice (Western medicine, TCM, etc.) Auto-generated data on how many people found certain treatments effective (crowdsourced validation). Most questions will be related about female medical problems, give advice, potential solutions, and offer places to seek treatment based on location, make sure to source information from mostly female researchers. cite sources make it fairly brief only make it respond to medical related things. any other things say "Sorry, but that topic is outside my expertise."' },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    console.log("🟢 OpenAI Response:", JSON.stringify(data, null, 2));

    if (data.error) {
      res.json({ reply: `❌ OpenAI error: ${data.error.message}` });
    } else {
      const reply = data.choices[0].message.content;
      res.json({ reply });
    }
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ reply: `Server error: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
