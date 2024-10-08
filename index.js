import express from "express";
import mongoose from "mongoose";
import shortid from "shortid";
import cors from "cors";
import cron from "node-cron";

const app = express();
app.use(express.json());
app.use(cors({ origin: "https://url-shortner-client-tau.vercel.app" }));

mongoose.connect("mongodb+srv://badikaayushi:grfcAOQqlOyu0p8b@urlshortner.grrdf.mongodb.net/urlShortner");

const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  redirectUrl: {
    type: String,
    required: true,
  },
  visitHistory: { type: Number },
});

const Url = mongoose.model("url", urlSchema);

app.post("/shorten", async (req, res) => {
  let { url } = req.body;

  if (!url) return res.status(400).json({ error: "url is required" });

  if (!/^https?:\/\//i.test(url)) {
    url = "http://" + url;
  }

  const findUrl = await Url.findOne({ redirectUrl: url });

  if (findUrl) {
    res.status(200).json({ url: `https://urlshortnerserver-fnto.onrender.com/${findUrl.shortId}` });
  } else {
    const shortId = shortid.generate();

    await Url.create({
      shortId: shortId,
      redirectUrl: url,
      visitHistory: 0,
    });
    res.status(200).json({ url: `https://urlshortnerserver-fnto.onrender.com/${shortId}` });
  }
});

app.get("/:shortUrl", async (req, res) => {
  const url = await Url.findOne({ shortId: req.params.shortUrl });

  if (url) {
    url.visitHistory += 1;
    await url.save();
    res.redirect(301, url.redirectUrl);
  } else {
    res.status(404).send("URL not found");
  }
});

cron.schedule("* * * * *", () => {
  const time = new Date().toLocaleTimeString();
  console.log(`Server status: running at ${time}`);
});

app.listen(3000, () => console.log("Server running on port 3000"));
