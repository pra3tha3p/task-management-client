import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError("Failed to login. Please check your credentials.");
        }
    };

    return (
        <div className="auth-container">
            <h2>Welcome Back</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>
                New to TaskMaster? <Link to="/signup">Create an account</Link>
            </p>
        </div>
    );
};

export default Login;
