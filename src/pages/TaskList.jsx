import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get("/tasks");
            setTasks(response.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${id}`);
                setTasks(tasks.filter((t) => t.id !== id));
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        }
    };

    const handleComplete = async (task) => {
        try {
            await api.put(`/tasks/${task.id}`, { status: "completed" });
            fetchTasks(); // Refresh to update dependencies
        } catch (error) {
            alert(error.response?.data?.message || "Failed to complete task");
        }
    };

    const filteredTasks = tasks.filter((task) => {
        if (filter === "all") return true;
        if (filter === "completed") return task.status === "completed";
        if (filter === "pending") return task.status !== "completed";
        if (filter === "overdue") return task.is_overdue;
        return true;
    });

    const isTaskBlocked = (task) => {
        return task.dependencies.some((dep) => dep.dependency.status !== "completed");
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="task-list-page">
            <div className="header">
                <h1>My Tasks</h1>
                <div className="filters">
                    <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>All</button>
                    <button onClick={() => setFilter("pending")} className={filter === "pending" ? "active" : ""}>Pending</button>
                    <button onClick={() => setFilter("completed")} className={filter === "completed" ? "active" : ""}>Completed</button>
                    <button onClick={() => setFilter("overdue")} className={filter === "overdue" ? "active" : ""}>Overdue</button>
                </div>
                <Link to="/tasks/new" className="btn btn-primary">New Task</Link>
            </div>

            <div className="task-list">
                {filteredTasks.map((task) => (
                    <div key={task.id} className={`task-card ${task.is_overdue ? "overdue" : ""} ${task.status}`}>
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
            {filteredTasks.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--gray-500)' }}>
                    <p>No tasks found matching your filter.</p>
                </div>
            )}
        </div>
    );
};

export default TaskList;
