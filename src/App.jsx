import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Users, GraduationCap, ClipboardCheck, BookOpen,
  Megaphone, Settings, Search, Bell, Menu, X, Plus, Trash2,
  CalendarDays, TrendingUp, School, LogOut, ShieldCheck, UserRound
} from "lucide-react";
import api from "./api";

const initialStudents = [
  { id: 1, name: "Aarav Sharma", rollNumber: "STU1001", className: "10-A", email: "aarav@example.com" },
  { id: 2, name: "Ananya Reddy", rollNumber: "STU1002", className: "10-A", email: "ananya@example.com" },
  { id: 3, name: "Rahul Kumar", rollNumber: "STU1003", className: "9-B", email: "rahul@example.com" },
];
const initialTeachers = [
  { id: 1, name: "Priya Sharma", employeeId: "TCH2001", subject: "Mathematics", email: "priya@school.edu" },
  { id: 2, name: "Arjun Rao", employeeId: "TCH2002", subject: "Science", email: "arjun@school.edu" },
];
const initialAnnouncements = [
  { id: 1, title: "Mid-term examinations", message: "Mid-term examinations begin next Monday. Please check the timetable.", createdAt: "2026-10-10" },
  { id: 2, title: "School holiday", message: "The school will remain closed on the announced public holiday.", createdAt: "2026-10-08" },
];

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: GraduationCap, roles: ["Admin", "Teacher"] },
  { id: "teachers", label: "Teachers", icon: Users, roles: ["Admin"] },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck, roles: ["Admin", "Teacher", "Student"] },
  { id: "marks", label: "Marks & Results", icon: BookOpen, roles: ["Admin", "Teacher", "Student"] },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

