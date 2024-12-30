import React, { useRef, useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { format } from 'date-fns';
import EditTaskModal from './edittask';
import axios from 'axios';



const KanbanTask = ({ task, isCollapsed, toggleChecklistItem, onStatusChange, onDelete, callToast, setTask }) => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [tasks, setTasks] = useState(task);
    const [popupPosition, setPopupPosition] = useState({ top: 0, right: 0 });
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isChecklistCollapsed, setChecklistCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false)
    const { user } = useUser();
    const popupRef = useRef(null);
    const buttonRef = useRef(null);


    const formattedDate = tasks.dueDate ? format(new Date(tasks.dueDate), 'MMM do') : '';
    const isOverdue = tasks.dueDate && new Date(tasks.dueDate) < new Date() && tasks.status !== 'done';
    const dueDateClass = tasks.status === 'done'
        ? 'duedate-done'
        : (isOverdue || tasks.priority === 'high')
            ? 'duedate-overdue'
            : 'duedate';
    const taskTitle = (isCollapsed && !isHovered && tasks.title.length > 32)
        ? `${tasks.title.slice(0, 32)}...`
        : tasks.title;
    const completedTasks = tasks.checklist ? tasks.checklist.filter(item => item.completed).length : 0;
    const totalTasks = tasks.checklist ? tasks.checklist.length : 0;

    const handleEditClick = (e) => {
        e.stopPropagation();
        setEditModalOpen(true)
    };

    useEffect(() => {
        setTasks(task);
    }, [task]);



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setPopupVisible(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDeleteClick = async () => {
        try {

            setTask((prevTasks) => prevTasks.filter((task) => task._id !== tasks._id))
            await axios.delete(`http://localhost:5000/api/task/deleteTask/${tasks._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });


            setDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting task:', error);

        }
    };

    const handleUpdateTask = (updatedTask) => {
        setTasks(updatedTask)
    };

    const togglePopup = (event) => {
        event.stopPropagation()
        setPopupVisible(!popupVisible);

        if (buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            setPopupPosition({
                top: buttonRect.height + 5,
                right: 0
            });
        }
    };

    const handleStatusChange = (newStatus) => onStatusChange(tasks._id, newStatus);

    const handleShare = () => {
        setPopupVisible(false)
        const shareLink = `${window.location.origin}/share/${tasks._id}`;
        navigator.clipboard.writeText(shareLink)
            .then(() => {
                callToast()

            })
            .catch(() => {
                console.log("Error in copying link");
            });
    };


    const getUserInitials = () => {
        if (!task.assignees || task.assignees.length === 0) return '';
        console.log('fixing user initials:', task.assignees)
        const assignedEmail = task.assignees[0].email;
        console.log(assignedEmail, assignedEmail.charAt(0).toUpperCase())
        return assignedEmail.charAt(0).toUpperCase();
    };

    return (
        <div key={tasks._id} className="kanban-task" onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>


            <div className="task-header">
                <div className="priority-name">

                    <span className={`priority ${tasks.priority.toLowerCase()}`}>

                        <i className="fa-solid fa-circle"></i>
                        {tasks.priority} PRIORITY
                    </span>

                    {user && task.createdBy._id !== user.id && task.assignees && task.assignees.length > 0 && task.assignees[0].email != user.email && (
                        <span className="user-initials-task">{getUserInitials()}</span>
                    )}
                </div>
                <button ref={buttonRef} className="dots-btn" onClick={togglePopup}>...</button>



            </div>

            {popupVisible && (
                <div className="popup-menu" ref={popupRef} style={{
                    top: `${popupPosition.top}px`,
                    right: `${popupPosition.right}px`
                }}>

                    <button className='btns' onClick={handleEditClick}>Edit</button>
                    {isEditModalOpen && (
                        <EditTaskModal
                            isOpen={isEditModalOpen}
                            onClose={() => setEditModalOpen(false)}
                            taskData={tasks}
                            onUpdate={handleUpdateTask}
                        />
                    )}
                    <button className='btns' onClick={handleShare}>Share</button>

                    <button className='btns' onClick={() => {
                        setDeleteModalOpen(true)
                        setPopupVisible(false)
                    }} style={{ color: 'red' }}>Delete</button>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="modal-overlay-del">
                    <div className="delete-modal-del">
                        <p>Are you sure you want to delete?</p>
                        <div className="modal-buttons-del">
                            <button className="confirm-delete" onClick={handleDeleteClick}>Yes, Delete</button>
                            <button className="cancel-delete" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <h4 className={`task-title ${(isHovered) ? 'expanded' : 'collapsed'} ${(isCollapsed) ? 'collapsed' : 'expanded'}`}>
                {taskTitle}
            </h4>
            {tasks.checklist && tasks.checklist.length > 0 && (
                <div className="checklist">
                    <h5>
                        Checklist ({completedTasks}/{totalTasks})
                        <button onClick={() => setChecklistCollapsed(prev => !prev)} className="collapse-arrow-btn">
                            {isChecklistCollapsed ? <i className="fa fa-angle-down" aria-hidden="true"></i> : <i class="fa fa-angle-up" aria-hidden="true"></i>}
                        </button>
                    </h5>
                    {!isChecklistCollapsed && tasks.checklist.map((item, index) => (
                        <div key={index} className="checklist-item">
                            <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => {
                                    toggleChecklistItem(tasks._id, index)
                                    item.completed = !item.completed
                                }}
                            />
                            <label>{item.task}</label>
                        </div>
                    ))}
                </div>
            )}

            <div className="task-meta-card">
                {formattedDate && <span className={dueDateClass}>{formattedDate}</span>}
                <div className='status-btn'>
                    <button onClick={() => handleStatusChange('backlog')}>Backlog</button>
                    <button onClick={() => handleStatusChange('todo')}>Todo</button>
                    <button onClick={() => handleStatusChange('inprogress')}>In Progress</button>
                    <button onClick={() => handleStatusChange('done')}>Done</button>
                </div>
            </div>
        </div>
    );
};

export default KanbanTask;
