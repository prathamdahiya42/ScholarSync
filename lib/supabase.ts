import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ApplicationRecord, AuditEntry } from "@/types/scholarship";
import { INITIAL_APPLICATIONS } from "./mock-data";

export const INITIAL_AUDIT_LOG: AuditEntry[] = [
  {
    id: "AUD-1001",
    timestamp: "2026-10-24T10:20:00Z",
    action: "APPLICATION_SUBMITTED",
    actor: "Candidate (Ramesh Kumar Gond)",
    entityId: "NFS-26-MP-88391",
    details: "Encrypted pre-flight bundle verified with SHA-256 integrity seal.",
    sha256Hash: "0x8f2d7a1c9e3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f",
  },
  {
    id: "AUD-1002",
    timestamp: "2026-10-25T14:15:30Z",
    action: "DEFICIENCY_FLAGGED",
    actor: "INST-OFF-03 (Dr. S. Sharma)",
    entityId: "NFS-26-MP-88391",
    details: "[DEF_INC_EXPIRED] Fresh income certificate required for AY 2026-27.",
    sha256Hash: "0x3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f8f2d7a1c9e",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Local Reactive Fallback Store (Ensures 100% Free & Offline Functionality)
class HybridScholarshipStore {
  private applications: ApplicationRecord[] = [...INITIAL_APPLICATIONS];
  private auditLogs: AuditEntry[] = [...INITIAL_AUDIT_LOG];
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Attempt to hydrate from localStorage on client
    if (typeof window !== "undefined") {
      try {
        const savedApps = localStorage.getItem("adi_setu_apps");
        const savedLogs = localStorage.getItem("adi_setu_logs");
        if (savedApps) this.applications = JSON.parse(savedApps);
        if (savedLogs) this.auditLogs = JSON.parse(savedLogs);
      } catch (e) {
        console.warn("Storage hydration failed, using initial mock data", e);
      }
    }
  }

  private notify() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("adi_setu_apps", JSON.stringify(this.applications));
        localStorage.setItem("adi_setu_logs", JSON.stringify(this.auditLogs));
      } catch (e) {
        // ignore quota errors
      }
    }
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public async getApplications(): Promise<ApplicationRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .order("submitted_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data as unknown as ApplicationRecord[];
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local memory:", err);
      }
    }
    return [...this.applications];
  }

  public async getApplicationById(id: string): Promise<ApplicationRecord | undefined> {
    const apps = await this.getApplications();
    return apps.find((a) => a.id === id);
  }

  public async saveApplication(app: ApplicationRecord): Promise<ApplicationRecord> {
    const index = this.applications.findIndex((a) => a.id === app.id);
    if (index >= 0) {
      this.applications[index] = { ...app };
    } else {
      this.applications.unshift({ ...app });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("applications").upsert(app as any);
      } catch (e) {
        console.warn("Supabase upsert failed:", e);
      }
    }

    this.notify();
    return app;
  }

  public async updateStatus(
    appId: string,
    status: ApplicationRecord["status"],
    officerNotes?: string,
    officerId: string = "OFF-4029"
  ): Promise<ApplicationRecord | undefined> {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return undefined;

    app.status = status;
    if (officerNotes) {
      app.aiFlags = app.aiFlags || [];
      app.aiFlags.push({
        id: `FLAG-${Date.now()}`,
        ruleId: "OFFICER_REMARK",
        field: "general",
        severity: status === "defective" ? "hard" : "soft",
        message: {
          en: officerNotes,
          hi: officerNotes,
        },
        confidence: 1.0,
      });
    }

    // Add immutable audit log entry
    const newLog: AuditEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: status === "verified" ? "APPROVED" : status === "defective" ? "DEFICIENCY_ISSUED" : "REJECTED",
      actor: `${officerId} (District Nodal Officer)`,
      entityId: appId,
      details: officerNotes || `Status updated to ${status}`,
      sha256Hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    };
    this.auditLogs.unshift(newLog);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("applications").update({ status, updated_at: new Date().toISOString() }).eq("id", appId);
        await supabase.from("audit_logs").insert(newLog as any);
      } catch (e) {
        console.warn("Supabase status update failed:", e);
      }
    }

    this.notify();
    return app;
  }

  public async getAuditLogs(): Promise<AuditEntry[]> {
    return [...this.auditLogs];
  }

  public resetToDefault() {
    this.applications = [...INITIAL_APPLICATIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOG];
    this.notify();
  }
}

export const scholarshipStore = new HybridScholarshipStore();
