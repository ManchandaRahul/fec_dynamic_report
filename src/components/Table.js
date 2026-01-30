import React, { useState } from "react";
import * as XLSX from "xlsx";  // ← Added for Excel export

const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";

function Table({ data, currentModule = "All" }) {
  const rows = Array.isArray(data) ? data : [];
  const [openRow, setOpenRow] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [prefixFilter, setPrefixFilter] = useState("All");
  const [moduleNameFilter, setModuleNameFilter] = useState("All");

  const toggleRow = (index) => {
    setOpenRow(openRow === index ? null : index);
  };

  const showFilters = true;

  // ────────────────────────────────────────────────
  // Filter helper functions (unchanged)
  // ────────────────────────────────────────────────
  const getCategory = (summary = "") => {
    const match = summary.match(/\[([^\]]+)\]/);
    return match ? match[1].trim() : "None";
  };

  const getPrefix = (summary = "") => {
    if (!summary) return "None";
    const index = summary.indexOf(";");
    if (index !== -1) {
      const prefix = summary.substring(0, index).trim();
      return prefix.length > 0 ? prefix : "None";
    }
    return "None";
  };

  const getModuleName = (summary = "") => {
    if (!summary) return null;
    const colonIndex = summary.indexOf(":");
    if (colonIndex === -1) return null;

    let candidate = summary.substring(0, colonIndex).trim();
    if (/\[.*?\]/.test(candidate)) return null;
    if (/http|www|\.com|\.net|\.org|\.in|\.co/i.test(candidate)) return null;
    if (candidate.length < 3) return null;

    return candidate;
  };

  // Apply filters
  const filteredRows = rows.filter((row) => {
    const summary = row.Summary || "";

    let catMatch = true;
    if (categoryFilter !== "All") {
      const cat = getCategory(summary);
      catMatch = cat.toLowerCase().includes(categoryFilter.toLowerCase());
    }

    let prefixMatch = true;
    if (prefixFilter !== "All") {
      const prefix = getPrefix(summary);
      prefixMatch = prefix.toLowerCase().includes(prefixFilter.toLowerCase());
    }

    let moduleNameMatch = true;
    if (moduleNameFilter !== "All") {
      const modName = getModuleName(summary);
      moduleNameMatch = modName && modName.toLowerCase().includes(moduleNameFilter.toLowerCase());
    }

    return catMatch && prefixMatch && moduleNameMatch;
  });

  // Unique values for dropdowns (unchanged)
  const uniquePrefixes = [...new Set(rows.map((r) => getPrefix(r.Summary)))]
    .filter((p) => p !== "None" && p.length > 0)
    .sort();

  const uniqueModuleNamesRaw = rows
    .map((r) => getModuleName(r.Summary))
    .filter((m) => m !== null && m.length > 0);

  const moduleNameMap = new Map();

  uniqueModuleNamesRaw.forEach((name) => {
    let normalized = name.toLowerCase();

    if (normalized.startsWith("btbt")) {
      normalized = "btbt";
    } else if (normalized.includes("import")) {
      normalized = "import";
    } else if (normalized.includes("ooc tab")) {
      normalized = "ooc tab";
    } else if (normalized.includes("bond expiry panel") || normalized.includes("bond (expiry panel)")) {
      normalized = "bond expiry panel";
    }

    if (!moduleNameMap.has(normalized)) {
      const titleCase =
        normalized === "btbt" ? "BTBT" :
        normalized === "import" ? "Import" :
        normalized === "ooc tab" ? "OOC Tab" :
        normalized === "bond expiry panel" ? "Bond Expiry Panel" :
        name
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      moduleNameMap.set(normalized, titleCase);
    }
  });

  const uniqueModuleNames = [...moduleNameMap.values()].sort();

  const showModuleNameFilter =
    currentModule === "M&S Track" ||
    currentModule === "Payment Module" ||
    currentModule === "All";

  // ────────────────────────────────────────────────
  // NEW: Export only currently filtered/visible rows
  // ────────────────────────────────────────────────
  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      alert("No visible rows to export (all filtered out)");
      return;
    }

    const columns = [
      { key: "IssueKey",      header: "Issue Key" },
      { key: "Summary",       header: "Summary" },
      { key: "IssueType",     header: "Issue Type" },
      { key: "WorkCategory",  header: "Work Category" },
      { key: "Status",        header: "Status" },
      { key: "Priority",      header: "Priority" },
      { key: "Assignee",      header: "Assignee" },
    ];

    const exportData = filteredRows.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        let value = row[col.key];

        // Match table display fallbacks
        if (value === undefined || value === null) {
          if (col.key === "IssueKey") value = row["Issue key"] || "-";
          if (col.key === "IssueType") value = row["Issue Type"] || "Unknown";
          if (col.key === "Assignee")  value = value || "Unassigned";
          if (col.key === "WorkCategory") value = value || "Other";
        }

        obj[col.header] = value ?? "";
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-adjust column widths
    ws["!cols"] = columns.map((col) => {
      let max = col.header.length;
      exportData.forEach((r) => {
        const len = String(r[col.header] || "").length;
        if (len > max) max = len;
      });
      return { wch: Math.min(max + 4, 70) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentModule || "Filtered Issues");

    const dateStr = new Date().toISOString().slice(0, 10);
    const moduleSafe = (currentModule || "All").replace(/[^a-zA-Z0-9-]/g, "_");
    const filename = `Logisync_${moduleSafe}_filtered_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1f2937" }}>
          Recent Issues (Click row to expand)
        </h3>

        {showFilters && (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Category Filter */}
            <div>
              <label style={{ marginRight: "8px", fontWeight: "500", fontSize: "14px" }}>
                Category:
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setOpenRow(null);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e0",
                  fontSize: "14px",
                  minWidth: "160px",
                  background: "#f9fafb",
                }}
              >
                <option value="All">All</option>
                <option value="test case">Test Case</option>
                <option value="Feedback">Feedback</option>
                <option value="feedback points">Feedback Points</option>
                <option value="development">Development</option>
                <option value="enhancement">Enhancement</option>
                <option value="live support">Live Support</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Prefix Filter */}
            {uniquePrefixes.length > 0 && (
              <div>
                <label style={{ marginRight: "8px", fontWeight: "500", fontSize: "14px" }}>
                  Prefix (before ;):
                </label>
                <select
                  value={prefixFilter}
                  onChange={(e) => {
                    setPrefixFilter(e.target.value);
                    setOpenRow(null);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e0",
                    fontSize: "14px",
                    minWidth: "200px",
                    background: "#f9fafb",
                  }}
                >
                  <option value="All">All</option>
                  {uniquePrefixes.map((prefix) => (
                    <option key={prefix} value={prefix}>
                      {prefix}
                    </option>
                  ))}
                  <option value="Others">Others</option>
                </select>
              </div>
            )}

            {/* Module Name Filter */}
            {showModuleNameFilter && uniqueModuleNames.length > 0 && (
              <div>
                <label style={{ marginRight: "8px", fontWeight: "500", fontSize: "14px" }}>
                  Module Name:
                </label>
                <select
                  value={moduleNameFilter}
                  onChange={(e) => {
                    setModuleNameFilter(e.target.value);
                    setOpenRow(null);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e0",
                    fontSize: "14px",
                    minWidth: "220px",
                    background: "#f9fafb",
                  }}
                >
                  <option value="All">All</option>
                  {uniqueModuleNames.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                  <option value="None">None</option>
                </select>
              </div>
            )}

            {/* Export Button */}
            <button
              onClick={handleExportExcel}
              disabled={filteredRows.length === 0}
              style={{
                padding: "8px 16px",
                backgroundColor: filteredRows.length > 0 ? "#2f855a" : "#cbd5e0",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: filteredRows.length > 0 ? "pointer" : "not-allowed",
                minWidth: "160px",
                marginLeft: "auto", // push to right if space allows
              }}
            >
              Download Excel
            </button>
          </div>
        )}
      </div>

      {filteredRows.length === 0 ? (
        <p style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
          No records match the selected filters.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "14px 12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                  Issue Key
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                  Summary
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                  Issue Type
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                  Work Category
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                  Status
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                  Priority
                </th>
                <th style={{ padding: "14px 12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>
                  Assignee
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, idx) => (
                <React.Fragment key={idx}>
                  <tr
                    onClick={() => toggleRow(idx)}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      cursor: "pointer",
                      background: openRow === idx ? "#eff6ff" : idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                      transition: "background 0.2s",
                    }}
                  >
                    <td style={{ padding: "14px 12px" }}>
                      {row.IssueKey || row["Issue key"] || "-"}
                    </td>
                    <td style={{ padding: "14px 12px" }}>{row.Summary || "-"}</td>
                    <td style={{ padding: "14px 12px" }}>
                      {row.IssueType || row["Issue Type"] || "Unknown"}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "9999px",
                          fontSize: "13px",
                          fontWeight: "500",
                          backgroundColor:
                            row.WorkCategory === "Development" ? "#d1fae5" :
                            row.WorkCategory === "Testing/QA" ? "#fef3c7" :
                            row.WorkCategory === "Feedback/UAT" ? "#dbeafe" :
                            row.WorkCategory === "Master Data / Config" ? "#e5e7eb" :
                            row.WorkCategory === "Coordination / UI/Design" ? "#f3e8ff" :
                            "#f3f4f6",
                          color:
                            row.WorkCategory === "Development" ? "#065f46" :
                            row.WorkCategory === "Testing/QA" ? "#92400e" :
                            row.WorkCategory === "Feedback/UAT" ? "#1e40af" :
                            row.WorkCategory === "Master Data / Config" ? "#1f2937" :
                            row.WorkCategory === "Coordination / UI/Design" ? "#6b21a8" :
                            "#4b5563",
                        }}
                      >
                        {row.WorkCategory || "Other"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "9999px",
                          fontSize: "13px",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                          display: "inline-block",
                          backgroundColor:
                            row.Status === "Done" ? "#dcfce7" :
                            row.Status === "In Progress" ? "#dbeafe" :
                            row.Status === "Blocked" ? "#fee2e2" :
                            row.Status === "To Do" ? "#f3f4f6" :
                            "#e5e7eb",
                          color:
                            row.Status === "Done" ? "#166534" :
                            row.Status === "In Progress" ? "#1e40af" :
                            row.Status === "Blocked" ? "#991b1b" :
                            row.Status === "To Do" ? "#374151" :
                            "#1f2937",
                        }}
                      >
                        {row.Status || "Unknown"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 12px" }}>{row.Priority || "Unknown"}</td>
                    <td style={{ padding: "14px 12px" }}>{row.Assignee || "Unassigned"}</td>
                  </tr>

                  {openRow === idx && (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          background: "#f9fafb",
                          padding: "20px",
                          borderLeft: "4px solid #3b82f6",
                        }}
                      >
                        <div style={{ lineHeight: "1.8" }}>
                          <strong>Description:</strong>
                          <div style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>
                            {row.Description || "No description available."}
                          </div>

                          <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div><strong>Reporter:</strong> {row.Reporter || "N/A"}</div>
                            <div><strong>Creator:</strong> {row.Creator || "N/A"}</div>
                            <div><strong>Created Date:</strong> {row.Created || "N/A"}</div>
                            <div><strong>Updated Date:</strong> {row.Updated || "N/A"}</div>
                            <div><strong>Module:</strong> {row.module || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Table;