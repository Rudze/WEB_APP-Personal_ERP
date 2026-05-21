import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export function WidgetRenderer({ widget }) {
  const { type, config } = widget;

  switch (type) {
    case "bar":
      return <BarChartWidget config={config} />;
    case "line":
      return <LineChartWidget config={config} />;
    case "pie":
      return <PieChartWidget config={config} />;
    case "kpi":
      return <KPIWidget config={config} />;
    case "table":
      return <TableWidget config={config} />;
    case "note":
      return <NoteWidget config={config} />;
    default:
      return <div className="text-muted-foreground text-sm">Type inconnu: {type}</div>;
  }
}

function BarChartWidget({ config }) {
  const data = config.data || [];
  const dataKey = config.dataKey || "value";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={config.xKey || "name"} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }} />
        <Bar dataKey={dataKey} fill="#6366f1" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartWidget({ config }) {
  const data = config.data || [];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={config.xKey || "name"} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }} />
        <Line type="monotone" dataKey={config.dataKey || "value"} stroke="#6366f1" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function PieChartWidget({ config }) {
  const data = config.data || [];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius="30%" outerRadius="70%" dataKey="value" nameKey="name" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6 }} />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function KPIWidget({ config }) {
  const variation = config.variation ?? 0;
  const Icon = variation > 0 ? TrendingUp : variation < 0 ? TrendingDown : Minus;
  const color = variation > 0 ? "text-green-400" : variation < 0 ? "text-red-400" : "text-muted-foreground";

  return (
    <div className="flex flex-col justify-center items-center h-full gap-1">
      <span className="text-4xl font-bold">{config.value ?? "—"}</span>
      {config.label && <span className="text-sm text-muted-foreground">{config.label}</span>}
      {variation !== 0 && (
        <div className={`flex items-center gap-1 text-sm ${color}`}>
          <Icon size={14} />
          <span>{variation > 0 ? "+" : ""}{variation}%</span>
        </div>
      )}
    </div>
  );
}

function TableWidget({ config }) {
  const { columns = [], rows = [] } = config;
  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col, i) => (
              <th key={i} className="text-left px-2 py-1.5 text-muted-foreground font-medium">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {(Array.isArray(row) ? row : Object.values(row)).map((cell, j) => (
                <td key={j} className="px-2 py-1.5">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NoteWidget({ config }) {
  return (
    <div className="h-full overflow-auto p-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm prose-invert max-w-none">
        {config.content || ""}
      </ReactMarkdown>
    </div>
  );
}
