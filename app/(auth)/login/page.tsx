'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import {
  GraduationCap,
  Shield,
  Smartphone,
  Lock,
  ArrowRight,
  UserCheck,
  Building,
  KeyRound
} from 'lucide-react';

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [tab, setTab] = useState<'student' | 'staff'>('student');

  // Student OTP state
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Staff state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSendOtp = async (mobileNum: string = mobile) => {
    if (!mobileNum || mobileNum.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileNum })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}. Please ensure Next.js dev server is running.`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOtpSent(true);
      setOtp('123456'); // Auto-fill demo OTP
      toast.success(data.message || 'OTP sent (Demo: 123456)');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, code: otp })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}. Please ensure Next.js dev server is running.`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Welcome, ${data.student.fullName}!`);
      if (data.isNew || !data.student.hasConsent) {
        router.push('/student/profile');
      } else {
        router.push('/student/catalog');
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (staffEmail = email, staffPassword = password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: staffEmail, password: staffPassword })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}. Please ensure Next.js dev server is running.`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Logged in as ${data.user.name} (${data.user.role})`);
      if (data.user.role === 'admin') {
        router.push('/admin/scholarships');
      } else {
        router.push('/reviewer/queue');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickStudent = (num: string) => {
    setMobile(num);
    handleSendOtp(num);
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="glow-card p-0 rounded-2xl shadow-xl overflow-hidden bg-white border border-[#E5E7EB]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#D62828] to-[#991B1B] p-6 text-white text-center shadow-xs">
          <div className="h-16 w-auto mx-auto flex items-center justify-center mb-3">
            <img
              src="/ScholarSync.png"
              alt="ScholarSync"
              className="h-14 w-auto object-contain drop-shadow-md rounded-xl bg-white p-1"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ScholarSync Portal</h1>
          <p className="text-[#FEE2E2] text-xs mt-1">Ministry of Tribal Affairs, Government of India</p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1.5 bg-[#F8F9FB] m-4 rounded-xl border border-[#E5E7EB]">
          <button
            onClick={() => setTab('student')}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'student'
                ? 'bg-white text-[#D62828] shadow-xs border border-[#FEE2E2]'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#D62828]" />
            Student Login
          </button>
          <button
            onClick={() => setTab('staff')}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'staff'
                ? 'bg-white text-[#D62828] shadow-xs border border-[#FEE2E2]'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#D62828]" />
            Official / Reviewer
          </button>
        </div>

        <div className="p-6 pt-2">
          {tab === 'student' ? (
            <div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                  Mobile Number (OTP Verified)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm font-semibold text-[#9CA3AF]">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile"
                    disabled={otpSent}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] text-sm focus:outline-none focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  onClick={() => handleSendOtp()}
                  disabled={loading || mobile.length !== 10}
                  className="btn-primary w-full"
                >
                  {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      6-Digit OTP (Mock dev: 123456)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 text-center text-lg tracking-widest font-mono rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || !otp}
                    className="btn-primary w-full"
                  >
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setOtpSent(false)}
                    className="w-full text-xs text-[#4B5563] hover:text-[#D62828] text-center cursor-pointer transition-colors"
                  >
                    Change mobile number
                  </button>
                </div>
              )}

              {/* Quick test student profiles */}
              <div className="mt-8 pt-4 border-t border-[#E5E7EB]">
                <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-2">
                  Demo Fast-Login (1-Click Test):
                </span>
                <div className="space-y-2">
                  <button
                    onClick={() => fillQuickStudent('9876543210')}
                    className="w-full text-left p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#D62828] hover:bg-[#FEF2F2] transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#111827] group-hover:text-[#D62828] flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#D62828]" />
                        Birsa Munda (ST Class IX)
                      </div>
                      <div className="text-[10px] text-[#4B5563]">Category: ST | Eligible for Pre-Matric Scheme</div>
                    </div>
                    <span className="text-xs font-semibold text-[#D62828]">Select →</span>
                  </button>

                  <button
                    onClick={() => fillQuickStudent('9876543211')}
                    className="w-full text-left p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#D62828] hover:bg-[#FEF2F2] transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#111827] group-hover:text-[#D62828] flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#D62828]" />
                        Ramesh Oraon (High Income ST)
                      </div>
                      <div className="text-[10px] text-[#4B5563]">Category: ST | Income &gt; ₹2.5L (Should Fail Income)</div>
                    </div>
                    <span className="text-xs font-semibold text-[#D62828]">Select →</span>
                  </button>

                  <button
                    onClick={() => fillQuickStudent('9876543212')}
                    className="w-full text-left p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#D62828] hover:bg-[#FEF2F2] transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#111827] group-hover:text-[#D62828] flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#4B5563] group-hover:text-[#D62828]" />
                        Priya Sharma (General Category)
                      </div>
                      <div className="text-[10px] text-[#4B5563]">Category: GENERAL | Blocked from ST-only schemes</div>
                    </div>
                    <span className="text-xs font-semibold text-[#4B5563] group-hover:text-[#D62828]">Select →</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@demo.local"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] text-sm focus:outline-none focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] text-sm focus:outline-none focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all placeholder:text-[#9CA3AF]"
                  />
                </div>
                <button
                  onClick={() => handleStaffLogin()}
                  disabled={loading || !email || !password}
                  className="btn-primary w-full"
                >
                  {loading ? 'Authenticating...' : 'Sign In as Official'}
                </button>
              </div>

              {/* Quick Staff Logins */}
              <div className="mt-8 pt-4 border-t border-[#E5E7EB]">
                <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block mb-2">
                  Official Demo Accounts (1-Click):
                </span>
                <div className="space-y-2">
                  <button
                    onClick={() => handleStaffLogin('reviewer@demo.local', 'Reviewer@123')}
                    className="w-full text-left p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#D62828] hover:bg-[#FEF2F2] transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#111827] group-hover:text-[#D62828] flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#D62828]" />
                        Verification Officer (Reviewer)
                      </div>
                      <div className="text-[10px] text-[#4B5563]">reviewer@demo.local / Reviewer@123</div>
                    </div>
                    <span className="text-xs font-semibold text-[#D62828]">Login →</span>
                  </button>

                  <button
                    onClick={() => handleStaffLogin('admin@demo.local', 'Admin@123')}
                    className="w-full text-left p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#D62828] hover:bg-[#FEF2F2] transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#111827] group-hover:text-[#D62828] flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#D62828]" />
                        Platform Administrator
                      </div>
                      <div className="text-[10px] text-[#4B5563]">admin@demo.local / Admin@123</div>
                    </div>
                    <span className="text-xs font-semibold text-[#D62828]">Login →</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
