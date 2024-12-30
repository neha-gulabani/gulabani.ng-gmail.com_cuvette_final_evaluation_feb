import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/analytics.css';

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState({
        backlogTasks: 0,
        toDoTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        lowPriorityTasks: 0,
        moderatePriorityTasks: 0,
        highPriorityTasks: 0,
        dueDateTasks: 0
    });

    useEffect(() => {
        axios.get('http://localhost:5000/api/task/analytics', {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            }
        })
            .then(response => setAnalyticsData(response.data))
            .catch(error => console.error('Error fetching analytics data:', error));
    }, []);

    return (
        <div className="analytics-page">

            <div className="analytics-content">
                <h2>Analytics</h2>
                <div className="analytics-container">
                    <div className="analytics-column">
                        <div className="analytics-item">
                            <span><i class="fa-solid fa-circle anaicon"></i> Backlog Tasks</span>
                            <span>{analyticsData.backlogTasks}</span>
                        </div>
                        <div className="analytics-item">
                            <span><i class="fa-solid fa-circle anaicon"></i> To-do Tasks</span>
                            <span>{analyticsData.toDoTasks}</span>
                        </div>
                        <div className="analytics-item">
                            <span><i class="fa-solid fa-circle anaicon"></i> In-Progress Tasks</span>
                            <span>{analyticsData.inProgressTasks}</span>
                        </div>
                        <div className="analytics-item">
                            <span><i class="fa-solid fa-circle anaicon"></i> Completed Tasks</span>
                            <span>{analyticsData.completedTasks}</span>
                        </div>
                    </div>
                    <div className="analytics-column">
                        <div className="analytics-item">
                            <span><i class="fa-solid fa-circle anaicon"></i>Low Priority</span>
                            <span>{analyticsData.lowPriorityTasks}</span>
                        </div>
                        <div className="analytics-item">
                            <span><i class="fa-solid fa-circle anaicon"></i>Moderate Priority</span>
                            <span>{analyticsData.moderatePriorityTasks}</span>
                        </div>
                        <div className="analytics-item">
                            <span><i class="fa-solid fa-circle anaicon"></i>High Priority</span>
                            <span>{analyticsData.highPriorityTasks}</span>
                        </div>
                        <div className="analytics-item">
                            <span><i class="fa-solid fa-circle anaicon"></i>Due Date Tasks</span>
                            <span>{analyticsData.dueDateTasks}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
