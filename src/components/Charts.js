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
  warning: "#f59e0b",
};

const STATUS_COLORS = [
  "#16a34a", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#a855f7", // violet
];

function Charts({
  moduleData,
  filteredData,
  selectedModule,
  selectedMonthKey,
  setSelectedMonthKey,
}) {
  if (!moduleData || !filteredData) return null;

  const doneStatuses = (filteredData?.statusData || [])
    .filter((s) => String(s.name).toLowerCase().includes("done"))
    .sort((a, b) => b.value - a.value);

  const desiredPendingStatuses = [
    "To Do",
    "UAT TO DO",
    "Development In Progress",
    "Testing TO DO",
  ];

  const pendingMap = new Map(
    (filteredData?.statusData || [])
      .filter((s) => !String(s.name).toLowerCase().includes("done"))
      .map((item) => [item.name, item.value])
  );

  const pendingStatuses = desiredPendingStatuses.map((status) => ({
    name: status,
    value: pendingMap.get(status) ?? 0,
  }));

  // ✅ Merged and sorted descending by value
  const allStatusData = [...doneStatuses, ...pendingStatuses].sort(
    (a, b) => b.value - a.value
  );

  const commonMargin = { top: 20, right: 40, left: 10, bottom: 20 };

  // Month logic (unchanged)
  const monthMap = {};
  const moduleRows = (moduleData?.raw || []).filter(
    (row) => row.module === selectedModule
  );

  moduleRows.forEach((row) => {
    if (!row.StartDate) return;
    let date;
    const value = row.StartDate.trim().split(" ")[0];
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [day, month, year] = value.split("-");
      date = new Date(`${year}-${month}-${day}`);
    } else if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      date = new Date(value);
    } else {
      date = new Date(value);
    }
    if (!date || isNaN(date)) return;
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { key: monthKey, year, month, count: 0 };
    }
    monthMap[monthKey].count += 1;
  });

  const monthData = Object.values(monthMap)
    .sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month
    )
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

  // ✅ Add this above the return statement
const moduleDescriptions = {
  "Import Part 1": "Data: Jul'24-Aug'24",
  "Import Part 2": "Data: Jan'25-Mar'25",
  "M&S Track": "Data: Apr'24-Feb'26",
  "Payment Module": "Data: Apr'24-Feb'26",
  // Add more modules as needed...
};

const moduleDescription = moduleDescriptions[selectedModule] || "";

  return (
    <div>


      {/* ✅ Task Status Overview — descending order, distinct colors */}
      <div style={{ marginTop: "32px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "12px" }}>
          Task Status Overview
        </h2>
        <ResponsiveContainer
          width="100%"
          height={Math.max(320, allStatusData.length * 55)}
        >
          <BarChart
            data={allStatusData}
            layout="vertical"
            margin={commonMargin}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={160} />
            <Tooltip />
            <Bar dataKey="value" barSize={26}>
              {allStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                />
              ))}
              <LabelList dataKey="value" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

            {/* Month-on-Month Trend */}
      {monthData.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Month-on-Month Tasks Trend
          </h2>
          {/* ✅ Dynamic description per module */}
{moduleDescription && (
  <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "16px", fontSize: "0.95rem" }}>
    {moduleDescription}
  </p>
)}

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthData} margin={commonMargin}>
              <CartesianGrid strokeDasharray="3 3" />
<XAxis
  dataKey="month"
  interval={selectedModule === "M&S Track" ? 0 : "preserveEnd"}
  angle={selectedModule === "M&S Track" ? -90 : 0}
  textAnchor={selectedModule === "M&S Track" ? "end" : "middle"}
  height={selectedModule === "M&S Track" ? 80 : 40}
/>
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
    </div>
  );
}

export default Charts;