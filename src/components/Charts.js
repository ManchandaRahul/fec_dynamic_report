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
  const issueTypes = data.typeData || [];
  const priorities = data.priorityData || [];
  const doneStatuses = data.statusData
    .filter((s) => String(s.name).toLowerCase().includes("done"))
    .sort((a, b) => b.value - a.value);

  const pendingStatuses = data.statusData
    .filter((s) => !String(s.name).toLowerCase().includes("done"))
    .sort((a, b) => b.value - a.value);

  // Common chart props for consistency
  const commonMargin = { top: 20, right: 30, left: 20, bottom: 40 };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "32px",
      padding: "0 8px"
    }}>
      {/* Row 1 - Two main charts side by side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
          gap: "28px",
        }}
      >
        {/* 1. Issue Type Distribution - Horizontal Bar */}
        <div className="chart-card">
          <h3 className="chart-title">Issue Type Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={issueTypes}
              layout="vertical"
              margin={commonMargin}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, "dataMax + 2"]} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{ fontSize: 13 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px"
                }} 
              />
              <Bar 
                dataKey="value" 
                fill={COLORS.primary} 
                radius={[0, 6, 6, 0]}
                minPointSize={6}
              >
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  fill="#374151" 
                  fontSize={13} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Priority Distribution - Horizontal Bar */}
        <div className="chart-card">
          <h3 className="chart-title">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={priorities}
              layout="vertical"
              margin={{ ...commonMargin, left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, "dataMax + 2"]} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{ fontSize: 13 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px"
                }} 
              />
              <Bar 
                dataKey="value" 
                fill={COLORS.warning} 
                radius={[0, 6, 6, 0]}
                minPointSize={6}
              >
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  fill="#374151" 
                  fontSize={13} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 - Status breakdowns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
          gap: "28px",
        }}
      >
        {/* Completed Tasks Status */}
        <div className="chart-card">
          <h3 className="chart-title">Completed Tasks Status</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={doneStatuses}
              layout="vertical"
              margin={{ ...commonMargin, left: 140 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, "dataMax + 2"]} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={140}
                tick={{ fontSize: 13 }}
              />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill={COLORS.success} 
                radius={[0, 6, 6, 0]}
                minPointSize={6}
              >
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  fill="#374151" 
                  fontSize={13} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pending/In Progress Tasks Status */}
        <div className="chart-card">
          <h3 className="chart-title">Pending / In Progress Tasks</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={pendingStatuses}
              layout="vertical"
              margin={{ ...commonMargin, left: 140 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, "dataMax + 2"]} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={140}
                tick={{ fontSize: 13 }}
              />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill={COLORS.primary} 
                radius={[0, 6, 6, 0]}
                minPointSize={6}
              >
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  fill="#374151" 
                  fontSize={13} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Optional: Add more charts later in new rows */}
    </div>
  );
}

// Reusable card style (add to your global CSS or keep inline)
// const cardStyle = {
//   background: "white",
//   borderRadius: "12px",
//   boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//   padding: "24px",
//   transition: "transform 0.2s, box-shadow 0.2s",
// };

// const titleStyle = {
//   margin: "0 0 20px 0",
//   fontSize: "1.4rem",
//   fontWeight: 600,
//   color: "#1f2937",
// };

// Apply styles via className or inline
// You can also move to a CSS file:
// .chart-card { ...cardStyle }
// .chart-title { ...titleStyle }

export default Charts;