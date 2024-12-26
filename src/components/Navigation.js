import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const Navigation = () => {
    const navigate = useNavigate();
    const userType = localStorage.getItem('userType');

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">
                                Smart Urban Resource Management
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(userType === 'user' ? '/user/profile' : '/volunteer/profile')}
                            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            Profile
                        </button>
                        <button
                            onClick={logout}
                            className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
