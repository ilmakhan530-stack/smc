"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { db } from "@/lib/firebase";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc
} from "firebase/firestore";
import { Pencil, Plus, Search, Trash2, X, Users, IndianRupee } from "lucide-react";

type Staff = {
  id: string;
  name: string;
  mobile: string;
  address: string;
  joiningDate: string;
  monthlySalary: number;
  active: boolean;
};

const emptyForm = {
  name: "",
  mobile: "",
  address: "",
  joiningDate: "",
  monthlySalary: "",
  active: true
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "staff"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setStaff(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Staff, "id">)
          }))
        );
        setLoading(false);
        setError("");
      },
      (e) => {
        setLoading(false);
        setError(e.message || "Unable to load staff data");
      }
    );
  }, []);

  const filtered = useMemo(
    () =>
      staff.filter((s) =>
        `${s.name} ${s.mobile} ${s.address}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [staff, search]
  );

  const totalSalary = staff
    .filter((s) => s.active)
    .reduce((sum, s) => sum + Number(s.monthlySalary || 0), 0);

  function startAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
    setError("");
  }

  function startEdit(s: Staff) {
    setEditing(s);
    setForm({
      name: s.name,
      mobile: s.mobile,
      address: s.address,
      joiningDate: s.joiningDate,
      monthlySalary: String(s.monthlySalary ?? ""),
      active: s.active !== false
    });
    setOpen(true);
    setError("");
  }

  async function save() {
    if (
      !form.name.trim() ||
      !form.mobile.trim() ||
      !form.joiningDate ||
      !form.monthlySalary
    ) {
      setError("Name, Mobile, Joining Date and Monthly Salary are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        joiningDate: form.joiningDate,
        monthlySalary: Number(form.monthlySalary),
        active: form.active,
        updatedAt: serverTimestamp()
      };

      if (editing) {
        await updateDoc(doc(db, "staff", editing.id), data);
      } else {
        await addDoc(collection(db, "staff"), {
          ...data,
          createdAt: serverTimestamp()
        });
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (e: any) {
      setError(e?.message || "Could not save staff");
    } finally {
      setSaving(false);
    }
  }

  async function remove(s: Staff) {
    if (!confirm(`Delete ${s.name}?`)) return;
    try {
      await deleteDoc(doc(db, "staff", s.id));
    } catch (e: any) {
      setError(e?.message || "Could not delete staff");
    }
  }

  return (
    <AuthGuard requiredPermission="staff">
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "30px 34px", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
            <div>
              <div style={{ color: "#168f67", fontWeight: 800, fontSize: 12, letterSpacing: 2 }}>SMC MANAGEMENT</div>
              <h1 style={{ margin: "6px 0", fontSize: 30, color: "#082b68" }}>Staff Management</h1>
              <p style={{ margin: 0, color: "#6d7d96" }}>Manage staff records, monthly salary and active status.</p>
            </div>
            <button className="btn btn-primary" onClick={startAdd} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Plus size={18} /> Add Staff
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "#eaf3ff", display: "grid", placeItems: "center", color: "#1266e8" }}><Users /></div>
              <div><div style={{ color: "#71809a", fontSize: 13 }}>Total Staff</div><b style={{ fontSize: 25, color: "#082b68" }}>{staff.length}</b></div>
            </div>
            <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "#eaf9f2", display: "grid", placeItems: "center", color: "#168f67" }}><IndianRupee /></div>
              <div><div style={{ color: "#71809a", fontSize: 13 }}>Active Monthly Salary</div><b style={{ fontSize: 25, color: "#082b68" }}>₹ {totalSalary.toLocaleString("en-IN")}</b></div>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: "#17345f" }}>Staff List</h2>
              <div style={{ position: "relative", width: 300, maxWidth: "100%" }}>
                <Search size={17} style={{ position: "absolute", left: 12, top: 12, color: "#7b8ca5" }} />
                <input className="input" style={{ paddingLeft: 38 }} placeholder="Search name, mobile or address" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            {error && <div style={{ background: "#fff1f1", border: "1px solid #f0caca", color: "#b42318", padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 13 }}>{error}</div>}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#71809a", fontSize: 12, borderBottom: "1px solid #e8eef7" }}>
                    {["Name", "Mobile", "Address", "Joining Date", "Monthly Salary", "Status", "Action"].map((h) => <th key={h} style={{ padding: "12px 10px" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ padding: 35, textAlign: "center", color: "#71809a" }}>Loading staff records…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 45, textAlign: "center", color: "#71809a" }}>No staff records yet. Click <b>Add Staff</b> to create the first one.</td></tr>
                  ) : filtered.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #eef2f7" }}>
                      <td style={{ padding: 14, fontWeight: 800, color: "#17345f" }}>{s.name}</td>
                      <td style={{ padding: 14 }}>{s.mobile}</td>
                      <td style={{ padding: 14, maxWidth: 240 }}>{s.address || "—"}</td>
                      <td style={{ padding: 14 }}>{s.joiningDate}</td>
                      <td style={{ padding: 14, fontWeight: 700 }}>₹ {Number(s.monthlySalary || 0).toLocaleString("en-IN")}</td>
                      <td style={{ padding: 14 }}>
                        <span style={{ padding: "5px 9px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: s.active ? "#e8f8ef" : "#f1f3f6", color: s.active ? "#168f67" : "#667085" }}>
                          {s.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: 14 }}>
                        <div style={{ display: "flex", gap: 7 }}>
                          <button onClick={() => startEdit(s)} title="Edit" style={{ border: 0, background: "#edf4ff", color: "#1266e8", padding: 8, borderRadius: 8, cursor: "pointer" }}><Pencil size={15} /></button>
                          <button onClick={() => remove(s)} title="Delete" style={{ border: 0, background: "#fff0f0", color: "#c93636", padding: 8, borderRadius: 8, cursor: "pointer" }}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {open && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(8,35,75,.38)", display: "grid", placeItems: "center", padding: 20, zIndex: 50 }} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
              <div className="card" style={{ width: 620, maxWidth: "100%", padding: 26 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ margin: 0, color: "#082b68" }}>{editing ? "Edit Staff" : "Add Staff"}</h2>
                    <p style={{ margin: "5px 0 0", fontSize: 13, color: "#71809a" }}>Enter the staff's basic employment details.</p>
                  </div>
                  <button onClick={() => setOpen(false)} style={{ border: 0, background: "#f2f5f9", borderRadius: 9, padding: 8, cursor: "pointer" }}><X size={18} /></button>
                </div>

                {error && <div style={{ background: "#fff1f1", color: "#b42318", padding: 10, borderRadius: 9, marginBottom: 12, fontSize: 13 }}>{error}</div>}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#52627b" }}>Staff Name
                    <input className="input" style={{ marginTop: 6 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </label>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#52627b" }}>Mobile Number
                    <input className="input" style={{ marginTop: 6 }} inputMode="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                  </label>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#52627b", gridColumn: "1/-1" }}>Address
                    <input className="input" style={{ marginTop: 6 }} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </label>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#52627b" }}>Joining Date
                    <input className="input" style={{ marginTop: 6 }} type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
                  </label>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#52627b" }}>Monthly Salary (₹)
                    <input className="input" style={{ marginTop: 6 }} type="number" min="0" value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })} />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 800, color: "#52627b", gridColumn: "1/-1" }}>
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Staff is Active
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
                  <button className="btn" onClick={() => setOpen(false)} disabled={saving}>Cancel</button>
                  <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : editing ? "Update Staff" : "Save Staff"}</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
