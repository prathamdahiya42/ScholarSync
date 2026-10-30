'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User,
  ShieldCheck,
  Building2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight
} from 'lucide-react';

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    dob: '2010-01-01',
    gender: 'male',
    email: '',
    socialCategory: 'ST',
    domicileState: 'Jharkhand',
    district: 'Ranchi',
    currentClass: 'Class IX',
    schoolName: '',
    isHosteller: false,
    hasDisability: false,
    disabilityType: '',
    aadhaarLast4: '0000',
    bankAccountNumber: '',
    bankAccountMasked: '',
    ifsc: 'SBIN0001234',
    bankName: 'State Bank of India',
    bankHolderName: '',
    language: 'en',
    parentConsent: false,
    guardianConsentAt: null as string | null
  });

  useEffect(() => {
    fetch('/api/student/profile')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            parentConsent: !!data.guardianConsentAt,
            bankAccountNumber: data.bankAccountMasked || ''
          }));
        }
      })
      .catch((err) => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentConsent) {
      toast.error('Parent / Guardian consent is required for minor students.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Profile saved successfully!');
      router.push('/student/catalog');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-slate-500">
        Loading student profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 glow-card">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#D62828]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Registration Profile</h1>
            <p className="text-xs text-slate-500">
              Provide accurate profile details for eligibility verification and direct DBT disbursement.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Personal Details */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#D62828]" />
              1. Personal & Category Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Birsa Munda"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Father's / Guardian's Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="e.g. Sugana Munda"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Social Category *
                </label>
                <select
                  value={formData.socialCategory}
                  onChange={(e) => setFormData({ ...formData, socialCategory: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none font-semibold text-[#D62828]"
                >
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="OBC">Other Backward Class (OBC)</option>
                  <option value="GENERAL">General</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                  <option value="OTHER">Other</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Pre-Matric ST scholarship is strictly restricted to ST students.
                </span>
              </div>
            </div>
          </div>

          {/* Domicile & School Details */}
          <div className="pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D62828]" />
              2. Domicile & School Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Domicile State / UT *
                </label>
                <input
                  type="text"
                  required
                  value={formData.domicileState}
                  onChange={(e) => setFormData({ ...formData, domicileState: e.target.value })}
                  placeholder="e.g. Jharkhand, Odisha, MP"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Khunti, Ranchi"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Class *
                </label>
                <select
                  value={formData.currentClass}
                  onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none font-medium"
                >
                  <option value="Class IX">Class IX</option>
                  <option value="Class X">Class X</option>
                  <option value="Class XI">Class XI (Post-Matric)</option>
                  <option value="Class XII">Class XII (Post-Matric)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="e.g. Govt Tribal High School"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isHosteller"
                  checked={formData.isHosteller}
                  onChange={(e) => setFormData({ ...formData, isHosteller: e.target.checked })}
                  className="w-4 h-4 accent-[#D62828] rounded"
                />
                <label htmlFor="isHosteller" className="text-xs font-medium text-slate-700">
                  Residing in School Hostel (Entitles to higher hosteller scholarship rates)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasDisability"
                  checked={formData.hasDisability}
                  onChange={(e) => setFormData({ ...formData, hasDisability: e.target.checked })}
                  className="w-4 h-4 accent-[#D62828] rounded"
                />
                <label htmlFor="hasDisability" className="text-xs font-medium text-slate-700">
                  Divyangjan / Sickle Cell / Thalassemia (Entitles to disability allowance)
                </label>
              </div>
            </div>
          </div>

          {/* Aadhaar Privacy & Bank Account Details */}
          <div className="pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#D62828]" />
              3. Aadhaar & Bank Details (Encrypted at Rest)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aadhaar (Last 4 Digits Only) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">XXXX-XXXX-</span>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={formData.aadhaarLast4}
                    onChange={(e) => setFormData({ ...formData, aadhaarLast4: e.target.value.replace(/\D/g, '') })}
                    placeholder="4321"
                    className="w-24 px-3 py-2 rounded-lg border border-slate-300 text-center font-mono text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                  />
                </div>
                <span className="text-[10px] text-[#D62828] block mt-1">
                  🔒 Privacy rule: Only the last 4 digits are collected or stored.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="Enter account number"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Encrypted using AES-256-GCM. Masked in UI for security.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank IFSC Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                  placeholder="e.g. SBIN0001234"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase font-mono text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankHolderName}
                  onChange={(e) => setFormData({ ...formData, bankHolderName: e.target.value })}
                  placeholder="Student or Joint with Parent"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Minor Parent/Guardian Consent */}
          <div className="pt-4 border-t border-slate-200">
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="parentConsent"
                  required
                  checked={formData.parentConsent}
                  onChange={(e) => setFormData({ ...formData, parentConsent: e.target.checked })}
                  className="w-5 h-5 accent-[#D62828] rounded mt-0.5"
                />
                <div>
                  <label htmlFor="parentConsent" className="text-xs sm:text-sm font-bold text-slate-900 cursor-pointer">
                    Parent / Guardian Consent Declaration (Mandatory for Minors)
                  </label>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    I declare that the student is a minor (Class IX/X), and their parent/guardian has reviewed, verified, and explicitly consented to submit this scholarship application and upload required identification certificates.
                  </p>
                  {formData.guardianConsentAt && (
                    <div className="text-[11px] text-[#D62828] font-semibold mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Consent recorded at: {new Date(formData.guardianConsentAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-[#D62828] text-white font-semibold text-sm hover:bg-[#B91C1C] disabled:opacity-50 transition-all shadow-md shadow-red-600/20 active:scale-[0.98] flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile & Explore Scholarships'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
