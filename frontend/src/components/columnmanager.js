import React, { useState } from 'react';

const ColumnManager = ({ column, onRename, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(column.name);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleRename = () => {
        if (newName.trim() && newName !== column.name) {
            onRename(column._id, newName);
        }
        setIsEditing(false);
    };

    return (
        <div className="column-manager">
            {isEditing ? (
                <div className="column-edit">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={handleRename}
                        autoFocus
                    />
                </div>
            ) : (
                <div className="column-header">
                    <h3>{column.name}</h3>
                    <div className="column-actions">
                        <button onClick={() => setIsEditing(true)}>
                            <i className="fas fa-edit"></i>
                        </button>
                        {!column.isDefault && (
                            <button onClick={() => setShowDeleteConfirm(true)}>
                                <i className="fas fa-trash"></i>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="delete-confirm">
                    <p>Are you sure you want to delete this column?</p>
                    <p>All tasks will be moved to Backlog.</p>
                    <div className="delete-actions">
                        <button onClick={() => onDelete(column._id)}>Delete</button>
                        <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnManager;