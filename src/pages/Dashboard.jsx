import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import TaskFormModal from "../components/TaskFormModal";
import AOS from 'aos';
import 'aos/dist/aos.css';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [metrics, setMetrics] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
    });
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        AOS.refresh();
    }, [tasks]);

    const isTaskBlocked = (task) => {
        return task.dependencies.some((dep) => dep.dependency.status !== "completed");
    };

    const handleComplete = async (task) => {
        try {
            await api.put(`/tasks/${task.id}`, { status: "completed" });
            fetchTasks(); // Refresh to update metrics and dependencies
        } catch (error) {
            alert(error.response?.data?.message || "Failed to complete task");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${id}`);
                fetchTasks(); // Refresh to update metrics
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setShowModal(true);
    };

    const handleNewTask = () => {
        setEditingTask(null);
        setShowModal(true);
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="metrics-container">
                <Link to="/tasks" className="metric-card" data-aos="zoom-in" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                    <h3>Total Tasks</h3>
                    <p>{metrics.total}</p>
                </Link>
                <Link to="/tasks?filter=completed" className="metric-card" data-aos="zoom-in" data-aos-delay="100" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                    <h3>Completed</h3>
                    <p style={{ color: "var(--success-color)" }}>{metrics.completed}</p>
                </Link>
                <Link to="/tasks?filter=pending" className="metric-card" data-aos="zoom-in" data-aos-delay="200" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                    <h3>Pending</h3>
                    <p style={{ color: "var(--warning-color)" }}>{metrics.pending}</p>
                </Link>
                <Link to="/tasks?filter=overdue" className="metric-card overdue" data-aos="zoom-in" data-aos-delay="300" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                    <h3>Overdue</h3>
                    <p>{metrics.overdue}</p>
                </Link>
            </div>

            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>All Tasks</h2>
                <button onClick={handleNewTask} className="btn btn-primary">Create New Task</button>
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
                            <button onClick={() => handleEdit(task)} className="btn btn-secondary">Edit</button>
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

            <TaskFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onTaskCreated={fetchTasks}
                taskToEdit={editingTask}
            />
        </div>
    );
};

export default Dashboard;
