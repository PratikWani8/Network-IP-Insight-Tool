import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Chart } from "chart.js/auto";

const DomainResolver = () => {
  const [hostname, setHostname] = useState("");
  const [ipv4, setIpv4] = useState([]);
  const [ipv6, setIpv6] = useState([]);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const createOrUpdateChart = (data) => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.host),
        datasets: [
          {
            label: "Lookup Time (ms)",
            data: data.map((d) => d.time),
            borderWidth: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  };

  useEffect(() => {
    if (chartData.length) {
      createOrUpdateChart(chartData);
    }
  }, [chartData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIpv4([]);
    setIpv6([]);

    if (!hostname.trim()) {
      setError("Please enter a valid domain.");
      return;
    }

    try {
      const res = await axios.get("/api/dns/resolve", {
        params: { hostname }
      });

      setIpv4(res.data.ipv4 || []);
      setIpv6(res.data.ipv6 || []);

      const newEntry = {
        host: res.data.hostname,
        time: res.data.timeMs
      };

      setChartData((prev) => {
        const updated = [...prev, newEntry];
        if (updated.length > 10) updated.shift();
        return updated;
      });
    } catch (err) {
      const msg =
        err.response?.data?.error || err.message || "DNS lookup failed";
      setError(msg);
    }
  };

  const handleCopy = (ip) => {
    navigator.clipboard.writeText(ip);
    const popup = document.getElementById("copyPopup");
    if (!popup) return;

    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
    }, 1500);
  };

  return (
    <>
      <h1>Network IP Resolver</h1>
      <p>Find IPv4 &amp; IPv6 Addresses using Google DNS Resolver</p>

      <form id="lookupForm" onSubmit={handleSubmit}>
        <input
          id="hostname"
          placeholder="Enter domain, e.g. google.com"
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && (
        <div
          style={{
            display: "block",
            color: "var(--error)",
            marginTop: "10px"
          }}
        >
          {error}
        </div>
      )}

      <div className="results">
        <strong>IPv4 (A):</strong>
        <ul id="ipv4List">
          {ipv4.map((ip) => (
            <li key={ip}>
              {ip}{" "}
              <button
                type="button"
                className="copy-btn"
                onClick={() => handleCopy(ip)}
              >
                Copy
              </button>
            </li>
          ))}
        </ul>

        <strong>IPv6 (AAAA):</strong>
        <ul id="ipv6List">
          {ipv6.map((ip) => (
            <li key={ip}>
              {ip}{" "}
              <button
                type="button"
                className="copy-btn"
                onClick={() => handleCopy(ip)}
              >
                Copy
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div id="chartContainer">
        <canvas id="dnsChart" ref={chartRef}></canvas>
      </div>
    </>
  );
};

export default DomainResolver;
