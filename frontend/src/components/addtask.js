import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/addtask.css';
// import socket from '../socket';
import { jwtDecode } from 'jwt-decode';

const AddTaskModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [assignees, setAssignees] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [showUsersDropdown, setShowUsersDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const token = sessionStorage.getItem('token');
    const decoded = jwtDecode(token);
    const userId = decoded._id;

    useEffect(() => {
        if (isOpen) {
            axios.get('http://localhost:5000/api/task/fetchUsers')
                .then(response => setUsers(response.data))
                .catch(error => console.error('Error fetching users:', error));
        }
    }, [isOpen]);

    const handleAddChecklistItem = () => {
        if (newChecklistItem) {
            setChecklist([...checklist, { task: newChecklistItem, completed: false }]);
            setNewChecklistItem('');
        }
    };

    const handleDeleteChecklistItem = (index) => {
        const updatedChecklist = [...checklist];
        updatedChecklist.splice(index, 1);
        setChecklist(updatedChecklist);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!title) newErrors.title = 'Task Title is required';
        if (!priority) newErrors.priority = 'Select Priority is required';
        if (checklist.length === 0) newErrors.checklist = 'Checklist cannot be empty';
        if (assignees.length === 0) newErrors.assignedTo = 'Assignee is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            setIsSaving(true);
            console.log('assigness when adding:', assignees)
            const taskData = {
                title,
                priority,
                dueDate,
                assignees,
                checklist,

            };
            let newTask;

            axios.post('http://localhost:5000/api/task/addTask', taskData, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            })
                .then(response => {
                    newTask = response.data;

                    onSave(response.data);
                    onClose();
                })
                .catch(error => console.error('Error adding task:', error))
                .finally(() => setIsSaving(false));


        }
    };

    const handleDateChange = (date) => {
        setDueDate(date);
        setShowCalendar(false);
    };

    const handleAssignUser = (user) => {
        setAssignedTo(user.email);
        setAssignees(user._id);
        setShowUsersDropdown(false);
    };

    return (
        <div className="modal-overlay-add">
            <div className="modal-content">
                <div className="modal-body">
                    <label className="title">Title <span className="imp">*</span></label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter Task Title"
                        required
                    />
                    {errors.title && <span className="error-text">{errors.title}</span>}

                    <div className="priority-container">
                        <label>Select Priority <span className="imp">*</span></label>

                        <div className="priority-options">
                            <button
                                className={`priority-btn h ${priority === 'High' ? 'high-priority' : ''}`}
                                onClick={() => setPriority('High')}
                            >
                                <i class="fa-solid fa-circle"></i>HIGH PRIORITY
                            </button>
                            <button
                                className={`priority-btn m ${priority === 'Moderate' ? 'moderate-priority' : ''}`}
                                onClick={() => setPriority('Moderate')}
                            >
                                <i class="fa-solid fa-circle"></i>MODERATE PRIORITY
                            </button>
                            <button
                                className={`priority-btn l ${priority === 'Low' ? 'low-priority' : ''}`}
                                onClick={() => setPriority('Low')}
                            >
                                <i class="fa-solid fa-circle"></i>LOW PRIORITY
                            </button>
                        </div>
                    </div>
                    {errors.priority && <span className="error-text">{errors.priority}</span>}

                    <div className="assigned-to-container">
                        <label>Assigned to </label>
                        <div className="input-group-assign">
                            <input
                                type="text"
                                value={assignedTo}
                                onClick={() => setShowUsersDropdown(!showUsersDropdown)}
                                placeholder="Select or type an assignee"
                                readOnly
                            />
                            <i className="input-icon fas fa-chevron-down dropdown-icon" />
                        </div>
                        {showUsersDropdown && (
                            <ul className="users-dropdown">
                                {users.map(user => (
                                    <li key={user._id} onClick={() => handleAssignUser(user)} className="user-dropdown-item">

                                        <span className="user-email">
                                            <div>

                                                <span className="user-initials">
                                                    {user.name ? user.name.charAt(0) + user.name.charAt(1) : "?"}
                                                </span>
                                                {user.email}
                                            </div>
                                        </span>

                                        <button
                                            className="assign-btn"
                                            onClick={() => handleAssignUser(user)}
                                        >
                                            Assign
                                        </button>

                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {errors.assignedTo && <span className="error-text">{errors.assignedTo}</span>}

                    <label className="checklist-label">Checklist<span className="imp">*</span></label>
                    <div className="checklist-section">
                        {checklist.map((item, index) => (

                            <div key={index} className="checklist-item-add">
                                <div className="checkname">
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={() => {
                                            const updatedChecklist = [...checklist];
                                            updatedChecklist[index].completed = !updatedChecklist[index].completed;
                                            setChecklist(updatedChecklist);
                                        }}
                                    />
                                    <span>{item.task}</span>
                                </div>
                                <button className="delete-btn" onClick={() => handleDeleteChecklistItem(index)}>
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                        <div className="add-checklist-item">
                            <input
                                type="text"
                                value={newChecklistItem}
                                onChange={(e) => setNewChecklistItem(e.target.value)}
                                placeholder="+ Add New"
                            />
                            <button onClick={handleAddChecklistItem}>Add</button>
                        </div>
                    </div>
                    {errors.checklist && <span className="error-text">{errors.checklist}</span>}
                </div>

                <div className="modal-footer">


                    <div className="right-buttons">
                        <button className="date-btn" onClick={() => setShowCalendar(!showCalendar)}>
                            {dueDate ? dueDate.toLocaleDateString() : 'Select Due Date'}
                        </button>
                        {showCalendar && (
                            <div className="calendar-container">
                                <Calendar onChange={handleDateChange} value={dueDate} minDate={new Date()} />
                            </div>
                        )}
                    </div>

                    <div className="left-buttons">
                        <button onClick={onClose} className="cancel-btn">Cancel</button>
                        <button onClick={handleSave} className="save-btn" disabled={isSaving}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;
