'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import { Bell, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export default function StudentNotificationsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch((err) => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D62828] border border-red-100 flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notification History</h1>
          <p className="text-xs text-slate-500">Official SMS, WhatsApp, and in-app status notifications</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-xs bg-white glow-card">
          No notifications yet. Notifications will appear when you submit an application.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => {
            let payload: any = {};
            try {
              payload = JSON.parse(n.payloadJson);
            } catch (e) {}

            return (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5 glow-card"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#D62828] uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md bg-red-50 border border-red-100">
                    {n.event.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {payload.text || 'Application status updated.'}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                  <span>Channel: {n.channel}</span>
                  <span>•</span>
                  <span className="capitalize">Status: {n.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
