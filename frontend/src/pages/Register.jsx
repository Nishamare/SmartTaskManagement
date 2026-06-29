import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'member',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim())         errs.name = 'Name is required';
    else if (form.name.length < 2) errs.name = 'Min 2 characters';
    if (!form.email)               errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password)            errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (!form.confirmPassword)     errs.confirmPassword = 'Please confirm password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* Left Panel */}
      <div
        className="hidden lg:flex flex-col justify-center px-16 w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)' }}
      >
        {/* SVG Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Blobs */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-md">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl
                          flex items-center justify-center mb-8 border border-white/30">
            <span className="text-white text-2xl font-bold">S</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Start managing<br />smarter today ✨
          </h2>
          <p className="text-purple-200 text-lg leading-relaxed">
            Join thousands of teams using SmartTask to
            organize projects and hit deadlines.
          </p>

          {/* Features */}
          <div className="mt-10 space-y-4">
            {[
              { icon: '📁', text: 'Create unlimited projects' },
              { icon: '✅', text: 'Assign tasks with priorities' },
              { icon: '👥', text: 'Collaborate with your team' },
              { icon: '📊', text: 'Track progress with stats' },
            ].map(f => (
              <div key={f.text}
                className="flex items-center gap-3 bg-white/10
                           backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <span className="text-2xl">{f.icon}</span>
                <p className="text-white text-sm font-medium">{f.text}</p>
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
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">SmartTask</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create an account 🎉
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <input type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="John Doe"
                className={`input ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="label">Role</label>
              <select name="role" value={form.role}
                onChange={handleChange} className="input">
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="Min. 6 characters"
                className={`input ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} placeholder="Repeat your password"
                className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5">
              {loading ? <><Spinner size="sm" /> Creating...</> : 'Create Account'}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}