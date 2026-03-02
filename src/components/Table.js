import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";

function Table({ data, currentModule = "All" }) {
  const rows = useMemo(() => {
  return Array.isArray(data) ? data : [];
}, [data]);

  const [openRow, setOpenRow] = useState(null);

  // 🔥 NEW FILTER STATES (Added Only)
  // const [issueTypeFilter, setIssueTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // const [priorityFilter, setPriorityFilter] = useState("");
  // const [assigneeFilter, setAssigneeFilter] = useState("");

  // ✅ Safe Date Formatter (DD-MM-YYYY only, no timezone issues)
// ✅ Strict DD-MM-YYYY Safe Formatter
const formatDate = (value) => {
  if (!value) return "-";

  const raw = String(value).trim().split(" ")[0];

  // 🔥 If already DD-MM-YYYY → return as-is
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    return raw;
  }

  // 🔥 If ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [year, month, day] = raw.split("-");
    return `${day}-${month}-${year}`;
  }

  // 🔥 If JS Date object or other format
  const date = new Date(raw);

  if (isNaN(date.getTime())) {
    return raw;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};


  const toggleRow = (index) => {
    setOpenRow(openRow === index ? null : index);
  };

  // 🔥 UNIQUE VALUES FOR FILTER DROPDOWNS
  const uniqueValues = (key) =>
    [...new Set(rows.map((r) => r[key] || "Unknown"))].sort();

  // 🔥 FILTERED ROWS (Added Only)
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return (

        (!statusFilter || row.Status === statusFilter) 

      );
    });
  }, [rows,statusFilter]);

  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      alert("No visible rows to export");
      return;
    }

    const exportData = filteredRows.map((row) => ({
      "Issue Key": row.IssueKey || "-",
      Summary: row.Summary || "-",
      Status: row.Status || "Unknown",
      Priority: row.Priority || "Unknown",
      Assignee: row.Assignee || "Unassigned",
      "Start Date": formatDate(row.StartDate),
      "End Date": formatDate(row.EndDate),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    ws["!cols"] = Object.keys(exportData[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map((row) => String(row[key]).length)
      );
      return { wch: Math.min(maxLength + 4, 40) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Issues");

    const safeModule = currentModule.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Logisync_${safeModule}.xlsx`;

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
   {/* ✅ Filter by Status */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "500" }}>Filter by:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            fontSize: "0.9rem",
          }}
        >
          <option value="">All Statuses</option>
          {uniqueValues("Status").map((val) => (
            <option key={val}>{val}</option>
          ))}
        </select>

        <button
          onClick={() => setStatusFilter("")}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: "#f3f4f6",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Clear Filter
        </button>
      </div>

      {/* Header */}
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
        <h3 style={{ fontSize: "1.5rem", fontWeight: "600" }}>
          Issues
        </h3>

        <button
          onClick={handleExportExcel}
          disabled={filteredRows.length === 0}
          style={{
            padding: "8px 16px",
            backgroundColor: filteredRows.length ? "#2f855a" : "#cbd5e0",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: filteredRows.length ? "pointer" : "not-allowed",
          }}
        >
          Download Excel
        </button>
      </div>

      {filteredRows.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>
          No records found.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: "120px" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "130px" }} />
            </colgroup>

            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {[
                  "Issue Key",
                  "Summary",
                  "Status",
                  "Priority",
                  "Assignee",
                  "Start Date",
                  "End Date",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "14px 12px",
                      textAlign: "left",
                      fontWeight: "600",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    {heading}
                  </th>
                ))}
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
                      background:
                        openRow === idx
                          ? "#eff6ff"
                          : idx % 2 === 0
                          ? "#ffffff"
                          : "#f9fafb",
                    }}
                  >
                    <td style={{ padding: "12px" }}>{row.IssueKey || "-"}</td>
                    <td style={{ padding: "12px", wordBreak: "break-word" }}>
                      {row.Summary || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {row.Status || "Unknown"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {row.Priority || "Unknown"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {row.Assignee || "Unassigned"}
                    </td>
                    <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                      {formatDate(row.StartDate)}
                    </td>
                    <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                      {formatDate(row.EndDate)}
                    </td>
                  </tr>

                  {openRow === idx && (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          padding: "20px",
                          background: "#f9fafb",
                        }}
                      >
                        <strong>Description:</strong>
                        <div
                          style={{
                            marginTop: "8px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {row.Description || "No description available."}
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
