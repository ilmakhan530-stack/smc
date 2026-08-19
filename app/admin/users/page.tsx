"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, createManagedUser } from "@/lib/firebase";
import AuthGuard, { UserRole } from "@/components/AuthGuard";
import { UserPlus, Save, Power, Trash2, ShieldCheck } from "lucide-react";

type Permissions = Record<string, boolean>;
type ManagedUser = {
  id: string;
  email?: string;
  name?: string;
  role?: UserRole;
  enabled?: boolean;
  permissions?: Permissions;
};

const modules = [
  ["dashboard", "Dashboard"],
  ["labour", "Labour"],
  ["staff", "Staff"],
  ["attendance", "Attendance"],
  ["salary", "Salary"],
  ["advance", "Advance"],
  ["thekedar", "Thekedar Work"],
  ["bill", "Bill / Tax Invoice"],
  ["stock", "Stock"],
  ["reports", "Reports"],
] as const;

const blankPermissions = (): Permissions =>
  Object.fromEntries(modules.map(([key]) => [key, false]));

function UsersPanel() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("attendance");
  const [permissions, setPermissions] = useState<Permissions>(blankPermissions());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, "users"), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as ManagedUser)));
    });
  }, []);

  const activeCount = useMemo(() => users.filter(u => u.enabled !== false).length, [users]);

  function togglePermission(key: string) {
    setPermissions(p => ({ ...p, [key]: !p[key] }));
  }

  function selectAll(value: boolean) {
    setPermissions(Object.fromEntries(modules.map(([key]) => [key, value])));
  }

  async function createUser() {
    setMsg("");
    setErr("");
    if (!email.trim() || !password || password.length < 6 || !name.trim()) {
      setErr("Name, Email aur minimum 6 character password dijiye.");
      return;
    }

    setSaving(true);
    try {
      const u = await createManagedUser(email.trim(), password, {
        name: name.trim(),
        role,
        enabled: true,
        permissions,
      });

      // Keep the profile document authoritative even if the helper already wrote it.
      await setDoc(doc(db, "users", u.uid), {
        email: email.trim(),
        name: name.trim(),
        role,
        enabled: true,
        permissions,
      }, { merge: true });

      setEmail("");
      setPassword("");
      setName("");
      setRole("attendance");
      setPermissions(blankPermissions());
      setMsg("User successfully create ho gaya.");
    } catch (e: any) {
      setErr(e?.message || "User create nahi hua.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(u: ManagedUser) {
    await setDoc(doc(db, "users", u.id), { enabled: u.enabled === false }, { merge: true });
  }

  async function savePermissions(u: ManagedUser) {
    await setDoc(doc(db, "users", u.id), {
      permissions: u.permissions || blankPermissions(),
      role: u.role || "attendance",
      name: u.name || "",
      enabled: u.enabled !== false,
    }, { merge: true });
    setMsg(`${u.email || u.id} ki permissions save ho gayi.`);
  }

  async function removeProfile(u: ManagedUser) {
    if (!confirm("Is user ka profile record delete karna hai? Firebase Login account delete nahi hoga; pehle user ko disable karna safer hai.")) return;
    await deleteDoc(doc(db, "users", u.id));
  }

  return (
    <main style={{ padding: 28, background: "#f6f9ff", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <div style={{ color: "#2eaa69", fontWeight: 900, letterSpacing: 2, fontSize: 12 }}>ADMIN PANEL</div>
          <h1 style={{ margin: "7px 0", color: "#092f6c" }}>Users & Permissions</h1>
          <p style={{ color: "#66778b", margin: 0 }}>User ID, password, role aur module permissions yahin se manage karo.</p>
        </div>
        <div style={{ background: "#fff", padding: "12px 18px", borderRadius: 12, border: "1px solid #dce6f0", fontWeight: 800 }}>
          Active Users: {activeCount}
        </div>
      </div>

      <section style={{ background: "#fff", border: "1px solid #dce6f0", borderRadius: 16, padding: 22, marginBottom: 22 }}>
        <h2 style={{ marginTop: 0, color: "#123e76", display: "flex", alignItems: "center", gap: 8 }}>
          <UserPlus size={20} /> Create New User
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={inputStyle} />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="User ID / Email" type="email" style={inputStyle} />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6)" type="password" style={inputStyle} />
          <select value={role} onChange={e => setRole(e.target.value as UserRole)} style={inputStyle}>
            <option value="attendance">Attendance</option>
            <option value="stock">Stock</option>
            <option value="accounts">Accounts</option>
            <option value="bill">Bill / Tax Invoice</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b style={{ color: "#294c70" }}>Permissions</b>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => selectAll(true)} style={smallBtn}>Select All</button>
              <button onClick={() => selectAll(false)} style={smallBtn}>Clear All</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 10 }}>
            {modules.map(([key, label]) => (
              <label key={key} style={checkStyle}>
                <input type="checkbox" checked={!!permissions[key]} onChange={() => togglePermission(key)} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {err && <p style={{ color: "#c0392b", fontWeight: 700 }}>{err}</p>}
        {msg && <p style={{ color: "#168246", fontWeight: 700 }}>{msg}</p>}

        <button onClick={createUser} disabled={saving} style={primaryBtn}>
          <UserPlus size={17} /> {saving ? "Creating..." : "Create User"}
        </button>
      </section>

      <section style={{ background: "#fff", border: "1px solid #dce6f0", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: 18, background: "#f3f7fb", display: "flex", alignItems: "center", gap: 9 }}>
          <ShieldCheck size={19} color="#123e76" />
          <b style={{ color: "#123e76" }}>Existing Users</b>
        </div>

        {users.length === 0 && <div style={{ padding: 28, color: "#77899b" }}>Abhi koi managed user nahi hai.</div>}

        {users.map(u => (
          <div key={u.id} style={{ padding: 18, borderTop: "1px solid #edf2f7" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr .7fr .8fr auto", gap: 14, alignItems: "center" }}>
              <div>
                <b style={{ color: "#173f6d" }}>{u.name || "Unnamed User"}</b>
                <div style={{ fontSize: 12, color: "#6c7e91", marginTop: 4 }}>{u.email || u.id}</div>
                <div style={{ fontSize: 11, color: "#9aa7b5", marginTop: 3 }}>{u.id}</div>
              </div>

              <select value={u.role || "attendance"} onChange={e => {
                const value = e.target.value as UserRole;
                setUsers(list => list.map(x => x.id === u.id ? { ...x, role: value } : x));
              }} style={inputStyle}>
                <option value="attendance">Attendance</option>
                <option value="stock">Stock</option>
                <option value="accounts">Accounts</option>
                <option value="bill">Bill / Tax Invoice</option>
                <option value="admin">Admin</option>
              </select>

              <button onClick={() => toggleEnabled(u)} style={{ ...smallBtn, background: u.enabled === false ? "#e9f8ef" : "#fff1f1", color: u.enabled === false ? "#168246" : "#c0392b" }}>
                <Power size={14} /> {u.enabled === false ? "Enable" : "Disable"}
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => savePermissions(u)} style={smallBtn}><Save size={14} /> Save</button>
                <button onClick={() => removeProfile(u)} style={{ ...smallBtn, color: "#c0392b" }}><Trash2 size={14} /></button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 13 }}>
              {modules.map(([key, label]) => (
                <label key={key} style={checkStyle}>
                  <input
                    type="checkbox"
                    checked={!!u.permissions?.[key]}
                    onChange={e => {
                      const checked = e.target.checked;
                      setUsers(list => list.map(x => x.id === u.id ? {
                        ...x,
                        permissions: { ...(x.permissions || {}), [key]: checked }
                      } : x));
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "11px 12px",
  border: "1px solid #d5e0ea", borderRadius: 9, background: "#fff", color: "#1f3d59"
};

const primaryBtn: React.CSSProperties = {
  marginTop: 18, border: 0, borderRadius: 10, padding: "11px 17px",
  background: "#0d63d7", color: "#fff", fontWeight: 900, cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 8
};

const smallBtn: React.CSSProperties = {
  border: "1px solid #d5e0ea", borderRadius: 8, padding: "8px 10px",
  background: "#fff", color: "#274765", fontWeight: 800, cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 5
};

const checkStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 7, padding: "8px 9px",
  border: "1px solid #e3eaf1", borderRadius: 8, color: "#405b73", fontSize: 12
};

export default function AdminUsersPage() {
  return <AuthGuard allowedRoles={["admin"]}><UsersPanel /></AuthGuard>;
}
