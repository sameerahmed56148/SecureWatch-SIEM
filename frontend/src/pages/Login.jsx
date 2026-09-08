import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("grant_type", "password");
      formData.append("username", email.trim());
      formData.append("password", password);

      const response = await api.post("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = response.data.access_token;

      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-card">
          <div className="logo-section">
            <div className="logo-icon">🛡️</div>

            <h1>SecureWatch</h1>

            <p>
              Security Information & Event Management
            </p>
          </div>

          <div className="login-divider"></div>

          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            Sign in to access your security dashboard
          </p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="security-note">
            🔒 Secure authentication protected by SecureWatch
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;