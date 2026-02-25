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
  Cell,
} from "recharts";

const COLORS = {
  primary: "#3b82f6",
  success: "#16a34a",
  warning: "#f59e0b",
  gray: "#6b7280",
};

function Charts({ data, selectedMonthKey, setSelectedMonthKey }) {
  if (!data) return null;

  const issueTypesRaw = data.typeData || [];

const desiredIssueTypes = ["Story", "Task", "Sub-task"];

const typeMap = new Map(
  issueTypesRaw.map((item) => [item.name, item.value])
);

const issueTypes = desiredIssueTypes.map((name) => ({
  name,
  value: typeMap.get(name) ?? 0,
}));

  const priorities = data.priorityData || [];

  const doneStatuses = (data.statusData || [])
    .filter((s) => String(s.name).toLowerCase().includes("done"))
    .sort((a, b) => b.value - a.value);

  /* ---------------- FORCE ALL PENDING STATUS TYPES ---------------- */

const desiredPendingStatuses = [
  "To Do",
  "UAT TO DO",
  "Development In Progress",
  "Testing TO DO",
];

const pendingMap = new Map(
  (data.statusData || [])
    .filter((s) => !String(s.name).toLowerCase().includes("done"))
    .map((item) => [item.name, item.value])
);

const pendingStatuses = desiredPendingStatuses.map((status) => ({
  name: status,
  value: pendingMap.get(status) ?? 0,
}));


  const commonMargin = { top: 20, right: 20, left: 5, bottom: 20 };


  // 🔥 UNIVERSAL Month Logic (for ALL modules)
const monthMap = {};

(data.raw || []).forEach((row) => {
  if (!row.StartDate) return;

  let date;

  const value = row.StartDate.trim();

  // 🔥 Case 1: DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split("-");
    date = new Date(`${year}-${month}-${day}`);
  }
  // 🔥 Case 2: ISO or Jira format (YYYY-MM-DD or with time)
  else if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    date = new Date(value);
  }
  else {
    date = new Date(value);
  }

  if (!date || isNaN(date)) return;

  const year = date.getFullYear();
  const month = date.getMonth();

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  if (!monthMap[monthKey]) {
    monthMap[monthKey] = {
      key: monthKey,
      year,
      month,
      count: 0,
    };
  }

  monthMap[monthKey].count += 1;
});


  const monthData = Object.values(monthMap)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .map((item) => {
      const date = new Date(item.year, item.month);

      return {
        month: date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        count: item.count,
        key: item.key,
      };
    });

  return (
    <div>

      {/* 🔥 MAIN GRAPH FOR ALL MODULES */}
      {monthData.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Month-on-Month Issue Trend (Click to Filter)
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthData} margin={commonMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="count"
                onClick={(data) => {
                  if (!data) return;

                  if (selectedMonthKey === data.key) {
                    setSelectedMonthKey(null);
                  } else {
                    setSelectedMonthKey(data.key);
                  }
                }}
              >
                {monthData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      selectedMonthKey === entry.key
                        ? COLORS.warning
                        : COLORS.primary
                    }
                  />
                ))}
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Row 1 */}
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 45%", minWidth: "320px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
            Issue Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={issueTypes} layout="vertical" margin={commonMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.primary}>
                <LabelList dataKey="value" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* <div style={{ flex: "1 1 45%", minWidth: "320px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
            Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorities} layout="vertical" margin={commonMargin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.success}>
                <LabelList dataKey="value" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          marginTop: "32px",
        }}
      >
        <div style={{ flex: "1 1 45%", minWidth: "320px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
            Completed Tasks Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={doneStatuses} layout="vertical" margin={commonMargin}>
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

<div style={{ flex: "1 1 45%", minWidth: "320px" }}>
  <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
    Pending / In Progress Tasks
  </h3>

  {pendingStatuses.length === 0 ? (
    <div
      style={{
        height: 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0fdf4",
        borderRadius: "12px",
        border: "1px solid #bbf7d0",
        color: "#166534",
        fontWeight: "600",
        fontSize: "1.05rem",
        textAlign: "center",
        padding: "20px",
      }}
    >
      All tasks completed.
      <br />
      No pending or in-progress items.
    </div>
  ) : (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={pendingStatuses}
        layout="vertical"
        margin={commonMargin}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={120} />
        <Tooltip />
        <Bar dataKey="value" fill={COLORS.warning} barSize={28}>
          <LabelList dataKey="value" position="right" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )}
</div>

      </div>
    </div>
  );
}

export default Charts;
