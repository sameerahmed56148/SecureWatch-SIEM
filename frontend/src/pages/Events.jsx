import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import api from "../services/api";

import "../styles/Events.css";
import "../styles/Navbar.css";

function Events() {
  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async (selectedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const params = {
        page: selectedPage,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (severity) {
        params.severity = severity;
      }

      const response = await api.get("/events/", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load security events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);
    fetchEvents(1);
  };

  const handleFilter = () => {
    setPage(1);
    fetchEvents(1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      const newPage = page - 1;

      setPage(newPage);
      fetchEvents(newPage);
    }
  };

  const handleNext = () => {
    if (events.length === limit) {
      const newPage = page + 1;

      setPage(newPage);
      fetchEvents(newPage);
    }
  };

  const handleEventClick = async (eventId) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedEvent(null);

      const token = localStorage.getItem("token");

      const response = await api.get(
        `/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedEvent(response.data);
    } catch (err) {
      setDetailsError(
        err.response?.data?.detail ||
          "Unable to load event details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
    setDetailsError("");
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="events-page">
      <Navbar />

      <main className="events-content">
        <div className="events-title">
          <div>
            <h2>Security Events</h2>
            <p>
              Monitor and investigate security events
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={() => fetchEvents(page)}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="events-filters">
          <form
            className="search-form"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button type="submit">
              Search
            </button>
          </form>

          <select
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value)
            }
          >
            <option value="">
              All Severities
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>

            <option value="Critical">
              Critical
            </option>
          </select>

          <button
            className="filter-button"
            onClick={handleFilter}
          >
            Apply Filter
          </button>
        </div>

        {loading && (
          <div className="events-message">
            Loading security events...
          </div>
        )}

        {error && (
          <div className="events-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="events-table-container">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Timestamp</th>
                    <th>Event Type</th>
                    <th>Severity</th>
                    <th>Source IP</th>
                    <th>Username</th>
                    <th>Message</th>
                  </tr>
                </thead>

                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="no-events"
                      >
                        No security events found.
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr
                        key={event.id}
                        className="event-row-clickable"
                        onClick={() =>
                          handleEventClick(event.id)
                        }
                      >
                        <td>
                          #{event.id}
                        </td>

                        <td>
                          {formatTimestamp(
                            event.timestamp
                          )}
                        </td>

                        <td>
                          {event.event_type}
                        </td>

                        <td>
                          <span
                            className={`severity-badge severity-${event.severity.toLowerCase()}`}
                          >
                            {event.severity}
                          </span>
                        </td>

                        <td>
                          {event.source_ip}
                        </td>

                        <td>
                          {event.username}
                        </td>

                        <td className="event-message">
                          {event.message}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="events-pagination">
              <button
                onClick={handlePrevious}
                disabled={page === 1 || loading}
              >
                ← Previous
              </button>

              <span>
                Page <strong>{page}</strong>
              </span>

              <button
                onClick={handleNext}
                disabled={
                  events.length < limit || loading
                }
              >
                Next →
              </button>
            </div>

            <div className="events-footer">
              Showing {events.length} event
              {events.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </main>

      {(detailsLoading || selectedEvent || detailsError) && (
        <div
          className="event-modal-overlay"
          onClick={closeEventDetails}
        >
          <div
            className="event-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="event-modal-header">
              <div>
                <h2>Event Details</h2>
                <p>
                  Security event investigation
                </p>
              </div>

              <button
                className="event-modal-close"
                onClick={closeEventDetails}
              >
                ×
              </button>
            </div>

            {detailsLoading && (
              <div className="event-details-loading">
                Loading event details...
              </div>
            )}

            {detailsError && (
              <div className="events-error">
                {detailsError}
              </div>
            )}

            {!detailsLoading &&
              !detailsError &&
              selectedEvent && (
                <div className="event-details-grid">
                  <div className="event-detail-item">
                    <span>Event ID</span>
                    <strong>
                      #{selectedEvent.id}
                    </strong>
                  </div>

                  <div className="event-detail-item">
                    <span>Severity</span>
                    <strong>
                      <span
                        className={`severity-badge severity-${selectedEvent.severity.toLowerCase()}`}
                      >
                        {selectedEvent.severity}
                      </span>
                    </strong>
                  </div>

                  <div className="event-detail-item">
                    <span>Event Type</span>
                    <strong>
                      {selectedEvent.event_type}
                    </strong>
                  </div>

                  <div className="event-detail-item">
                    <span>Timestamp</span>
                    <strong>
                      {formatTimestamp(
                        selectedEvent.timestamp
                      )}
                    </strong>
                  </div>

                  <div className="event-detail-item">
                    <span>Source IP</span>
                    <strong>
                      {selectedEvent.source_ip}
                    </strong>
                  </div>

                  <div className="event-detail-item">
                    <span>Username</span>
                    <strong>
                      {selectedEvent.username}
                    </strong>
                  </div>

                  <div className="event-detail-message">
                    <span>Message</span>
                    <p>
                      {selectedEvent.message}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;