export default function App() {
  const [role, setRole] = useState("Admin");
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState(initialStudents);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [apiStatus, setApiStatus] = useState("Checking backend…");
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: "", rollNumber: "", className: "", email: "" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    api.get("/students")
      .then((res) => { if (mounted) { if (Array.isArray(res.data)) setStudents(res.data.map(normalizeStudent)); setApiStatus("Backend connected"); } })
      .catch(() => { if (mounted) setApiStatus("Demo data · backend offline"); });
    api.get("/teachers")
      .then((res) => { if (mounted && Array.isArray(res.data)) setTeachers(res.data.map(normalizeTeacher)); })
      .catch(() => {});
    api.get("/announcements")
      .then((res) => { if (mounted && Array.isArray(res.data)) setAnnouncements(res.data.map(normalizeAnnouncement)); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  function normalizeStudent(s) {
    return { id: s.id, name: s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim(), rollNumber: s.rollNumber || s.admissionNumber || "—", className: s.className || s.classRoom?.name || "—", email: s.email || "—" };
  }
  function normalizeTeacher(t) {
    return { id: t.id, name: t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim(), employeeId: t.employeeId || "—", subject: t.subject || t.specialization || "—", email: t.email || "—" };
  }
  function normalizeAnnouncement(a) {
    return { id: a.id, title: a.title, message: a.message || a.content || "", createdAt: a.createdAt ? String(a.createdAt).slice(0, 10) : "Recently" };
  }

  const visibleNav = navItems.filter((item) => !item.roles || item.roles.includes(role));
  const filteredStudents = useMemo(() => students.filter((s) => `${s.name} ${s.rollNumber} ${s.className}`.toLowerCase().includes(search.toLowerCase())), [students, search]);
  const pageTitle = visibleNav.find((item) => item.id === active)?.label || "Overview";

  async function addStudent(e) {
    e.preventDefault();
    const payload = { ...studentForm };
    try {
      const response = await api.post("/students", payload);
      setStudents((prev) => [...prev, normalizeStudent(response.data)]);
      setApiStatus("Backend connected");
    } catch {
      setStudents((prev) => [...prev, { ...payload, id: Date.now() }]);
      setNotice("Saved in this demo session only. Start the backend to save to MySQL.");
    }
    setStudentForm({ name: "", rollNumber: "", className: "", email: "" });
    setShowStudentForm(false);
  }

  async function deleteStudent(student) {
    try {
      await api.delete(`/students/${student.id}`);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setNotice("Student deleted.");
    } catch {
      setNotice("Could not delete from backend. The record was kept.");
    }
  }

  function renderContent() {
    if (active === "students") return <StudentsPage students={filteredStudents} search={search} setSearch={setSearch} onAdd={() => setShowStudentForm(true)} onDelete={deleteStudent} role={role} />;
    if (active === "teachers") return <TeachersPage teachers={teachers} />;
    if (active === "attendance") return <AttendancePage role={role} />;
    if (active === "marks") return <MarksPage role={role} />;
    if (active === "announcements") return <AnnouncementsPage announcements={announcements} role={role} />;
    return <Overview students={students} teachers={teachers} announcements={announcements} setActive={setActive} role={role} />;
  }

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><School size={23} /></div>
          <div><strong>EduManage</strong><span>School portal</span></div>
          <button className="icon-button close-menu" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="school-chip"><div className="school-avatar">ES</div><div><b>Evergreen School</b><small>Academic year 2026–27</small></div></div>
        <p className="nav-caption">WORKSPACE</p>
        <nav className="nav-list">
          {visibleNav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${active === id ? "active" : ""}`} onClick={() => { setActive(id); setMobileOpen(false); }}>
              <Icon size={18} strokeWidth={1.9} /><span>{label}</span>{id === "announcements" && <span className="nav-count">{announcements.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><ShieldCheck size={18} /></div><b>Need assistance?</b><p>Contact your school administrator for support.</p></div>
          <button className="nav-item"><Settings size={18} /><span>Settings</span></button>
          <div className="profile-mini"><div className="profile-avatar"><UserRound size={18} /></div><div className="profile-details"><b>{role} User</b><small>{role.toLowerCase()}@school.edu</small></div><button className="icon-button" title="Demo role selector" onClick={() => setRole(role === "Admin" ? "Teacher" : role === "Teacher" ? "Student" : "Admin")}><LogOut size={16} /></button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20} /></button><div><div className="breadcrumbs">Workspace <span>/</span> {pageTitle}</div><h1>{pageTitle}</h1></div></div>
          <div className="topbar-actions">
            <div className={`connection-pill ${apiStatus.includes("connected") ? "online" : ""}`}><span className="status-dot" />{apiStatus}</div>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <div className="top-user"><div className="profile-avatar"><UserRound size={17} /></div><div><b>{role} User</b><small>{role}</small></div></div>
          </div>
        </header>
        {notice && <div className="notice-banner">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
        <div className="page-content">{renderContent()}</div>
        <footer className="footer">© 2026 EduManage <span>Built for better school administration</span></footer>
      </main>

      {showStudentForm && <div className="modal-backdrop" onClick={() => setShowStudentForm(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-heading"><div><h2>Add student</h2><p>Enter the student's basic details.</p></div><button className="icon-button" onClick={() => setShowStudentForm(false)}><X size={18} /></button></div><form onSubmit={addStudent} className="student-form">{[["name","Full name"],["rollNumber","Roll number"],["className","Class"],["email","Email address"]].map(([key,label]) => <label key={key}>{label}<input required value={studentForm[key]} type={key === "email" ? "email" : "text"} onChange={(e) => setStudentForm({ ...studentForm, [key]: e.target.value })} placeholder={label} /></label>)}<div className="form-actions"><button type="button" className="button secondary" onClick={() => setShowStudentForm(false)}>Cancel</button><button className="button primary" type="submit">Add student</button></div></form></div></div>}
    </div>
  );
}

function Overview({ students, teachers, announcements, setActive, role }) {
  const stats = [
    { label: "Total students", value: students.length.toLocaleString(), delta: "Registered learners", icon: GraduationCap, tint: "purple" },
    { label: "Teaching staff", value: teachers.length.toLocaleString(), delta: "Active teachers", icon: Users, tint: "blue" },
    { label: "Attendance rate", value: "94.8%", delta: "Across all classes", icon: ClipboardCheck, tint: "green" },
    { label: "Announcements", value: announcements.length.toString(), delta: "School updates", icon: Megaphone, tint: "orange" },
  ];
  return <>
    <section className="welcome-banner"><div className="welcome-copy"><span className="eyebrow">MONDAY, OCTOBER 12, 2026</span><h2>Welcome back, {role}!</h2><p>Here’s what’s happening at your school today. Let’s make it a productive day.</p><button className="button welcome-button" onClick={() => setActive(role === "Student" ? "attendance" : "students")}>{role === "Student" ? "View my attendance" : "Manage students"} <span>→</span></button></div><div className="welcome-illustration"><div className="illustration-sun" /><div className="illustration-building"><div className="roof" /><div className="building-body"><div className="building-window-grid"><i/><i/><i/><i/><i/><i/></div><div className="building-door"/></div></div><div className="illustration-tree tree-one"/><div className="illustration-tree tree-two"/><div className="illustration-ground"/></div></section>
    <div className="section-heading"><div><h2>School at a glance</h2><p>Quick overview of key school metrics</p></div><span className="period-chip"><CalendarDays size={14}/> This academic year</span></div>
    <div className="stats-grid">{stats.map(({label,value,delta,icon:Icon,tint}) => <div className="stat-card" key={label}><div className={`stat-icon ${tint}`}><Icon size={20}/></div><span className="stat-label">{label}</span><div className="stat-value">{value}</div><div className="stat-bottom"><span className="stat-delta"><TrendingUp size={13}/>{delta}</span></div></div>)}</div>
    <div className="content-grid"><section className="panel"><div className="panel-heading"><div><h3>Recent students</h3><p>Recently listed students</p></div><button className="text-button" onClick={() => setActive("students")}>View all <span>→</span></button></div><div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>ROLL NO.</th><th>CLASS</th><th>STATUS</th></tr></thead><tbody>{students.slice(0,4).map((s,i)=><tr key={s.id}><td><div className="person-cell"><div className={`initial-avatar avatar-${i%4}`}>{(s.name||"S").split(" ").map(x=>x[0]).slice(0,2).join("")}</div><b>{s.name}</b></div></td><td>{s.rollNumber}</td><td>{s.className}</td><td><span className="status-badge">Active</span></td></tr>)}</tbody></table></div></section><section className="panel announcement-panel"><div className="panel-heading"><div><h3>Latest announcements</h3><p>Important school updates</p></div><button className="icon-button" onClick={() => setActive("announcements")} aria-label="View announcements">→</button></div><div className="announcement-list">{announcements.slice(0,3).map((a,i)=><div className="announcement-item" key={a.id}><div className={`announcement-icon ann-${i%3}`}><Megaphone size={17}/></div><div><b>{a.title}</b><p>{a.message}</p><small>{a.createdAt}</small></div></div>)}</div></section></div>
  </>;
}

function StudentsPage({ students, search, setSearch, onAdd, onDelete, role }) {
  return <><div className="section-heading page-intro"><div><h2>Student directory</h2><p>Manage student records and class information.</p></div>{role === "Admin" && <button className="button primary" onClick={onAdd}><Plus size={17}/> Add student</button>}</div><section className="panel"><div className="table-toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students by name, roll no. or class…"/></div><span className="result-count">{students.length} students</span></div><div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>ROLL NUMBER</th><th>CLASS</th><th>EMAIL</th>{role==="Admin"&&<th>ACTION</th>}</tr></thead><tbody>{students.map((s,i)=><tr key={s.id}><td><div className="person-cell"><div className={`initial-avatar avatar-${i%4}`}>{(s.name||"S").split(" ").map(x=>x[0]).slice(0,2).join("")}</div><b>{s.name}</b></div></td><td>{s.rollNumber}</td><td><span className="class-chip">{s.className}</span></td><td>{s.email}</td>{role==="Admin"&&<td><button className="icon-button danger-icon" title="Delete student" onClick={()=>onDelete(s)}><Trash2 size={16}/></button></td>}</tr>)}</tbody></table>{students.length===0&&<div className="empty-state">No students found. Try another search.</div>}</div></section></>;
}

function TeachersPage({ teachers }) {
  return <><div className="section-heading page-intro"><div><h2>Teaching staff</h2><p>Browse teacher profiles and assigned subjects.</p></div></div><section className="panel"><div className="table-wrap"><table><thead><tr><th>TEACHER</th><th>EMPLOYEE ID</th><th>SUBJECT</th><th>EMAIL</th><th>STATUS</th></tr></thead><tbody>{teachers.map((t,i)=><tr key={t.id}><td><div className="person-cell"><div className={`initial-avatar avatar-${i%4}`}>{(t.name||"T").split(" ").map(x=>x[0]).slice(0,2).join("")}</div><b>{t.name}</b></div></td><td>{t.employeeId}</td><td>{t.subject}</td><td>{t.email}</td><td><span className="status-badge">Active</span></td></tr>)}</tbody></table></div></section></>;
}

function AttendancePage({ role }) {
  const rows = [{name:"Aarav Sharma",roll:"STU1001",className:"10-A",status:"Present"},{name:"Ananya Reddy",roll:"STU1002",className:"10-A",status:"Present"},{name:"Rahul Kumar",roll:"STU1003",className:"9-B",status:"Absent"},{name:"Diya Patel",roll:"STU1004",className:"9-B",status:"Present"}];
  return <><div className="section-heading page-intro"><div><h2>{role==="Student"?"My attendance":"Attendance management"}</h2><p>Track daily attendance and monitor class participation.</p></div><span className="period-chip"><CalendarDays size={14}/> October 2026</span></div><div className="stats-grid compact-stats"><div className="stat-card"><span className="stat-label">Attendance rate</span><div className="stat-value">94.8%</div><span className="stat-delta">↑ 2.4% this month</span></div><div className="stat-card"><span className="stat-label">Present today</span><div className="stat-value">428</div><span className="muted-text">Across all classes</span></div><div className="stat-card"><span className="stat-label">Absent today</span><div className="stat-value">23</div><span className="muted-text">Requires follow-up</span></div></div><section className="panel"><div className="panel-heading"><div><h3>Today's attendance</h3><p>Monday, October 12, 2026</p></div>{role!=="Student"&&<button className="button primary" onClick={()=>window.alert("Connect the attendance API to save attendance records.")}>Save attendance</button>}</div><div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>ROLL NUMBER</th><th>CLASS</th><th>STATUS</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.roll}><td><div className="person-cell"><div className={`initial-avatar avatar-${i%4}`}>{r.name.split(" ").map(x=>x[0]).join("")}</div><b>{r.name}</b></div></td><td>{r.roll}</td><td>{r.className}</td><td><span className={`attendance-status ${r.status==="Present"?"present":"absent"}`}>{r.status}</span></td></tr>)}</tbody></table></div></section></>;
}

function MarksPage({ role }) {
  const rows = [{name:"Aarav Sharma",roll:"STU1001",math:92,science:88,english:85},{name:"Ananya Reddy",roll:"STU1002",math:96,science:91,english:94},{name:"Rahul Kumar",roll:"STU1003",math:78,science:82,english:80}];
  return <><div className="section-heading page-intro"><div><h2>{role==="Student"?"My marks & results":"Marks & results"}</h2><p>Review examination performance and subject-wise scores.</p></div><span className="period-chip">Mid-term · 2026</span></div><section className="panel"><div className="panel-heading"><div><h3>Mid-term examination</h3><p>Subject-wise marks out of 100</p></div></div><div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>ROLL NUMBER</th><th>MATHEMATICS</th><th>SCIENCE</th><th>ENGLISH</th><th>AVERAGE</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.roll}><td><div className="person-cell"><div className={`initial-avatar avatar-${i%4}`}>{r.name.split(" ").map(x=>x[0]).join("")}</div><b>{r.name}</b></div></td><td>{r.roll}</td><td>{r.math}</td><td>{r.science}</td><td>{r.english}</td><td><b>{Math.round((r.math+r.science+r.english)/3)}%</b></td></tr>)}</tbody></table></div><p className="table-note">Sample results are displayed for UI preview. Connect the marks API for live database results.</p></section></>;
}

function AnnouncementsPage({ announcements, role }) {
  return <><div className="section-heading page-intro"><div><h2>Announcements</h2><p>Stay informed about school events and important updates.</p></div>{role==="Admin"&&<button className="button primary" onClick={()=>window.alert("Announcement creation form can be connected to POST /api/announcements.")}><Plus size={17}/> New announcement</button>}</div><div className="announcement-cards">{announcements.map((a,i)=><article className="panel announcement-card" key={a.id}><div className={`announcement-icon ann-${i%3}`}><Megaphone size={19}/></div><div className="announcement-card-content"><div className="announcement-meta">{a.createdAt} <span>·</span> School notice</div><h3>{a.title}</h3><p>{a.message}</p></div></article>)}</div></>;
}