import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const IpLookup = () => {
  const [ip, setIp] = useState("");
  const [ipData, setIpData] = useState(null);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const handleLookup = async () => {
    setError("");
    setIpData(null);

    if (!ip.trim()) {
      setError("Please enter an IP address.");
      return;
    }

    try {
      const res = await axios.get("/api/ip/lookup", {
        params: { ip }
      });
      setIpData(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.error || err.message || "IP lookup failed";
      setError(msg);
    }
  };

  useEffect(() => {
    if (!ipData || !ipData.latitude || !ipData.longitude) return;

    const { latitude, longitude, city, countryName } = ipData;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.off();
      mapInstanceRef.current.remove();
    }

    mapInstanceRef.current = L.map(mapRef.current).setView(
      [latitude, longitude],
      10
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(mapInstanceRef.current);

    L.marker([latitude, longitude])
      .addTo(mapInstanceRef.current)
      .bindPopup(`${city || ""}, ${countryName || ""}`)
      .openPopup();
  }, [ipData]);

  return (
    <>
      <h1>Network IP Lookup</h1>
      <p>Get Location and ISP details for any IP Address</p>

      <div className="input-group">
        <input
          type="text"
          id="ipInput"
          placeholder="Enter IP address..."
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />
        <button id="lookupBtn" type="button" onClick={handleLookup}>
          Search
        </button>
      </div>

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

      <div id="result" className="result-box">
        {ipData && (
          <>
            <h3>IP Information</h3>
            <p>
              <b>IP:</b> {ipData.ip}
            </p>
            <p>
              <b>City:</b> {ipData.city}
            </p>
            <p>
              <b>Region:</b> {ipData.region}
            </p>
            <p>
              <b>Country:</b> {ipData.countryName} ({ipData.countryCode})
            </p>
            <p>
              <b>ISP:</b> {ipData.org}
            </p>
            <p>
              <b>Latitude:</b> {ipData.latitude}
            </p>
            <p>
              <b>Longitude:</b> {ipData.longitude}
            </p>
          </>
        )}
      </div>

      <div id="map" ref={mapRef}></div>
    </>
  );
};

export default IpLookup;
