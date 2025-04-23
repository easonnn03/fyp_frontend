'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterPage() {
    const router = useRouter();
    const [tpNumber, setTpNumber] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /* 
    1.
    "handleRegister" is a function that run when submit the register form
    <form onSubmit={handleRegister}>

    2. 
    e: events object pass to server
    FormEvent: a type of the form
    HTMLFormElement: a type of the form element

    3. 
    By default, it send a requests to server and reload the page (while submitting HTML)
    e.preventDefault(): avoid reloading page while submitting form, which may miss out the error message
    */

    //async: waiting for response
    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        {/*Call API and send requests*/ }
        try {
            await axios.post('http://localhost:3001/auth/register', {
                tpNumber: `TP${tpNumber}`,
                username,
                email,
                password,
            });

            toast.success('🎉 Registration successful! Redirecting to Login Page...');
            setTimeout(() => router.push('/login'), 2000);

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    const message = err.response.data?.message || 'Invalid input';
                    toast.error(`❌ ${message}`);
                }
                else if (err.request) {
                    toast.error('🌐 Network error: Cannot reach the server.');
                }
            } else {
                toast.error('Unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <ToastContainer position="top-center" autoClose={3000} />
            <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

                {/* TP Number Field */}
                <div className="relative mb-3">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">TP</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        placeholder="012345"
                        className="w-full pl-12 p-2 border rounded"
                        value={tpNumber}
                        onChange={(e) => setTpNumber(e.target.value.replace(/\D/g, ''))}
                        required
                        title="Enter the 6-digit number after TP (e.g. 012345)"
                    />
                </div>

                {/* Username */}
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 mb-3 border rounded"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                {/* Email */}
                <input
                    type="text"
                    placeholder="Email"
                    className="w-full p-2 mb-3 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    pattern="^[^@ ]+@[^@ ]+\.[^@ ]+$"
                    title="Please enter a valid email address (e.g. name@example.com)"
                />

                {/* Password */}
                <div className="relative mb-3">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="w-full p-2 pr-10 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        pattern=".{6,}"
                        title="Password must be at least 6 characters"

                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>

                {/* Confirm Password */}
                <div className="relative mb-3">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        className="w-full p-2 pr-10 border rounded"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        pattern=".{6,}"
                        title="Confirm Password must be at least 6 characters"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                    >
                        {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                </div>

                {/* Error message */}
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
                    Register
                </button>

                <p className="text-sm mt-4 text-center">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-500">Login</a>
                </p>
            </form>
        </div>
    );
}
