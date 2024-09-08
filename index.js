import express from "express";
import mongoose from "mongoose";
import shortid from "shortid";

const app = express();
app.use(express.json());

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
  visitHistory: [{ timestamp: { type: Number } }],
});

const Url = mongoose.model("url", urlSchema);

app.post("/shorten", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });

  const shortId = shortid.generate();
  await Url.create({
    shortId: shortId,
    redirectUrl: url,
    visitHistory: [],
  });
  res.status(200).json({ id: shortId });
});

app.get("/:shortUrl", async (req, res) => {
  console.log("sdfdasd", req.params);
  const url = await Url.findOne({ shortId: req.params.shortUrl });
  console.log("tyui", url);
  if (url) {
    res.redirect(url.redirectUrl);
  } else {
    res.status(404).send("URL not found");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
