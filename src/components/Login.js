// // src/components/Login.js
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useAuth } from '../contexts/AuthContext';

// const Login = ({ userType }) => {
//     const navigate = useNavigate();
//     const { login } = useAuth();
//     const [formData, setFormData] = useState({
//         phone: '',
//         name: ''
//     });
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         try {
//             const phoneRegex = /^\d{10}$/;
//             if (!phoneRegex.test(formData.phone)) {
//                 throw new Error('Please enter a valid 10-digit phone number');
//             }

//             if (!formData.name.trim()) {
//                 throw new Error('Name is required');
//             }

//             const response = await axios.post('/api/auth/login', {
//                 phone: formData.phone,
//                 name: formData.name,
//                 userType
//             });

//             // Store user data
//             localStorage.setItem('userId', response.data.user.id);
            
//             // Use auth context login
//             login(response.data.token, userType);

//             // Navigate to dashboard
//             navigate(`/${userType}/dashboard`);

//         } catch (error) {
//             console.error('Login error:', error);
//             setError(error.response?.data?.error || error.message || 'Login failed');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-md w-full space-y-8">
//                 <div>
//                     <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//                         {userType === 'user' ? 'User Login' : 'Volunteer Login'}
//                     </h2>
//                 </div>
//                 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//                     <div className="rounded-md shadow-sm space-y-4">
//                         <div>
//                             <label htmlFor="name" className="sr-only">Name</label>
//                             <input
//                                 id="name"
//                                 name="name"
//                                 type="text"
//                                 required
//                                 className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
//                                 placeholder="Your Name"
//                                 value={formData.name}
//                                 onChange={handleChange}
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="phone" className="sr-only">Phone Number</label>
//                             <input
//                                 id="phone"
//                                 name="phone"
//                                 type="tel"
//                                 required
//                                 className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
//                                 placeholder="Phone Number (10 digits)"
//                                 value={formData.phone}
//                                 onChange={handleChange}
//                             />
//                         </div>
//                     </div>

//                     {error && (
//                         <div className="text-red-500 text-sm text-center">
//                             {error}
//                         </div>
//                     )}

//                     <div>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
//                                 loading 
//                                     ? 'bg-blue-400 cursor-not-allowed' 
//                                     : 'bg-blue-600 hover:bg-blue-700'
//                             }`}
//                         >
//                             {loading ? 'Logging in...' : 'Login / Register'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Login;
// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ userType }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        name: '',
        otp: ''
    });
    const [contactMethod, setContactMethod] = useState('sms'); // 'sms' or 'email'
    const [step, setStep] = useState('CONTACT'); // CONTACT -> OTP -> COMPLETE
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.name.trim()) {
                throw new Error('Name is required');
            }

            if (contactMethod === 'sms') {
                const phoneRegex = /^\+?\d{10,}$/;
                if (!phoneRegex.test(formData.phone)) {
                    throw new Error('Please enter a valid phone number with country code (e.g., +1234567890)');
                }
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    throw new Error('Please enter a valid email address');
                }
            }

            await axios.post('/api/auth/generate-otp', {
                phone: formData.phone,
                email: formData.email,
                method: contactMethod
            });

            setStep('OTP');
        } catch (error) {
            setError(error.response?.data?.error || error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/verify-otp', {
                phone: formData.phone,
                email: formData.email,
                otp: formData.otp,
                name: formData.name,
                userType,
                method: contactMethod
            });

            localStorage.setItem('userId', response.data.user.id);
            login(response.data.token, userType);
            navigate(`/${userType}/dashboard`);
        } catch (error) {
            setError(error.response?.data?.error || error.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {userType === 'user' ? 'User Login' : 'Volunteer Login'}
                    </h2>
                </div>

                {step === 'CONTACT' ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Method</label>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setContactMethod('sms')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            contactMethod === 'sms'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        SMS
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setContactMethod('email')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            contactMethod === 'email'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        Email
                                    </button>
                                </div>
                            </div>

                            {contactMethod === 'sms' ? (
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        placeholder="Phone Number with country code (e.g., +1234567890)"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                    loading 
                                        ? 'bg-blue-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Enter the OTP sent to you"
                                value={formData.otp}
                                onChange={handleChange}
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                OTP sent to: {contactMethod === 'sms' ? formData.phone : formData.email}
                            </p>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                    loading 
                                        ? 'bg-blue-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('CONTACT')}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Back to Contact Information
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;