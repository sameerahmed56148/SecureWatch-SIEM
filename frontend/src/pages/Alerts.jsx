import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import api from "../services/api";

import "../styles/Alerts.css";
import "../styles/Navbar.css";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/alerts/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAlerts(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load security alerts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const updateAlertStatus = async (alertId, newStatus) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      await api.put(
        `/alerts/${alertId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchAlerts();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update alert status."
      );
    }
  };

  const totalAlerts = alerts.length;

  const openAlerts = alerts.filter(
    (alert) => alert.status === "Open"
  ).length;

  const investigatingAlerts = alerts.filter(
    (alert) => alert.status === "Investigating"
  ).length;

  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "Resolved"
  ).length;

  return (
    <div className="alerts-page">
      <Navbar />

      <main className="alerts-content">
        <div className="alerts-title">
          <div>
            <h2>Security Alerts</h2>

            <p>
              Monitor and manage security alerts
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchAlerts}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="alerts-message">
            Loading security alerts...
          </div>
        )}

        {error && (
          <div className="alerts-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="alerts-summary">
              <div className="alert-summary-card">
                <span>Total Alerts</span>
                <strong>{totalAlerts}</strong>
              </div>

              <div className="alert-summary-card summary-open">
                <span>Open</span>
                <strong>{openAlerts}</strong>
              </div>

              <div className="alert-summary-card summary-investigating">
                <span>Investigating</span>
                <strong>{investigatingAlerts}</strong>
              </div>

              <div className="alert-summary-card summary-resolved">
                <span>Resolved</span>
                <strong>{resolvedAlerts}</strong>
              </div>
            </div>

            <div className="alerts-table-container">
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Event ID</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {alerts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="no-alerts"
                      >
                        No security alerts found.
                      </td>
                    </tr>
                  ) : (
                    alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          #{alert.id}
                        </td>

                        <td>
                          #{alert.event_id}
                        </td>

                        <td>
                          <span
                            className={`alert-severity alert-${alert.severity.toLowerCase()}`}
                          >
                            {alert.severity}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`alert-status status-${alert.status.toLowerCase()}`}
                          >
                            {alert.status}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            alert.created_at
                          ).toLocaleString()}
                        </td>

                        <td>
                          <div className="alert-actions">
                            {alert.status === "Open" && (
                              <button
                                className="action-investigate"
                                onClick={() =>
                                  updateAlertStatus(
                                    alert.id,
                                    "Investigating"
                                  )
                                }
                              >
                                Investigate
                              </button>
                            )}

                            {(alert.status === "Open" ||
                              alert.status ===
                                "Investigating") && (
                              <button
                                className="action-resolve"
                                onClick={() =>
                                  updateAlertStatus(
                                    alert.id,
                                    "Resolved"
                                  )
                                }
                              >
                                Resolve
                              </button>
                            )}

                            {alert.status === "Resolved" && (
                              <span className="alert-resolved-label">
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="alerts-footer">
              Showing {alerts.length} alert
              {alerts.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Alerts;