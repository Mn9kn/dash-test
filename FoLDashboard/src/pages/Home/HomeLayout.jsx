// HomeLayout.jsx
export default function HomeLayout({ children, isDashboard = false }) {
  return (
    <div
      className="dashboard-bg"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "url('/icons/skyline-bg.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Header */}
      <header className="header" style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#ffffffcc", backdropFilter: "blur(4px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img src="/kacst-logo-no-bg.png" alt="KACST Logo" style={{ height: "50px", width: "auto", mixBlendMode: "multiply" }} />
          <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: 0, color: "#004990" }}>Riyadh Dashboard</h1>
        </div>
      </header>

      {/* Page Content - عدلنا هنا عشان الداشبورد ياخذ المساحة كاملة */}
      <div style={{
        flex: 1,
        padding: isDashboard ? "1rem" : "1rem",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        backgroundColor: "transparent"
      }}>
        {children}
      </div>
    </div>
  );
}