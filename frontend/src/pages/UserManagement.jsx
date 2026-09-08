import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import api from "../services/api";

import "../styles/UserManagement.css";
import "../styles/Navbar.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId, currentRole, newRole) => {
    if (currentRole === newRole) {
      return;
    }

    const user = users.find(
      (item) => item.id === userId
    );

    const username = user?.username || "this user";

    const confirmed = window.confirm(
      `Change ${username}'s role from ${currentRole} to ${newRole}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");

      await api.put(
        `/admin/users/${userId}/role`,
        {
          role: newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update user role."
      );
    }
  };

  return (
    <div className="user-management-page">
      <Navbar />

      <main className="user-management-content">
        <div className="user-management-title">
          <div>
            <h2>User Management</h2>

            <p>
              Manage users and their system roles
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchUsers}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="user-management-message">
            Loading users...
          </div>
        )}

        {error && (
          <div className="user-management-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="user-management-table-container">
            <table className="user-management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="no-users"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        #{user.id}
                      </td>

                      <td>
                        {user.username}
                      </td>

                      <td>
                        {user.email}
                      </td>

                      <td>
                        <span
                          className={`role-badge role-${user.role?.toLowerCase()}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateRole(
                              user.id,
                              user.role,
                              e.target.value
                            )
                          }
                        >
                          <option value="Admin">
                            Admin
                          </option>

                          <option value="Analyst">
                            Analyst
                          </option>

                          <option value="Viewer">
                            Viewer
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="user-management-footer">
            Showing {users.length} user
            {users.length !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </div>
  );
}

export default UserManagement;