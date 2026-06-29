import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email)
      errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Invalid email address';
    if (!form.password)
      errs.password = 'Password is required';
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* Left Panel with SVG Background */}
      <div
        className="hidden lg:flex flex-col justify-center px-16 w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)' }}
      >
        {/* SVG Pattern Background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating Circles */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-10 w-24 h-24 bg-blue-300/20 rounded-full blur-xl" />

        {/* SVG Illustration */}
        <div className="absolute bottom-0 right-0 opacity-20">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
            <circle cx="250" cy="250" r="200" stroke="white" strokeWidth="2"/>
            <circle cx="250" cy="250" r="150" stroke="white" strokeWidth="2"/>
            <circle cx="250" cy="250" r="100" stroke="white" strokeWidth="2"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl
                          flex items-center justify-center mb-8 border border-white/30">
            <span className="text-white text-2xl font-bold">S</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Manage projects.<br />Ship faster. 🚀
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            The smart way to track tasks, collaborate
            with your team, and deliver results on time.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: 'Projects Managed', value: '500+',  icon: '📁' },
              { label: 'Team Members',     value: '2,000+',icon: '👥' },
              { label: 'Tasks Completed',  value: '15K+',  icon: '✅' },
              { label: 'On-time Delivery', value: '94%',   icon: '🎯' },
            ].map(stat => (
              <div key={stat.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20
                           rounded-xl p-4 hover:bg-white/20 transition-all">
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-indigo-200 text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12
                      bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-sm">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg
                            flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              SmartTask
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`input ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? <><Spinner size="sm" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register"
              className="text-indigo-600 hover:text-indigo-700 font-medium">
              Create one
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-950
                          border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
              🔑 Demo Credentials
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              Email: admin@smarttask.com
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              Password: Admin@123
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}