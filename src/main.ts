import dotenv from "dotenv";
dotenv.config();

import express from "express";
import slowDown from "express-slow-down";
import axios, { AxiosError } from "axios";

const speedLimiter = slowDown({
  windowMs: 1000, // 15 minutes
  delayAfter: 3, // allow 100 requests per 15 minutes, then...
  delayMs: 300, // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});

const app = express();
app.use(speedLimiter)

const url = process.env.URL || "http://localhost:5000";

app.get("/referral", async (req, res) => {
  const { ref } = req.query;

  if (!ref) {
    return res.status(400).send("Missing ref");
  }

  try {
    const { data } = await axios.get(
      `${url}/referral?ref=${ref}`
    );
    res.send(data);
  } catch (e: any) {
    res.status(500).send(e.response.data);
  }
});

app.get("/ad/:uuid", async (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).send("Missing uuid");
  }

  try {
    const coreData = {
      uuid,
      ip: req.ip,
      referrer: req.get("referrer"),
      userAgent: req.get("user-agent"),
    };

    const { data } = await axios.post(`${url}/ad`, coreData);
    
    res.redirect(data.redirect)
  } catch (e: any) {
    res.redirect("https://sb.wosher.co");
  }
})

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server started`);
  console.log(`Listening on port ${port}`);
})