'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import {
  Inbox,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  Clock,
  RefreshCw,
  Bell
} from 'lucide-react';

export default function DemoMessagesLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchMessages = () => {
    setLoading(true);
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
      .catch((err) => toast.error('Failed to load messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, [router]);

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 text-[#D62828] border border-red-200">
            ScholarSync • Offline Demo Verification
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#D62828]" />
            Sent Messages Log (WhatsApp & SMS Simulator)
          </h1>
          <p className="text-xs text-slate-500">
            Inspect all dispatched external notifications in mock mode without requiring paid API keys.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 hover:border-[#D62828] flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D62828]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading sent notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 text-xs bg-white glow-card">
          No notifications dispatched yet. Submit or review an application to trigger alerts.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((msg) => {
            let payload: any = {};
            try {
              payload = JSON.parse(msg.payloadJson);
            } catch (e) {}

            return (
              <div
                key={msg.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 glow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {msg.student?.fullName || 'Student'} ({msg.student?.mobile})
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#D62828] border border-red-100 uppercase">
                      {msg.event}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600 uppercase text-[9px]">
                      {msg.channel}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F9FB] border border-slate-100 text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap">
                  {payload.text || 'Notification payload text'}
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Application: {msg.applicationId || 'General Profile'}</span>
                  <span className="text-[#D62828] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#D62828]" />
                    Simulated Delivery: {msg.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
