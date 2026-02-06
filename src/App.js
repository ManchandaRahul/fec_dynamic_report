import { useState, useEffect } from "react";
import KPI from "./components/KPI";
import Charts from "./components/Charts";
import Table from "./components/Table";
import Papa from "papaparse";

import LogisyncLogo from "./assets/logisync.jpeg";
import KaruyakiLogo1 from "./assets/kup.png";
function App() {
  const [csv1, setCsv1] = useState(null);
  const [csv2, setCsv2] = useState(null);
  const [csv3, setCsv3] = useState(null);
  const [csv4, setCsv4] = useState(null);

  const [processedData, setProcessedData] = useState(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get("admin");

    if (adminParam === "true") {
      setIsAdmin(true);
      sessionStorage.setItem("logisync-admin", "true");
    } else if (sessionStorage.getItem("logisync-admin") === "true") {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    const loadSavedReport = async () => {
      try {
        const response = await fetch("/latest-report.json");
        if (!response.ok) return;

        const data = await response.json();
        if (data && data.raw && Array.isArray(data.raw)) {
          setProcessedData(data);
          console.log("Loaded saved report from latest-report.json");
        }
      } catch (err) {
        console.log("No saved report or invalid format", err);
      }
    };

    if (!processedData) {
      loadSavedReport();
    }
  }, [processedData]);

  const parseCSVFile = (file) => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
      });
    });
  };

  const prepareDashboardData = (combined) => {
    const cleaned = combined
      .map(row => {
        const getField = (possibleNames) => {
          for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== null) {
              return row[name];
            }
            const lowerName = name.toLowerCase();
            if (row[lowerName] !== undefined && row[lowerName] !== null) {
              return row[lowerName];
            }
          }
          return "";
        };

        return {
          module: row.module || "",
          IssueKey: getField(["Issue key", "IssueKey", "issue key", "Issue Key"]),
          Summary: getField(["Summary", "summary"]),
          IssueType: getField(["Issue Type", "IssueType", "issue type"]),
          Status: getField(["Status", "status"]),
          Priority: getField(["Priority", "priority"]),
          Resolution: getField(["Resolution", "resolution"]),
          Assignee: getField(["Assignee", "assignee"]),
          Description: getField(["Description", "description"]),
          TimeSpent: parseInt(getField(["Time Spent", "Σ Time Spent"]) || "0", 10),
          Reporter: getField(["Reporter", "reporter"]),
          Creator: getField(["Creator", "creator"]),
          Created: getField(["Created", "created"]),
          Updated: getField(["Updated", "updated"]),
        };
      })
      .filter(row => {
        const hasKey = (row.IssueKey || "").trim().length > 0;
        const hasSummary = (row.Summary || "").trim().length > 2;
        return hasKey && hasSummary;
      });

    const countBy = (key) => {
      const map = {};
      cleaned.forEach((row) => {
        const val = row[key] || "Unknown";
        map[val] = (map[val] || 0) + 1;
      });

      if (key === "Priority") {
        return [
          { name: "Low", value: map["Low"] || 0 },
          { name: "Medium", value: map["Medium"] || 0 },
          { name: "High", value: map["High"] || 0 },
        ];
      }

      return Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    };

    const assignees = {};
    cleaned.forEach((row) => {
      const a = row.Assignee || "Unassigned";
      assignees[a] = (assignees[a] || 0) + 1;
    });

    const assigneeData = Object.entries(assignees)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      raw: cleaned,
      totalIssues: cleaned.length,
      statusData: countBy("Status"),
      priorityData: countBy("Priority"),
      typeData: countBy("IssueType"),
      resolutionData: countBy("Resolution"),
      assigneeData,
      totalTimeSpent: cleaned.reduce((sum, row) => sum + row.TimeSpent, 0),
    };
  };
  
  const downloadProcessedJson = (processed) => {
  if (!processed) return;

  const jsonString = JSON.stringify(processed, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "latest-report.json";
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const processAllFiles = async () => {
  if (!isAdmin || !csv1 || !csv2 || !csv3 || !csv4) return;

  setIsProcessing(true);
  try {
    const data1 = await parseCSVFile(csv1);
    const data2 = await parseCSVFile(csv2);
    const data3 = await parseCSVFile(csv3);
    const data4 = await parseCSVFile(csv4);

    const combined = [
      ...data1.map(r => ({ ...r, module: "Import Part 1" })),
      ...data2.map(r => ({ ...r, module: "Import Part 2" })),
      ...data3.map(r => ({ ...r, module: "M&S Track" })),
      ...data4.map(r => ({ ...r, module: "Payment Module" })),
    ];

    const prepared = prepareDashboardData(combined);
    setProcessedData(prepared);
    setSelectedModule("");

    // ← This is the missing part — trigger JSON download
    downloadProcessedJson(prepared);

    // Optional: user feedback
    alert("Processing complete! latest-report.json has been downloaded.\nPlace it in /public/ and redeploy.");
  } catch (error) {
    console.error("Processing failed:", error);
    alert("Error during processing. Check console for details.");
  } finally {
    setIsProcessing(false);
  }
};

  const getFilteredData = () => {
    if (!processedData || !selectedModule) return null;

    const filteredRows = processedData.raw.filter(
      (row) => row.module === selectedModule
    );

    return prepareDashboardData(filteredRows);
  };

  const filteredData = getFilteredData();

  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* New Header - Matches your photo positioning */}
      <div
        style={{
          background: "#1e40af",
          color: "white",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative", // ✅ ADD THIS
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        {/* Left: Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
         
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              margin: 0,
              letterSpacing: "0.5px",
            }}
          >
            Module Dashboard
          </h1>
<img
  src={LogisyncLogo}
  alt="Logisync"
  style={{
    height: "62px",
    objectFit: "contain",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)", // ✅ TRUE CENTER
  }}
/>
        </div>

      </div>

      {/* Main content - restored to earlier tighter layout */}
      <div
        style={{
            width: "1400px",
            maxWidth: "100%",     
          margin: "0 auto",
          flex: 1,
          padding: "0.1rem",
        }}
      >
        {/* Upload – admin only */}
        {isAdmin && (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              padding: "1.2rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: "600",
                color: "#2d3748",
                marginBottom: "1.2rem",
                textAlign: "center",
              }}
            >
              Upload CSV Files
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "0.75rem",
                marginBottom: "1.2rem",
              }}
            >
              {[
                { label: "Import Part 1 Module.csv", setter: setCsv1 },
                { label: "Import Part 2 Module.csv", setter: setCsv2 },
                { label: "M&S Track.csv", setter: setCsv3 },
                { label: "Payment Module - JIRA Task.csv", setter: setCsv4 },
              ].map(({ label, setter }, i) => (
                <div key={i}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.4rem",
                      fontWeight: "500",
                      color: "#4a5568",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setter(e.target.files[0])}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      border: "2px dashed #cbd5e0",
                      borderRadius: "8px",
                      background: "#f7fafc",
                      cursor: "pointer",
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={processAllFiles}
              disabled={isProcessing || !csv1 || !csv2 || !csv3 || !csv4}
              style={{
                display: "block",
                width: "100%",
                maxWidth: "320px",
                margin: "0 auto",
                padding: "0.7rem 1.5rem",
                background: isProcessing ? "#a0aec0" : "#4299e1",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: isProcessing || !csv1 || !csv2 || !csv3 || !csv4 ? "not-allowed" : "pointer",
              }}
            >
              {isProcessing ? "Processing..." : "Process All Files"}
            </button>
          </div>
        )}

        {/* Module selector */}
        {processedData && (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              padding: "1.2rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.4rem",
                fontWeight: "600",
                color: "#2d3748",
                marginBottom: "0.8rem",
              }}
            >
              Select Module to View
            </h3>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "0.7rem 1rem",
                border: "1px solid #cbd5e0",
                borderRadius: "10px",
                fontSize: "0.95rem",
                background: "#f7fafc",
              }}
            >
              <option value="">-- Choose a Module --</option>
              <option value="Import Part 1">Import Part 1</option>
              <option value="Import Part 2">Import Part 2</option>
              <option value="M&S Track">M&S Track</option>
              <option value="Payment Module">Payment Module</option>
            </select>
          </div>
        )}

        {/* Dashboard content - original tighter style */}
        {processedData ? (
          selectedModule ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  padding: "1.5rem",
                }}
              >
                <KPI data={filteredData} />
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  padding: "1.5rem",
                }}
              >
                <Charts data={filteredData} />
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  padding: "1.5rem",
                }}
              >
                <Table
                  data={filteredData?.raw || []}
                  currentModule={selectedModule}
                  // key={selectedModule}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                padding: "2.5rem 1.5rem",
                textAlign: "center",
                color: "#718096",
                fontSize: "1.1rem",
              }}
            >
              <p>Select a module above to view its detailed dashboard.</p>
            </div>
          )
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              padding: "3.5rem 2rem",
              textAlign: "center",
              color: "#718096",
            }}
          >
            <h2 style={{ color: "#2d3748", marginBottom: "1rem" }}>
              Dashboard not available yet
            </h2>
            <p style={{ fontSize: "1.1rem" }}>
              The report is currently empty.<br />
              Please check back later once data has been processed.
            </p>
            {!isAdmin && (
              <p style={{ marginTop: "1.5rem", fontSize: "0.95rem", color: "#a0aec0" }}>
                (Admins: add ?admin=true to the URL to upload files)
              </p>
            )}
          </div>
        )}

        {/* Footer - original */}
        <div
          style={{
            padding: "0.5rem 0",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            color: "#4a5568",
            fontSize: "0.85rem",
          }}
        >
          <span>Developed by</span>
          <img
            src={KaruyakiLogo1}
            alt="Karuyaki"
            style={{ height: "22px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;