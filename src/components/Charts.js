import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const COLORS = {
  primary: "#3b82f6",
  success: "#16a34a",
  warning: "#f59e0b",
  gray: "#6b7280",
};

function Charts({ data }) {
  if (!data) return null;

  // Prepare data with fallbacks
  const issueTypesRaw = data.typeData || [];

  // Define all issue types you want to ALWAYS show (even with 0)
  const desiredIssueTypes = [
    "Story",
    "Sub-task",
    "Task",
    // Add more types if needed, e.g. "Spike", "Improvement", etc.
  ];

  // Create a map from your real data for quick lookup
  const typeMap = new Map(
    issueTypesRaw.map((item) => [item.name, item.value])
  );

  // Build final data — always include every desired type
  const issueTypes = desiredIssueTypes.map((name) => ({
    name,
    value: typeMap.get(name) ?? 0, // 0 if not found
  }));

  // Sort by value descending (or keep original desired order)
  // issueTypes.sort((a, b) => b.value - a.value); // ← uncomment if you prefer sorting

  const priorities = data.priorityData || [];

  const doneStatuses = data.statusData
    .filter((s) => String(s.name).toLowerCase().includes("done"))
    .sort((a, b) => b.value - a.value);

  const pendingStatuses = data.statusData
    .filter((s) => !String(s.name).toLowerCase().includes("done"))
    .sort((a, b) => b.value - a.value);

  const commonMargin = { top: 20, right: 30, left: 20, bottom: 40 };

  return (
    <div>
      {/* Row 1 - Two main charts side by side */}
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* 1. Issue Type Distribution - Horizontal Bar */}
        <div style={{ flex: "1 1 45%", minWidth: "320px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
            Issue Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={issueTypes}
              layout="vertical"
              margin={commonMargin}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.primary}>
                <LabelList dataKey="value" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Priority Distribution - Horizontal Bar */}
        <div style={{ flex: "1 1 45%", minWidth: "320px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
            Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={priorities}
              layout="vertical"
              margin={commonMargin}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.success}>
                <LabelList dataKey="value" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 - Status breakdowns */}
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginTop: "32px" }}>
        {/* Completed Tasks Status */}
        <div style={{ flex: "1 1 45%", minWidth: "320px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
            Completed Tasks Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={doneStatuses}
              layout="vertical"
              margin={commonMargin}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={140} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.success}>
                <LabelList dataKey="value" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pending / In Progress Tasks */}
        <div style={{ flex: "1 1 45%", minWidth: "320px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
            Pending / In Progress Tasks
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={pendingStatuses}
              layout="vertical"
              margin={commonMargin}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={140} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.warning}>
                <LabelList dataKey="value" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Charts;