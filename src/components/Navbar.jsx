import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>TaskMaster</Link>
            </div>
            {user && (
                <>
                    <button className="menu-toggle" onClick={toggleMenu}>
                        {isMenuOpen ? "✕" : "☰"}
                    </button>
                    <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
                        <Link
                            to="/"
                            style={{ color: isActive("/") ? "var(--primary-color)" : "" }}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/tasks"
                            style={{ color: isActive("/tasks") ? "var(--primary-color)" : "" }}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Tasks
                        </Link>
                        <Link
                            to="/loggers"
                            style={{ color: isActive("/loggers") ? "var(--primary-color)" : "" }}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            History
                        </Link>
                        <Link
                            to="/tasks/new"
                            className="btn btn-primary"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            New Task
                        </Link>
                        <div style={{ width: "1px", height: "24px", background: "var(--gray-300)", margin: "0 0.5rem" }}></div>
                        <span>{user.name}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar;
