'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  FileCode2,
  ArrowRight,
  Sparkles,
  Smartphone,
  Lock,
  Layers,
  Inbox,
  UserCheck
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-14 space-y-16">
      {/* Hero Section */}
      <div className="relative text-center max-w-3xl mx-auto space-y-5">
        {/* Soft light-red radial gradient glow behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-radial from-[#FEE2E2]/70 via-[#FEF2F2]/30 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="flex justify-center mb-1">
          <img
            src="/ScholarSync.png"
            alt="ScholarSync Logo"
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF2F2] text-[#D62828] text-xs font-bold border border-[#FEE2E2] shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D62828]" />
          <span>ScholarSync • Config-Driven Scholarship Engine • Ministry of Tribal Affairs</span>
        </div>

        {/* Two-tone bold heading */}
        <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-[1.15]">
          <span className="text-[#D62828]">ScholarSync</span> Tribal Scholarship Management & Verification
        </h1>

        <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed max-w-2xl mx-auto">
          Built for Scheduled Tribe students in Classes IX & X. Powered by JSON-driven eligibility rules, offline-ready mock providers, automated certificate quality checks, and strict manual officer verification.
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/student/catalog"
            className="btn-primary"
          >
            <span>Browse Active Scholarships</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="btn-secondary"
          >
            <Smartphone className="w-4 h-4 text-[#D62828]" />
            <span>Student & Staff Login</span>
          </Link>
        </div>
      </div>

      {/* 3 Core Roles Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Flow */}
        <div className="glow-card p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#D62828] text-white flex items-center justify-center mb-4 shadow-sm shadow-[#D62828]/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#111827]">
              Student Experience (Mobile-First)
            </h2>
            <p className="text-xs text-[#4B5563] mt-1.5 leading-relaxed">
              Mobile OTP login (mock 123456), interactive yes/no questionnaire, instant AI document readability checks, and live status tracking.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-[#4B5563]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D62828] shrink-0" />
                <span>Category-gated catalog (ST only vs open)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D62828] shrink-0" />
                <span>Aadhaar last 4 only (privacy-first)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D62828] shrink-0" />
                <span>Plain language feedback in English &amp; Hindi</span>
              </li>
            </ul>
          </div>
          <Link
            href="/student/catalog"
            className="btn-secondary w-full text-center text-xs"
          >
            Explore Student Flow →
          </Link>
        </div>

        {/* Management Reviewer */}
        <div className="glow-card p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#D62828] text-white flex items-center justify-center mb-4 shadow-sm shadow-[#D62828]/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#111827]">
              Management Reviewer (Desktop-First)
            </h2>
            <p className="text-xs text-[#4B5563] mt-1.5 leading-relaxed">
              Strict manual verification workspace. Oldest-first review queue with SLA countdowns, dual-pane document inspector, and mandatory checklists.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-[#4B5563]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D62828] shrink-0" />
                <span>Approval strictly locked until all docs viewed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D62828] shrink-0" />
                <span>Side-by-side OCR vs entered data diff</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D62828] shrink-0" />
                <span>Audit logging for every view &amp; decision</span>
              </li>
            </ul>
          </div>
          <Link
            href="/reviewer/queue"
            className="btn-secondary w-full text-center text-xs"
          >
            Open Review Queue →
          </Link>
        </div>

        {/* Admin Config Engine */}
        <div className="glow-card p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#D62828] text-white flex items-center justify-center mb-4 shadow-sm shadow-[#D62828]/25">
              <FileCode2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#111827]">
              Admin &amp; Config Studio
            </h2>
            <p className="text-xs text-[#4B5563] mt-1.5 leading-relaxed">
              Upload new scholarship JSON files validated against scholarship.schema.json with zero code changes. Inspect notifications &amp; audit trail.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-[#4B5563]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D62828] shrink-0" />
                <span>AJV Schema validation with error reporting</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D62828] shrink-0" />
                <span>Simulated WhatsApp &amp; SMS message viewer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D62828] shrink-0" />
                <span>Audit log trail &amp; system settings</span>
              </li>
            </ul>
          </div>
          <Link
            href="/admin/scholarships"
            className="btn-secondary w-full text-center text-xs"
          >
            Manage Configurations →
          </Link>
        </div>
      </div>

      {/* Demo Quick-Launch Panel */}
      <div className="glow-card bg-[#111827] text-white border border-[#374151] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#374151]">
          <div>
            <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
              1-Click Demo Evaluation Credentials
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Instant Demonstration Presets (Zero Keys Required)
            </h3>
          </div>
          <Link
            href="/admin/demo-messages"
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-semibold"
          >
            <Inbox className="w-4 h-4 text-[#EF4444]" />
            <span>Open Sent Messages Simulator →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-xs">
          <div className="p-4 rounded-xl bg-[#1F2937] border border-[#374151] hover:border-[#D62828] transition-colors">
            <span className="font-bold text-[#EF4444] block mb-1">Eligible ST Student</span>
            <span className="text-white font-semibold block">Birsa Munda (Class IX)</span>
            <span className="text-[#9CA3AF] font-mono text-[11px] block mt-1">Mobile: 9876543210</span>
            <span className="text-[10px] text-[#EF4444] block mt-1 font-medium">OTP: 123456 • Income: ₹1.45L</span>
          </div>

          <div className="p-4 rounded-xl bg-[#1F2937] border border-[#374151] hover:border-[#D62828] transition-colors">
            <span className="font-bold text-[#EF4444] block mb-1">High-Income ST Student</span>
            <span className="text-white font-semibold block">Ramesh Oraon (Class IX)</span>
            <span className="text-[#9CA3AF] font-mono text-[11px] block mt-1">Mobile: 9876543211</span>
            <span className="text-[10px] text-[#EF4444] block mt-1 font-medium">OTP: 123456 • Income &gt; ₹2.5L</span>
          </div>

          <div className="p-4 rounded-xl bg-[#1F2937] border border-[#374151] hover:border-[#D62828] transition-colors">
            <span className="font-bold text-[#EF4444] block mb-1">General Category Student</span>
            <span className="text-white font-semibold block">Priya Sharma (Class IX)</span>
            <span className="text-[#9CA3AF] font-mono text-[11px] block mt-1">Mobile: 9876543212</span>
            <span className="text-[10px] text-[#9CA3AF] block mt-1 font-medium">Blocked from ST-only scheme</span>
          </div>

          <div className="p-4 rounded-xl bg-[#1F2937] border border-[#374151] hover:border-[#D62828] transition-colors">
            <span className="font-bold text-[#EF4444] block mb-1">Official Reviewer / Admin</span>
            <span className="text-white font-semibold block">Reviewer &amp; Admin</span>
            <span className="text-[#9CA3AF] font-mono text-[11px] block mt-1">reviewer@demo.local</span>
            <span className="text-[10px] text-[#EF4444] block mt-1 font-medium">Password: Reviewer@123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
