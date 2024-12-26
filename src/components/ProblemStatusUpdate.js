import React from 'react';
import api from '../utils/api';

const ProblemStatusUpdate = ({ problem, onUpdate }) => {
    const handleStatusChange = async (newStatus) => {
        try {
            const response = await api.patch(`/problems/${problem._id}/status`, {
                status: newStatus
            });
            onUpdate(response.data);
        } catch (error) {
            console.error('Error updating problem status:', error);
        }
    };

    return (
        <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Update Status</h4>
            <div className="mt-2 flex space-x-2">
                {problem.status === 'pending' && (
                    <button
                        onClick={() => handleStatusChange('assigned')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                        Take Problem
                    </button>
                )}
                {problem.status === 'assigned' && (
                    <button
                        onClick={() => handleStatusChange('in_progress')}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                        Start Work
                    </button>
                )}
                {problem.status === 'in_progress' && (
                    <button
                        onClick={() => handleStatusChange('solved')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                        Mark as Solved
                    </button>
                )}
            </div>
        </div>
    );
};
