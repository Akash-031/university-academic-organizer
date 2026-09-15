import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, GraduationCap, Loader2 } from 'lucide-react';
import { requestPasswordResetApi } from '../services/authApi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await requestPasswordResetApi(email.trim());
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message || 'Unable to request a password reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Reset your password</h1>
          <p className="text-xs text-slate-500 mt-1">We will send a secure reset link if an account exists</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                placeholder="you@university.edu"
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Sending...' : 'Send reset link'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
