const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    priority: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        required: true
    },
    dueDate: { type: Date },
    status: {
        type: String,
        default: 'todo'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    checklist: [
        {
            task: { type: String, required: true },
            completed: { type: Boolean, default: false }
        }
    ],
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
