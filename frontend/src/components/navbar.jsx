import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState("User");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      setRole(payload.role || "User");
    } catch (error) {
      console.error("Unable to read user role from token.");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isAdmin = role === "Admin";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">🛡️</div>

        <div>
          <h1>SecureWatch</h1>
          <p>SIEM Platform</p>
        </div>
      </div>

      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/events"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Events
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Alerts
        </NavLink>

        {isAdmin && (
          <>
            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Audit Logs
            </NavLink>

            <NavLink
              to="/user-management"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              User Management
            </NavLink>
          </>
        )}
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <span className="status-dot"></span>
          {role}
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;