 "use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Labour = {
  name: string;
  id: string;
  inTime: string;
  outTime: string;
  work: string;
  ot: string;
  absent?: boolean;
};

const initialLabour: Labour[] = [
  { name: "Rahul Kumar", id: "L-102", inTime: "09:05 AM", outTime: "05:42 PM", work: "8h 37m", ot: "+12m OT" },
  { name: "Mohan Singh", id: "L-103", inTime: "08:58 AM", outTime: "05:30 PM", work: "8h 32m", ot: "+2m OT" },
  { name: "Suresh Yadav", id: "L-104", inTime: "09:10 AM", outTime: "05:45 PM", work: "8h 35m", ot: "+15m OT" },
  { name: "Ramesh Chand", id: "L-105", inTime: "", outTime: "", work: "Absent", ot: "", absent: true }
];

function nowTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

export default function Attendance() {
  const [labour, setLabour] = useState(initialLabour);
  const [message, setMessage] = useState("");

  const update = (id: string, field: "inTime" | "outTime") => {
    const time = nowTime();
    setLabour(prev =>
      prev.map(x =>
        x.id === id
          ? { ...x, [field]: time, absent: false, work: "Working" }
          : x
      )
    );
    setMessage("");
  };

  const save = async (person: Labour) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await setDoc(doc(db, "attendance", `${today}_${person.id}`), {
        labourId: person.id,
        name: person.name,
        date: today,
        inTime: person.inTime,
        outTime: person.outTime,
        work: person.work,
        ot: person.ot,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setMessage(`${person.name} attendance saved successfully.`);
    } catch (error: any) {
      setMessage(error?.code || "Attendance save failed");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 30 }}>
        <h1>Labour Attendance</h1>
        <p style={{ color: "#667085" }}>
          Attendance access only — confidential salary details are hidden.
        </p>

        {message && (
          <div style={{
            margin: "15px 0", padding: 12, borderRadius: 10,
            background: "#eef6ff", color: "#1266e8", fontWeight: 700
          }}>
            {message}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, margin: "20px 0", flexWrap: "wrap" }}>
          <input className="input" style={{ maxWidth: 210 }} type="date" />
          <input className="input" style={{ maxWidth: 420 }} placeholder="Search by name or Labour ID" />
          <button type="button" className="btn btn-primary">Bulk Actions</button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
          gap: 16
        }}>
          {labour.map(person => (
            <div className="card" style={{ padding: 18 }} key={person.id}>
              <h3 style={{ marginTop: 0 }}>👷 {person.name}</h3>
              <small>ID: {person.id}</small>

              {person.absent ? (
                <div style={{
                  padding: "35px 0", textAlign: "center",
                  color: "#e53935", fontWeight: 800
                }}>
                  🔴 ABSENT
                </div>
              ) : (
                <>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginTop: 15
                  }}>
                    <input className="input" value={person.inTime} readOnly />
                    <input className="input" value={person.outTime} readOnly />
                  </div>
                  <p>
                    🕘 Working: {person.work}
                    <b style={{ float: "right", color: "#139b57" }}>{person.ot}</b>
                  </p>
                </>
              )}

              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <button type="button" className="btn"
                  onClick={() => update(person.id, "inTime")}>
                  IN NOW
                </button>
                <button type="button" className="btn"
                  onClick={() => update(person.id, "outTime")}>
                  OUT NOW
                </button>
                <button type="button" className="btn btn-primary"
                  onClick={() => save(person)}>
                  SAVE
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
