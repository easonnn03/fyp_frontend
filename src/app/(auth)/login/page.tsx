'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AxiosError } from 'axios';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:3001/auth/login', {
                email,
                password,
            });

            const token = res.data.access_token;

            // Store the token securely in localStorage
            localStorage.setItem('accessToken', res.data.access_token);
            localStorage.setItem('refreshToken', res.data.refresh_token);

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            toast.success('🎉 Login successful! Redirecting...');
            setTimeout(() => router.push('/home'), 1500);
        } catch (err: unknown) {
            const axiosError = err as AxiosError<{ message: string }>;
            if (axiosError.request && !axiosError.response) {
                toast.error('🌐 Cannot connect to the server. Please try again later.');
                return;
            }

            const message = axiosError.response?.data?.message || 'Login failed. Please try again.';
            toast.error(`❌ ${message}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <ToastContainer position="top-center" autoClose={1000} />

            <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

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

                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 hover:scale-[1.02]">
                    Login
                </button>

                <p className="text-sm mt-4 text-center">
                    Don&apos;t have an account?{' '}
                    <a href="/register" className="text-blue-500 hover:underline">Register</a>
                </p>
            </form>
        </div>
    );
}