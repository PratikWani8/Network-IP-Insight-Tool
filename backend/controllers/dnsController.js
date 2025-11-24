import axios from "axios";
import LookupLog from "../models/LookupLog.js";

function normalizeHost(input) {
  try {
    const url = input.includes("//") ? input : "https://" + input;
    return new URL(url).hostname;
  } catch {
    return input.replace(/^https?:\/\//i, "").replace(/\/.*/, "").trim();
  }
}

export const resolveDNS = async (req, res) => {
  try {
    const { hostname } = req.query;
    if (!hostname) {
      return res.status(400).json({ error: "hostname query param is required" });
    }

    const name = normalizeHost(hostname);

    const start = Date.now();
    const [aRes, aaaaRes] = await Promise.all([
      axios.get("https://dns.google/resolve", {
        params: { name, type: "A" }
      }),
      axios.get("https://dns.google/resolve", {
        params: { name, type: "AAAA" }
      })
    ]);
    const end = Date.now();
    const timeMs = end - start;

    const getIPs = (d) =>
      Array.isArray(d.Answer) ? d.Answer.map((a) => a.data.split(" ")[0]) : [];

    const ipv4 = getIPs(aRes.data);
    const ipv6 = getIPs(aaaaRes.data);

    if (!ipv4.length && !ipv6.length) {
      return res.status(404).json({ error: "No A or AAAA records found." });
    }

    // MongoDB
    await LookupLog.create({
      type: "dns",
      query: name,
      responseTimeMs: timeMs,
      meta: { ipv4Count: ipv4.length, ipv6Count: ipv6.length }
    });

    res.json({
      hostname: name,
      ipv4,
      ipv6,
      timeMs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "DNS lookup failed", details: err.message });
  }
};
