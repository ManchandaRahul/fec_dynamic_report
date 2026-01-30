import React from "react";

function KPI({ data }) {
  if (!data) return null;

  const kpis = [
    {
      label: "Total Issues",
      value: data.totalIssues,
      color: "#1e3a8a"
    },
    {
      label: "Issue Types",
      value: data.typeData.length,
      color: "#3b82f6"
    },
    {
      label: "Status Categories",
      value: data.statusData.length,
      color: "#10b981"
    },
    {
      label: "Active Assignees",
      value: data.assigneeData.length,
      color: "#f59e0b"
    }
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "16px"
      }}
    >
      {kpis.map((k, idx) => (
        <div
          key={idx}
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
            {k.label}
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              color: k.color
            }}
          >
            {k.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KPI;
