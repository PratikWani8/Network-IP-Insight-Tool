import axios from "axios";
import LookupLog from "../models/LookupLog.js";

export const lookupIP = async (req, res) => {
  try {
    const { ip } = req.query;
    if (!ip) {
      return res.status(400).json({ error: "ip query param is required" });
    }

    const start = Date.now();
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const end = Date.now();
    const timeMs = end - start;

    const data = response.data;

    if (data.error) {
      return res.status(400).json({ error: data.reason || "Invalid IP" });
    }

    // MongoDB
    await LookupLog.create({
      type: "ip",
      query: ip,
      responseTimeMs: timeMs,
      meta: {
        city: data.city,
        country: data.country_name,
        org: data.org,
        latitude: data.latitude,
        longitude: data.longitude
      }
    });

    res.json({
      ip: data.ip,
      city: data.city,
      region: data.region,
      countryName: data.country_name,
      countryCode: data.country,
      org: data.org,
      latitude: data.latitude,
      longitude: data.longitude,
      timeMs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "IP lookup failed", details: err.message });
  }
};
