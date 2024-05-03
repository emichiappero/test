const cheerio = require("cheerio");
const express = require("express");
const axios = require("axios");
let cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

//OpenAI API
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: "API-KEY",
});

async function generatePrompt(reelJson) {
  const prompt = `Genera un slug (hasta 5 palabras) en base al campo title, y un resumen del title. Los datos son: title: ${reelJson.title}, content: ${reelJson.content}. Genera un JSON`;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "gpt-4",
  });

  return completion.choices[0].message["content"];
}

async function getInstagramReel(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('meta[property="og:title"]').attr("content");
    const caption = $('meta[property="og:description"]').attr("content");
    const slug = $('meta[property="og:url"]').attr("content");

    let info = {
      title: title,
      content: caption,
      slug: slug,
      excerpt: caption,
    };

    return info;
  } catch (error) {
    console.error("Error scraping Instagram reel:", error);
    throw error;
  }
}

app.get("/scrape", async (req, res) => {
  try {
    const data = await getInstagramReel(url);
    console.log(data);

    //const reelJson = await extractReelDataFromURL(reelURL);
    const enhancedJSON = await generatePrompt(data);
    console.log(JSON.parse(enhancedJSON));
    res.json({ enhancedJSON });
  } catch (error) {
    res.status(500).json({ error: "Failed to scrape post" });
  }
});

app.post("/scrape", async (req, res) => {
  const url = req.body.url;

  const data = await getInstagramReel(url);
  const enhancedJSON = await generatePrompt(data);
  res.send({ data: JSON.parse(enhancedJSON) });
});

app.listen(4000);
