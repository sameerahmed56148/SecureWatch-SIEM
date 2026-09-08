import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import api from "../services/api";

import "../styles/AuditLogs.css";
import "../styles/Navbar.css";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/audit-logs/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "-";
    }

    return new Date(timestamp).toLocaleString();
  };

  const getUserValue = (log) => {
    return log.username || log.user_id || "System";
  };

  const getDetailsValue = (log) => {
    return log.details || log.description || "-";
  };

  const filteredLogs = logs.filter((log) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    const user = String(getUserValue(log)).toLowerCase();
    const action = String(log.action || "").toLowerCase();
    const details = String(getDetailsValue(log)).toLowerCase();

    return (
      user.includes(searchText) ||
      action.includes(searchText) ||
      details.includes(searchText)
    );
  });

  return (
    <div className="audit-logs-page">
      <Navbar />

      <main className="audit-logs-content">
        <div className="audit-logs-title">
          <div>
            <h2>Audit Logs</h2>

            <p>
              Monitor user activity and security-related actions
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchAuditLogs}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="audit-logs-search">
          <input
            type="text"
            placeholder="Search by user, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search-button"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>

        {loading && (
          <div className="audit-logs-message">
            Loading audit logs...
          </div>
        )}

        {error && (
          <div className="audit-logs-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="audit-logs-table-container">
            <table className="audit-logs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="no-audit-logs"
                    >
                      {search
                        ? "No audit logs match your search."
                        : "No audit logs found."}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        #{log.id}
                      </td>

                      <td>
                        {getUserValue(log)}
                      </td>

                      <td>
                        <span className="audit-action">
                          {log.action}
                        </span>
                      </td>

                      <td className="audit-details">
                        {getDetailsValue(log)}
                      </td>

                      <td>
                        {formatTimestamp(
                          log.timestamp ||
                            log.created_at
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="audit-logs-footer">
            Showing {filteredLogs.length} of{" "}
            {logs.length} log
            {logs.length !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </div>
  );
}

export default AuditLogs;