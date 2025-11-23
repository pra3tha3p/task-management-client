import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [metrics, setMetrics] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get("/tasks");
                const allTasks = response.data;
                setTasks(allTasks);

                const total = allTasks.length;
                const completed = allTasks.filter((t) => t.status === "completed").length;
                const pending = allTasks.filter((t) => t.status !== "completed").length;
                const overdue = allTasks.filter((t) => t.is_overdue).length;

                setMetrics({ total, completed, pending, overdue });
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const isTaskBlocked = (task) => {
        return task.dependencies.some((dep) => dep.dependency.status !== "completed");
    };

    const handleComplete = async (task) => {
        try {
            await api.put(`/tasks/${task.id}`, { status: "completed" });
            // Refresh tasks locally
            const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: "completed" } : t);
            setTasks(updatedTasks);

            // Update metrics locally
            setMetrics(prev => ({
                ...prev,
                completed: prev.completed + 1,
                pending: prev.pending - 1
            }));
        } catch (error) {
            alert(error.response?.data?.message || "Failed to complete task");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${id}`);
                const updatedTasks = tasks.filter((t) => t.id !== id);
                setTasks(updatedTasks);

                // Recalculate metrics
                const total = updatedTasks.length;
                const completed = updatedTasks.filter((t) => t.status === "completed").length;
                const pending = updatedTasks.filter((t) => t.status !== "completed").length;
                const overdue = updatedTasks.filter((t) => t.is_overdue).length;
                setMetrics({ total, completed, pending, overdue });
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="metrics-container">
                <div className="metric-card" data-aos="zoom-in">
                    <h3>Total Tasks</h3>
                    <p>{metrics.total}</p>
                </div>
                <div className="metric-card" data-aos="zoom-in" data-aos-delay="100">
                    <h3>Completed</h3>
                    <p style={{ color: "var(--success-color)" }}>{metrics.completed}</p>
                </div>
                <div className="metric-card" data-aos="zoom-in" data-aos-delay="200">
                    <h3>Pending</h3>
                    <p style={{ color: "var(--warning-color)" }}>{metrics.pending}</p>
                </div>
                <div className="metric-card overdue" data-aos="zoom-in" data-aos-delay="300">
                    <h3>Overdue</h3>
                    <p>{metrics.overdue}</p>
                </div>
            </div>

            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>All Tasks</h2>
                <Link to="/tasks/new" className="btn btn-primary">Create New Task</Link>
            </div>

            <div className="task-list">
                {tasks.map((task, index) => (
                    <div
                        key={task.id}
                        className={`task-card ${task.is_overdue ? "overdue" : ""} ${task.status}`}
                        data-aos="zoom-in"
                        data-aos-delay={index * 100}
                    >
                        <div className="task-header">
                            <h3>{task.title}</h3>
                            <span className={`priority ${task.priority}`}>{task.priority}</span>
                        </div>
                        <p>{task.description || "No description provided."}</p>

                        {task.dependencies.length > 0 && (
                            <div className="dependencies">
                                <strong>Dependencies:</strong>
                                <ul>
                                    {task.dependencies.map((dep) => (
                                        <li key={dep.id} className={dep.dependency.status}>
                                            {dep.dependency.title} ({dep.dependency.status})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="task-meta">
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                            <span>Status: <span className={`status-text ${task.is_overdue ? "overdue" : task.status}`}>{task.status.replace('_', ' ')}</span></span>
                        </div>

                        <div className="task-actions">
                            {task.status !== "completed" && (
                                <button
                                    onClick={() => handleComplete(task)}
                                    disabled={isTaskBlocked(task)}
                                    title={isTaskBlocked(task) ? "Dependencies incomplete" : "Mark as completed"}
                                >
                                    {isTaskBlocked(task) ? "Blocked" : "Complete"}
                                </button>
                            )}
                            <Link to={`/tasks/edit/${task.id}`} className="btn btn-secondary" style={{ textAlign: 'center', display: 'block' }}>Edit</Link>
                            <button onClick={() => handleDelete(task.id)} className="btn btn-danger">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {tasks.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--gray-500)' }}>
                    <p>No tasks found. Create one to get started!</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
