 "use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Package, Plus, Trash2 } from "lucide-react";

type StockItem = {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  note?: string;
};

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "stock"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      s => setItems(s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<StockItem, "id">) }))),
      e => setError(e.message)
    );
  }, []);

  const total = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.quantity || 0) * Number(x.rate || 0), 0),
    [items]
  );

  async function save() {
    setMessage("");
    setError("");
    if (!name.trim()) return setError("Item name dalo.");
    if (Number(quantity) <= 0) return setError("Valid quantity dalo.");
    if (Number(rate) < 0) return setError("Valid rate dalo.");

    setSaving(true);
    try {
      await addDoc(collection(db, "stock"), {
        name: name.trim(),
        quantity: Number(quantity),
        rate: Number(rate),
        note: note.trim(),
        createdAt: serverTimestamp()
      });
      setName("");
      setQuantity("");
      setRate("");
      setNote("");
      setMessage("Stock saved.");
    } catch (e: any) {
      setError(e?.message || "Stock save nahi hua.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteDoc(doc(db, "stock", id));
    } catch (e: any) {
      setError(e?.message || "Stock delete nahi hua.");
    }
  }

  return (
    <AuthGuard allowedRoles={["admin", "stock"]}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 28, background: "#f7faff" }}>
          <div style={{ maxWidth: 1050, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Package size={25} color="#0b4a91" />
              <div>
                <h1 style={{ margin: 0, color: "#082b68", fontSize: 30 }}>Stock Management</h1>
                <p style={{ margin: "6px 0 0", color: "#6d7d96" }}>
                  Stock item, quantity, rate aur total value manage karo.
                </p>
              </div>
            </div>

            <section style={{ marginTop: 22, padding: 18, background: "#fff", border: "1px solid #e5edf7", borderRadius: 14 }}>
              <h2 style={{ margin: "0 0 14px", color: "#17345f", fontSize: 18 }}>Add Stock</h2>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr auto", gap: 10 }}>
                <input className="input" placeholder="Item name" value={name} onChange={e => setName(e.target.value)} />
                <input className="input" type="number" min="0" placeholder="Qty" value={quantity} onChange={e => setQuantity(e.target.value)} />
                <input className="input" type="number" min="0" placeholder="Rate" value={rate} onChange={e => setRate(e.target.value)} />
                <input className="input" placeholder="Note" value={note} onChange={e => setNote(e.target.value)} />
                <button className="btn btn-primary" onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus size={16} /> Save
                </button>
              </div>
              {message && <div style={{ marginTop: 10, color: "#16824b", fontSize: 13 }}>{message}</div>}
              {error && <div style={{ marginTop: 10, color: "#c0392b", fontSize: 13 }}>{error}</div>}
            </section>

            <section style={{ marginTop: 18, padding: 18, background: "#fff", border: "1px solid #e5edf7", borderRadius: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, color: "#17345f", fontSize: 18 }}>Stock List</h2>
                <b style={{ color: "#17345f" }}>Total Value: ₹ {total.toLocaleString("en-IN")}</b>
              </div>

              <div style={{ overflowX: "auto", marginTop: 14 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f4f7fb", textAlign: "left" }}>
                      {["Item", "Quantity", "Rate", "Total", "Note", "Action"].map(h =>
                        <th key={h} style={{ padding: 10 }}>{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(x => (
                      <tr key={x.id} style={{ borderTop: "1px solid #e8eef5" }}>
                        <td style={{ padding: 10, fontWeight: 700 }}>{x.name}</td>
                        <td style={{ padding: 10 }}>{x.quantity}</td>
                        <td style={{ padding: 10 }}>₹ {Number(x.rate || 0).toLocaleString("en-IN")}</td>
                        <td style={{ padding: 10, fontWeight: 700 }}>₹ {(Number(x.quantity || 0) * Number(x.rate || 0)).toLocaleString("en-IN")}</td>
                        <td style={{ padding: 10, color: "#64748b" }}>{x.note || "—"}</td>
                        <td style={{ padding: 10 }}>
                          <button onClick={() => remove(x.id)} style={{ border: 0, background: "transparent", cursor: "pointer" }} title="Delete">
                            <Trash2 size={17} color="#c0392b" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!items.length && (
                      <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#71809a" }}>No stock items yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
