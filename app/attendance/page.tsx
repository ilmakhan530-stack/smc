"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import {
  collection, doc, onSnapshot, setDoc, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CalendarCheck, Check, Clock3, Search, X } from "lucide-react";

type Person = {
  id: string;
  type: "labour" | "staff";
  name: string;
  mobile: string;
};

type RecordItem = {
  status: "Present" | "Absent" | "Half Day";
  inTime: string;
  outTime: string;
  overtimeHours: number;
};

// Standard paid shift is 8 hours. Overtime is calculated automatically from In/Out time.
function calculateOvertimeHours(inTime: string, outTime: string, status: RecordItem["status"]) {
  if (status === "Absent" || !inTime || !outTime) return 0;
  const [ih, im] = inTime.split(":").map(Number);
  const [oh, om] = outTime.split(":").map(Number);
  if (![ih, im, oh, om].every(Number.isFinite)) return 0;
  let minutes = (oh * 60 + om) - (ih * 60 + im);
  if (minutes < 0) minutes += 24 * 60;
  const extra = Math.max(0, minutes - 8 * 60);
  return Math.round((extra / 60) * 2) / 2;
}

const today = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

export default function Attendance() {
  const [people, setPeople] = useState<Person[]>([]);
  const [records, setRecords] = useState<Record<string, RecordItem>>({});
  const [date, setDate] = useState(today());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unLabour = onSnapshot(
      collection(db, "labour"),
      snap => {
        const labour = snap.docs.map(d => {
          const x = d.data() as any;
          return { id: d.id, type: "labour" as const, name: x.name || "", mobile: x.mobile || "" };
        });
        setPeople(prev => [...labour, ...prev.filter(p => p.type === "staff")]);
      },
      e => setError(e.message)
    );

    const unStaff = onSnapshot(
      collection(db, "staff"),
      snap => {
        const staff = snap.docs.map(d => {
          const x = d.data() as any;
          return { id: d.id, type: "staff" as const, name: x.name || "", mobile: x.mobile || "" };
        });
        setPeople(prev => [...prev.filter(p => p.type === "labour"), ...staff]);
      },
      e => setError(e.message)
    );

    return () => { unLabour(); unStaff(); };
  }, []);

  useEffect(() => {
    const q = query(collection(db, "attendance"), orderBy("date", "desc"));
    return onSnapshot(q, snap => {
      const next: Record<string, RecordItem> = {};
      snap.docs.forEach(d => {
        const x = d.data() as any;
        if (x.date === date) {
          next[`${x.personType}_${x.personId}`] = {
            status: x.status || "Present",
            inTime: x.inTime || "",
            outTime: x.outTime || "",
            overtimeHours: Number(x.overtimeHours || 0)
          };
        }
      });
      setRecords(next);
    }, e => setError(e.message));
  }, [date]);

  const filtered = useMemo(
    () => people
      .filter(p => `${p.name} ${p.mobile}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [people, search]
  );

  const getRecord = (p: Person): RecordItem =>
    records[`${p.type}_${p.id}`] || { status: "Present", inTime: "", outTime: "", overtimeHours: 0 };

  const updateLocal = (p: Person, patch: Partial<RecordItem>) => {
    const key = `${p.type}_${p.id}`;
    setRecords(prev => { const next = { ...getRecord(p), ...patch } as RecordItem; next.overtimeHours = calculateOvertimeHours(next.inTime, next.outTime, next.status); return { ...prev, [key]: next }; });
  };

  async function save(p: Person) {
    const key = `${p.type}_${p.id}`;
    const r = getRecord(p);
    const calculatedOT = calculateOvertimeHours(r.inTime, r.outTime, r.status);
    setSaving(key);
    setError("");
    try {
      await setDoc(doc(db, "attendance", `${date}_${p.type}_${p.id}`), {
        date,
        personId: p.id,
        personType: p.type,
        personName: p.name,
        status: r.status,
        inTime: r.inTime,
        outTime: r.outTime,
        overtimeHours: calculatedOT,
        updatedAt: new Date().toISOString()
      });
    } catch (e: any) {
      setError(e?.message || "Unable to save attendance");
    } finally {
      setSaving(null);
    }
  }

  const isSunday = new Date(`${date}T00:00:00`).getDay() === 0;

  const summary = filtered.reduce(
    (a, p) => {
      const s = getRecord(p).status;
      a.total++;
      if (s === "Present") a.present++;
      if (s === "Absent") a.absent++;
      if (s === "Half Day") a.half++;
      return a;
    },
    { total: 0, present: 0, absent: 0, half: 0 }
  );

  return (
    <AuthGuard allowedRoles={["admin", "attendance"]}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "30px 34px", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 22 }}>
            <div>
              <div style={{ color: "#168f67", fontWeight: 800, fontSize: 12, letterSpacing: 2 }}>SMC MANAGEMENT</div>
              <h1 style={{ margin: "6px 0", color: "#082b68", fontSize: 30 }}>Attendance Management</h1>
              <p style={{ margin: 0, color: "#6d7d96" }}>Mark daily attendance for Labour and Staff.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#52627b", fontWeight: 700 }}>
              <CalendarCheck size={20} />
              {date}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
            <input className="input" style={{ maxWidth: 190 }} type="date" value={date} onChange={e => setDate(e.target.value)} />
            <div style={{ position: "relative", width: 310, maxWidth: "100%" }}>
              <Search size={17} style={{ position: "absolute", left: 12, top: 12, color: "#7b8ca5" }} />
              <input className="input" style={{ paddingLeft: 38 }} placeholder="Search name or mobile" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {error && <div style={{ background: "#fff1f1", border: "1px solid #f0caca", color: "#b42318", padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14, marginBottom: 20 }}>
            {([
              ["Total", summary.total, "#1266e8"],
              ["Present", summary.present, "#168f67"],
              ["Absent", summary.absent, "#c93636"],
              ["Half Day", summary.half, "#b7791f"]
            ] as [string, number, string][]).map(([label, value, color]) => (
              <div className="card" key={label as string} style={{ padding: 18 }}>
                <div style={{ color: "#71809a", fontSize: 12, fontWeight: 700 }}>{label}</div>
                <b style={{ display: "block", marginTop: 5, color, fontSize: 25 }}>{value}</b>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20, overflowX: "auto" }}>
            <h2 style={{ margin: "0 0 8px", color: "#17345f", fontSize: 18 }}>Daily Attendance</h2>{isSunday && <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: "#fff7e6", border: "1px solid #f5d48a", color: "#8a5a00", fontWeight: 700, fontSize: 12 }}>Sunday: Labour working today receives 2× daily pay. Overtime is calculated automatically when Out Time is more than 8 hours after In Time.</div>}
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#71809a", fontSize: 12, borderBottom: "1px solid #e8eef7" }}>
                  {["Name", "Type", "Mobile", "Status", "In Time", "Out Time", "OT Hours", "Action"].map(h => <th key={h} style={{ padding: "12px 10px" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 45, textAlign: "center", color: "#71809a" }}>No Labour or Staff records found.</td></tr>
                ) : filtered.map(p => {
                  const r = getRecord(p);
                  const key = `${p.type}_${p.id}`;
                  return (
                    <tr key={key} style={{ borderBottom: "1px solid #eef2f7" }}>
                      <td style={{ padding: 12, fontWeight: 800, color: "#17345f" }}>{p.name}</td>
                      <td style={{ padding: 12 }}><span style={{ background: p.type === "labour" ? "#edf4ff" : "#eaf9f2", color: p.type === "labour" ? "#1266e8" : "#168f67", padding: "5px 9px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{p.type === "labour" ? "Labour" : "Staff"}</span></td>
                      <td style={{ padding: 12 }}>{p.mobile || "—"}</td>
                      <td style={{ padding: 12 }}>
                        <select className="input" style={{ minWidth: 125 }} value={r.status} onChange={e => updateLocal(p, { status: e.target.value as RecordItem["status"] })}>
                          <option>Present</option><option>Absent</option><option>Half Day</option>
                        </select>
                      </td>
                      <td style={{ padding: 12 }}><input className="input" type="time" value={r.inTime} disabled={r.status === "Absent"} onChange={e => updateLocal(p, { inTime: e.target.value })} /></td>
                      <td style={{ padding: 12 }}><input className="input" type="time" value={r.outTime} disabled={r.status === "Absent"} onChange={e => updateLocal(p, { outTime: e.target.value })} /></td>
                      <td style={{ padding: 12, fontWeight: 800, color: "#082b68" }}>{calculateOvertimeHours(r.inTime, r.outTime, r.status) > 0 ? `${calculateOvertimeHours(r.inTime, r.outTime, r.status)} hr` : "—"}</td>
                      <td style={{ padding: 12 }}>
                        <button className="btn btn-primary" disabled={saving === key} onClick={() => save(p)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {saving === key ? "Saving…" : <><Check size={15} /> Save</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
