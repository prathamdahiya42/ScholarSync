'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LanguageToggle, useLanguage } from '@/lib/i18n/context';
import {
  GraduationCap,
  FileCheck,
  User,
  Bell,
  LogOut,
  ShieldCheck,
  FileCode2,
  Inbox,
  Sparkles
} from 'lucide-react';

export function Header() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setSession(data.session);
        } else {
          setSession(null);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-auto flex items-center justify-center shrink-0">
            <img
              src="/ScholarSync.png"
              alt="ScholarSync"
              className="h-10 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#111827] text-base tracking-tight group-hover:text-[#D62828] transition-colors">
                {t('portalTitle')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D62828] text-white shadow-xs">
                Official ST
              </span>
            </div>
            <p className="text-xs text-[#4B5563] hidden sm:block">
              {t('portalSubtitle')}
            </p>
          </div>
        </Link>

        {/* Navigation Items based on Role */}
        <nav className="flex items-center gap-1 sm:gap-3">
          {session?.role === 'student' && (
            <>
              <Link
                href="/student/catalog"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname.includes('/catalog')
                    ? 'bg-[#FEF2F2] text-[#D62828] font-semibold border border-[#FEE2E2]'
                    : 'text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2]'
                }`}
              >
                {t('navCatalog')}
              </Link>
              <Link
                href="/student/profile"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  pathname.includes('/profile')
                    ? 'bg-[#FEF2F2] text-[#D62828] font-semibold border border-[#FEE2E2]'
                    : 'text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2]'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{t('navProfile')}</span>
              </Link>
              <Link
                href="/student/notifications"
                className="p-2 rounded-lg text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2] relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </Link>
            </>
          )}

          {session?.role === 'management_reviewer' && (
            <>
              <Link
                href="/reviewer/queue"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                  pathname.includes('/reviewer')
                    ? 'bg-[#FEF2F2] text-[#D62828] font-semibold border border-[#FEE2E2]'
                    : 'text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2]'
                }`}
              >
                <FileCheck className="w-4 h-4 text-[#D62828]" />
                <span>{t('navReviewerQueue')}</span>
              </Link>
              <Link
                href="/admin/demo-messages"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2] flex items-center gap-1 transition-colors"
              >
                <Inbox className="w-4 h-4 text-[#D62828]" />
                <span className="hidden sm:inline">Sent Messages</span>
              </Link>
            </>
          )}

          {session?.role === 'admin' && (
            <>
              <Link
                href="/admin/scholarships"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                  pathname.includes('/scholarships')
                    ? 'bg-[#FEF2F2] text-[#D62828] font-semibold border border-[#FEE2E2]'
                    : 'text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2]'
                }`}
              >
                <FileCode2 className="w-4 h-4 text-[#D62828]" />
                <span>{t('navAdminConfigs')}</span>
              </Link>
              <Link
                href="/reviewer/queue"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2] transition-colors"
              >
                Queue
              </Link>
              <Link
                href="/admin/audit-log"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2] flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#D62828]" />
                <span className="hidden sm:inline">Audit</span>
              </Link>
              <Link
                href="/admin/demo-messages"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2] transition-colors"
              >
                Messages
              </Link>
            </>
          )}

          <div className="h-4 w-px bg-[#E5E7EB] mx-1" />

          {/* Language Toggle */}
          <LanguageToggle />

          {/* User / Sign In Button */}
          {session ? (
            <div className="flex items-center gap-2 pl-1">
              <span className="text-xs font-semibold text-[#111827] hidden lg:inline max-w-[120px] truncate">
                {session.name}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#4B5563] hover:text-[#D62828] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              {t('loginTitle')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
