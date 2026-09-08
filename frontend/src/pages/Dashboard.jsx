import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Navbar from "../components/Navbar";

import api from "../services/api";

import "../styles/Dashboard.css";
import "../styles/Navbar.css";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [trends, setTrends] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [
        summaryResponse,
        severityResponse,
        trendsResponse,
      ] = await Promise.all([
        api.get("/dashboard/summary", config),
        api.get("/dashboard/severity", config),
        api.get("/dashboard/trends?days=7", config),
      ]);

      setSummary(summaryResponse.data);
      setSeverity(severityResponse.data);
      setTrends(trendsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />

        <div className="dashboard-loading">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Navbar />

        <div className="dashboard-error">
          {error}
        </div>
      </div>
    );
  }

  const severityData = [
    {
      name: "Low",
      events: severity?.Low || 0,
    },
    {
      name: "Medium",
      events: severity?.Medium || 0,
    },
    {
      name: "High",
      events: severity?.High || 0,
    },
    {
      name: "Critical",
      events: severity?.Critical || 0,
    },
  ];

  const trendData = trends.map((item) => ({
    date: item.date.slice(5),
    events: item.events,
    alerts: item.alerts,
    critical: item.critical_events,
  }));

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-title">
          <div>
            <h2>Security Overview</h2>

            <p>
              Real-time security monitoring summary
            </p>
          </div>

          <button
            className="dashboard-refresh-button"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">◉</div>

            <div>
              <p>Total Events</p>
              <h3>{summary.total_events}</h3>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">!</div>

            <div>
              <p>Total Alerts</p>
              <h3>{summary.total_alerts}</h3>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">○</div>

            <div>
              <p>Open Alerts</p>
              <h3>{summary.open_alerts}</h3>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">◌</div>

            <div>
              <p>Investigating</p>
              <h3>{summary.investigating_alerts}</h3>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">✓</div>

            <div>
              <p>Resolved Alerts</p>
              <h3>{summary.resolved_alerts}</h3>
            </div>
          </div>

          <div className="metric-card critical-card">
            <div className="metric-icon">⚠</div>

            <div>
              <p>Critical Events</p>
              <h3>{summary.critical_events}</h3>
            </div>
          </div>
        </div>

        <section className="analytics-section">
          <div className="analytics-header">
            <h2>Security Analytics</h2>

            <p>
              Security events and activity over the last 7 days
            </p>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Severity Distribution</h3>

              <div className="chart-container">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={severityData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis dataKey="name" />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="events"
                      name="Events"
                      fill="#5da9ee"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>7-Day Security Activity</h3>

              <div className="chart-container">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis dataKey="date" />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="events"
                      name="Events"
                      stroke="#5da9ee"
                    />

                    <Line
                      type="monotone"
                      dataKey="alerts"
                      name="Alerts"
                      stroke="#f0b429"
                    />

                    <Line
                      type="monotone"
                      dataKey="critical"
                      name="Critical Events"
                      stroke="#ff6b7a"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;