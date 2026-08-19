import Link from "next/link";
import { Users, UserRoundCheck, UserRoundX, WalletCards, ReceiptIndianRupee, UserPlus, CalendarCheck, PackagePlus, FileText, ArrowUpRight, Bell, Building2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";
import styles from "./dashboard.module.css";

const stats=[
 {label:"Total Labour",value:"124",icon:Users,trend:"Active workforce"},
 {label:"Present Today",value:"98",icon:UserRoundCheck,trend:"79% attendance"},
 {label:"Absent Today",value:"26",icon:UserRoundX,trend:"Needs attention"},
 {label:"Total Staff",value:"18",icon:Building2,trend:"Office & support"},
 {label:"Monthly Expense",value:"₹1,40,950",icon:ReceiptIndianRupee,trend:"Current month"},
];
const months=[55,72,48,84,68,92,78,64,88,70,96,82];
export default function Dashboard(){return <AuthGuard requiredPermission="dashboard"><div className={styles.page}><div className={styles.shell}><Sidebar/><main className={styles.main}>
 <header className={styles.top}><div><div className={styles.eyebrow}>Shivansh Machinery Co. (L.L.P.)</div><h1 className={styles.title}>Admin Dashboard</h1><p className={styles.subtitle}>Good morning. Here’s your business overview.</p></div><div><div className={styles.date}>Friday, 14 August 2026</div><div style={{marginTop:10,textAlign:"right"}}><LogoutButton/></div></div></header>
 <section className={styles.cards}>{stats.map(s=>{const I=s.icon;return <div className={styles.card} key={s.label}><div className={styles.cardTop}><span className={styles.label}>{s.label}</span><span className={styles.icon}><I size={20}/></span></div><h2 className={styles.value}>{s.value}</h2><span className={styles.trend}>{s.trend}</span></div>})}</section>
 <section className={styles.grid}><div className={styles.panel}><div className={styles.panelHead}><div><h3>Monthly Expenses</h3><span className={styles.muted}>Expense overview</span></div><WalletCards size={20}/></div><div className={styles.bars}>{months.map((v,i)=><div className={styles.barWrap} key={i}><div style={{width:"100%"}}><div className={styles.bar} style={{height:`${v}%`}}></div><div className={styles.barLabel}>{["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"][i]}</div></div></div>)}</div></div>
 <div className={styles.panel}><div className={styles.panelHead}><div><h3>Quick Actions</h3><span className={styles.muted}>Frequently used</span></div><ArrowUpRight size={19}/></div><div className={styles.quick}><Link href="/labour"><UserPlus size={17}/> Add Labour</Link><Link href="/attendance"><CalendarCheck size={17}/> Attendance</Link><Link href="#"><PackagePlus size={17}/> Add Stock</Link><Link href="#"><ReceiptIndianRupee size={17}/> Add Expense</Link><Link href="#"><FileText size={17}/> Reports</Link><Link href="/staff"><Users size={17}/> Staff</Link></div></div></section>
 <section className={styles.grid}><div className={styles.panel}><div className={styles.panelHead}><div><h3>Recent Activity</h3><span className={styles.muted}>Latest office updates</span></div><Bell size={19}/></div><div className={styles.activity}><div className={styles.activityItem}><span className={styles.dot}></span><div><b>98 labour marked present</b><span>Today · Attendance</span></div></div><div className={styles.activityItem}><span className={styles.dot}></span><div><b>Monthly expense updated</b><span>Today · Expenses</span></div></div><div className={styles.activityItem}><span className={styles.dot}></span><div><b>Labour records ready</b><span>Management system</span></div></div></div></div><div className={styles.panel}><div className={styles.panelHead}><div><h3>Attendance Summary</h3><span className={styles.muted}>Today</span></div><CalendarCheck size={19}/></div><div style={{fontSize:42,fontWeight:900,color:"#0a3472",margin:"16px 0 4px"}}>79%</div><div className={styles.muted}>98 present out of 124 labour</div><div style={{height:10,borderRadius:8,background:"#e8eef5",marginTop:18,overflow:"hidden"}}><div style={{width:"79%",height:"100%",borderRadius:8,background:"#2fa56b"}}/></div></div></section>
 <div className={styles.notice}><div><b>Keep your records up to date</b><br/><span>Add new labour, attendance and expenses regularly for accurate reports.</span></div><Link href="/labour">Manage Labour <ArrowUpRight size={14} style={{verticalAlign:"middle"}}/></Link></div>
 </main></div></div></AuthGuard>}
