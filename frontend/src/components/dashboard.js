import React, { useEffect, useState } from 'react';
import axios from 'axios';

import KanbanBoard from './kanbanboard';
import { jwtDecode } from 'jwt-decode';
import '../styles/dashboard.css';
import { useNavigate } from "react-router-dom";
import { useUser } from '../UserContext';
import { isTaskDueToday, isTaskDueThisWeek, isTaskDueThisMonth } from '../utils/dateHelper';
import AddPeopleModal from './addpeople';

const MainPage = () => {
    const [username, setUsername] = useState('');
    const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
    const [isModalOpen, setModalOpen] = useState(false);
    const { user, loginUser } = useUser();

    console.log('user', user)
    console.log('loginUser', loginUser)

    if (!token) {
        navigate('/');
    }

    const formatDateWithSuffix = (date) => {
        const day = date.getDate();
        const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
            (day % 10 === 2 && day !== 12) ? 'nd' :
                (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
        const formattedDate = `${day}${suffix} ${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear()}`;
        return formattedDate;
    };

    const currentDate = formatDateWithSuffix(new Date());

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUsername(decoded.name);
            loginUser({ id: decoded._id, name: decoded.name, email: decoded.email });
        }
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            fetchTasks()

        }
    }, []);

    const fetchTasks = () => {
        axios.get('http://localhost:5000/api/task/tasks', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                console.log(response.data)
                setTasks(response.data);
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });

    }

    useEffect(() => {
        if (selectedTimeframe) {
            setFilteredTasks(() => {
                let filtered = [];
                if (selectedTimeframe === 'Today') {
                    filtered = tasks.filter(task => isTaskDueToday(task.dueDate));
                } else if (selectedTimeframe === 'This Week') {
                    filtered = tasks.filter(task => isTaskDueToday(task.dueDate) || isTaskDueThisWeek(task.dueDate));
                } else if (selectedTimeframe === 'This Month') {
                    filtered = tasks.filter(task => isTaskDueToday(task.dueDate) || isTaskDueThisWeek(task.dueDate) || isTaskDueThisMonth(task.dueDate));
                } else {
                    filtered = tasks;
                }

                return filtered;
            });
        }
    }, [selectedTimeframe, tasks]);

    const handleStatusChange = (updatedTask) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
        );
    };
    const handleTimeframeChange = (event) => {
        setSelectedTimeframe(event.target.value);
    };

    const handleSave = (newTask) => {

        setTasks(prevTasks => [...prevTasks, newTask]);
        if (selectedTimeframe === 'Today' && isTaskDueToday(newTask.dueDate)) {
            setFilteredTasks((prevFilteredTasks) => [...prevFilteredTasks, newTask]);
        } else if (selectedTimeframe === 'This Week' && (isTaskDueToday(newTask.dueDate) || isTaskDueThisWeek(newTask.dueDate))) {
            setFilteredTasks((prevFilteredTasks) => [...prevFilteredTasks, newTask]);
        } else if (selectedTimeframe === 'This Month' && (isTaskDueToday(newTask.dueDate) || isTaskDueThisWeek(newTask.dueDate) || isTaskDueThisMonth(newTask.dueDate))) {
            setFilteredTasks((prevFilteredTasks) => [...prevFilteredTasks, newTask]);
        }
    };

    const handleAddPeople = () => {
        setModalOpen(true);
    };

    return (
        <div className="main-container">

            <main className="main-content">
                <header>
                    <div className="header-top">
                        <div className="header-left">
                            <h1>Welcome! {user ? user.name : 'Guest'}</h1>
                        </div>
                        <div className="header-date">
                            <span>{currentDate}</span>
                        </div>
                    </div>
                    <div className="header-bottom">
                        <div className="header-inner">
                            <h2 className="board-title">Board</h2>
                            <button onClick={handleAddPeople}><i className="fa-solid fa-user-group"></i> Add People</button>
                        </div>
                        <div className="kanban-controls">
                            <div className="dropdown-container">
                                <select
                                    value={selectedTimeframe}
                                    onChange={handleTimeframeChange}
                                    className="dropdown-select"
                                >
                                    <option value="Today">Today</option>
                                    <option value="This Week">This Week</option>
                                    <option value="This Month">This Month</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </header>

                <KanbanBoard tasks={filteredTasks} onSave={handleSave} onStatusChange={handleStatusChange} fetchTask={fetchTasks} />
                <AddPeopleModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} tasks={tasks} />
            </main>
        </div>
    );
};

export default MainPage;