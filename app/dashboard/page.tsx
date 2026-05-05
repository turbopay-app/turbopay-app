"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/"); return }
      setUser(session.user)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()
      if (profileData) setProfile(profileData)

      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5)
      setTransactions(txData || [])

    } catch (error) {
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingLogo}>T</div>
          <p style={styles.loadingText}>TurboPay</p>
          <div style={styles.spinner} />
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>T</div>
          <span style={styles.logoText}>TurboPay</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <section style={styles.greet}>
        <p style={styles.greetLabel}>Welcome back</p>
        <p style={styles.greetEmail}>{profile?.email || user?.email}</p>
      </section>

      <div style={styles.balanceCard} onClick={() => router.push("/bnpl")}>
        <p style={styles.balanceLabel}>BNPL Limit Available</p>
        <p style={styles.balanceAmount}>
          ₹{profile?.bnpl_limit?.toLocaleString() || "0"}
        </p>
        <p style={styles.balanceSub}>Tap to make a purchase →</p>
      </div>

      <div style={styles.pointsCard}>
        <div>
          <p style={styles.pointsLabel}>Reward Points</p>
          <p style={styles.pointsAmount}>
            {profile?.points?.toLocaleString() || "0"}
          </p>
        </div>
        <div style={styles.pointsIcon}>🎁</div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionTitle}>Recent Transactions</p>
          {transactions.length > 0 && (
            <span style={styles.sectionCount}>
              {transactions.length} purchase{transactions.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🛍️</p>
            <p style={styles.emptyText}>No purchases yet</p>
            <p style={styles.emptySub}>Tap the BNPL card above to make your first purchase</p>
          </div>
        ) : (
          <div style={styles.txList}>
            {transactions.map((tx) => (
              <div key={tx.id} style={styles.txCard}>
                <div style={styles.txLeft}>
                  <p style={styles.txMerchant}>{tx.merchant_name}</p>
                  <p style={styles.txMeta}>{tx.merchant_category} · {tx.installments} installments</p>
                  <p style={styles.txDate}>
                    {new Date(tx.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div style={styles.txRight}>
                  <p style={styles.txAmount}>₹{tx.amount.toLocaleString()}</p>
                  <p style={styles.txEMI}>₹{tx.installment_amount.toLocaleString()}/mo</p>
                  <span style={styles.txStatus}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.grid}>
        <div style={styles.tile} onClick={() => router.push("/bnpl")}>
          <span style={styles.tileIcon}>⚡</span>
          <span style={styles.tileLabel}>Buy Now Pay Later</span>
        </div>
        <div style={styles.tile}>
          <span style={styles.tileIcon}>🏪</span>
          <span style={styles.tileLabel}>Merchants</span>
          <span style={styles.soon}>Soon</span>
        </div>
        <div style={styles.tile}>
          <span style={styles.tileIcon}>📊</span>
          <span style={styles.tileLabel}>Analytics</span>
          <span style={styles.soon}>Soon</span>
        </div>
        <div style={styles.tile}>
          <span style={styles.tileIcon}>👤</span>
          <span style={styles.tileLabel}>Profile</span>
          <span style={styles.soon}>Soon</span>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0A0F0D",
    color: "#F0FFF8",
    padding: "1.25rem",
    maxWidth: "480px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
    paddingBottom: "3rem",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0A0F0D",
  },
  loadingContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  loadingLogo: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "#00C896",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1.8rem",
  },
  loadingText: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#F0FFF8",
    letterSpacing: "-0.02em",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "2px solid #1A211D",
    borderTop: "2px solid #00C896",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginTop: "8px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    paddingTop: "0.5rem",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logoIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: "#00C896",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  logoText: {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#F0FFF8",
    letterSpacing: "-0.02em",
  },
  logoutBtn: {
    background: "#1A211D",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#6B8C7A",
    padding: "0.4rem 0.9rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  greet: { marginBottom: "1.25rem" },
  greetLabel: {
    fontSize: "0.75rem",
    color: "#6B8C7A",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "4px",
  },
  greetEmail: {
    fontSize: "1rem",
    fontWeight: 500,
    color: "#F0FFF8",
  },
  balanceCard: {
    background: "#00C896",
    borderRadius: "14px",
    padding: "1.5rem",
    marginBottom: "1rem",
    cursor: "pointer",
  },
  balanceLabel: {
    fontSize: "0.75rem",
    color: "rgba(0,0,0,0.6)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  },
  balanceAmount: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#000",
    letterSpacing: "-0.03em",
    marginBottom: "4px",
  },
  balanceSub: { fontSize: "0.8rem", color: "rgba(0,0,0,0.55)" },
  pointsCard: {
    background: "#111714",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "1.25rem 1.5rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pointsLabel: {
    fontSize: "0.75rem",
    color: "#6B8C7A",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "4px",
  },
  pointsAmount: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#F0FFF8",
  },
  pointsIcon: { fontSize: "2rem" },
  section: { marginBottom: "1.5rem" },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
  },
  sectionTitle: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#F0FFF8",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  sectionCount: { fontSize: "0.75rem", color: "#6B8C7A" },
  emptyState: {
    background: "#111714",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "2rem",
    textAlign: "center",
  },
  emptyIcon: { fontSize: "2rem", marginBottom: "0.5rem" },
  emptyText: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#F0FFF8",
    marginBottom: "0.3rem",
  },
  emptySub: { fontSize: "0.8rem", color: "#6B8C7A" },
  txList: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  txCard: {
    background: "#111714",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  txLeft: { display: "flex", flexDirection: "column", gap: "3px" },
  txMerchant: { fontSize: "0.9rem", fontWeight: 600, color: "#F0FFF8" },
  txMeta: { fontSize: "0.75rem", color: "#6B8C7A" },
  txDate: { fontSize: "0.7rem", color: "#6B8C7A", marginTop: "2px" },
  txRight: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    alignItems: "flex-end",
  },
  txAmount: { fontSize: "0.95rem", fontWeight: 700, color: "#F0FFF8" },
  txEMI: { fontSize: "0.75rem", color: "#00C896" },
  txStatus: {
    fontSize: "0.65rem",
    fontWeight: 600,
    color: "#00C896",
    background: "rgba(0,200,150,0.1)",
    padding: "2px 8px",
    borderRadius: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginTop: "2px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  tile: {
    background: "#111714",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "1.25rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    position: "relative",
    cursor: "pointer",
  },
  tileIcon: { fontSize: "1.4rem" },
  tileLabel: { fontSize: "0.85rem", fontWeight: 500, color: "#F0FFF8" },
  soon: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#1A211D",
    color: "#6B8C7A",
    fontSize: "0.65rem",
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: "5px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
}