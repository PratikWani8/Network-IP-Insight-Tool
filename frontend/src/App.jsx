import React from "react";
import DomainResolver from "./components/DomainResolver.jsx";
import IpLookup from "./components/IpLookup.jsx";

const App = () => {
  return (
    <div className="tool">
      <div className="intro">
        <h2>Network IP Insight Tool</h2>
        <p>
          A fast and reliable toolkit for DNS, IP lookup, and network
          diagnostics built to help you analyze, troubleshoot, and understand
          networks with ease.
        </p>
      </div>

      <div className="pppp">
        <div className="container">
          <DomainResolver />
          <footer
            style={{ marginTop: "10px", fontSize: "0.8rem", color: "#555" }}
          >
            © 2025 • Pratik Wani • Network Tools
          </footer>
        </div>

        <div className="container-2">
          <IpLookup />
          <footer
            style={{ marginTop: "10px", fontSize: "0.8rem", color: "#555" }}
          >
            © 2025 • Pratik Wani • Network Tools
          </footer>
        </div>
      </div>

      <div id="copyPopup" className="copy-popup">
        IP Address Copied to Clipboard!
      </div>
    </div>
  );
};

export default App;
