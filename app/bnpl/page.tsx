"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

const MERCHANTS = [
  { name: "Bharat Farms", category: "Food & Grocery", icon: "🌾" },
  { name: "Desi Threads", category: "Fashion", icon: "👗" },
  { name: "Glow Naturals", category: "Beauty", icon: "✨" },
  { name: "TechNest", category: "Electronics", icon: "📱" },
  { name: "HomeRoots", category: "Home & Living", icon: "🏠" },
  { name: "FitIndia", category: "Health & Fitness", icon: "💪" },
]

const PLANS = [
  { months: 3, label: "Pay in 3", sublabel: "Most popular" },
  { months: 6, label: "Pay in 6", sublabel: "Balanced" },
  { months: 12, label: "Pay in 12", sublabel: "Easy on wallet" },
]

type Step = "form" | "confirm" | "success"

export default function BNPLPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  const [amount, setAmount] = useState("")
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<any>(PLANS[0])
  const [error, setError] = useState("")

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push("/"); return }
    setUser(session.user)

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    setProfile(data)
    setLoading(false)
  }

  const installmentAmount = amount
    ? Math.round(parseFloat(amount) / selectedPlan.months)
    : 0

  const handleProceed = () => {
    setError("")
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (parseFloat(amount) < 500) {
      setError("Minimum purchase amount is ₹500")
      return
    }
    if (!selectedMerchant) {
      setError("Please select a merchant")
      return
    }
    if (parseFloat(amount) > profile?.bnpl_limit) {
      setError(`Amount exceeds your BNPL limit of ₹${profile?.bnpl_limit?.toLocaleString()}`)
      return
    }
    setStep("confirm")
  }

  const handleConfirm = async () => {
    setBusy(true)
    setError("")

    const purchaseAmount = parseFloat(amount)
    const instAmount = Math.round(purchaseAmount / selectedPlan.months)

    // Create transaction
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        merchant_name: selectedMerchant.name,
        merchant_category: selectedMerchant.category,
        amount: purchaseAmount,
        installments: selectedPlan.months,
        installment_amount: instAmount,
        status: "active",
      })

    if (txError) {
      setError("Something went wrong. Please try again.")
      setBusy(false)
      return
    }

    // Deduct from BNPL limit
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ bnpl_limit: profile.bnpl_limit - purchaseAmount })
      .eq("id", user.id)

    if (profileError) {
      setError("Something went wrong. Please try again.")
      setBusy(false)
      return
    }

    setBusy(false)
    setStep("success")
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
      </div>
    )
  }

  // SUCCESS SCREEN
  if (step === "success") {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Purchase Approved!</h2>
          <p style={styles.successSub}>
            Your order at {selectedMerchant?.name} is confirmed
          </p>

          <div style={styles.successDetails}>
            <div style={styles.successRow}>
              <span style={styles.successLabel}>Total Amount</span>
              <span style={styles.successValue}>₹{parseFloat(amount).toLocaleString()}</span>
            </div>
            <div style={styles.successRow}>
              <span style={styles.successLabel}>Plan</span>
              <span style={styles.successValue}>{selectedPlan.label}</span>
            </div>
            <div style={styles.successRow}>
              <span style={styles.successLabel}>Monthly EMI</span>
              <span style={styles.successValue}>₹{installmentAmount.toLocaleString()}</span>
            </div>
            <div style={styles.successRow}>
              <span style={styles.successLabel}>First payment</span>
              <span style={styles.successValue}>30 days from now</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            style={styles.btn}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // CONFIRM SCREEN
  if (step === "confirm") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <button onClick={() => setStep("form")} style={styles.backBtn}>
            ← Back
          </button>

          <h2 style={styles.cardTitle}>Confirm Purchase</h2>
          <p style={styles.cardSub}>Review your order before confirming</p>

          <div style={styles.confirmBox}>
            <div style={styles.confirmRow}>
              <span style={styles.confirmLabel}>Merchant</span>
              <span style={styles.confirmValue}>
                {selectedMerchant?.icon} {selectedMerchant?.name}
              </span>
            </div>
            <div style={styles.divider} />
            <div style={styles.confirmRow}>
              <span style={styles.confirmLabel}>Purchase Amount</span>
              <span style={styles.confirmValue}>
                ₹{parseFloat(amount).toLocaleString()}
              </span>
            </div>
            <div style={styles.divider} />
            <div style={styles.confirmRow}>
              <span style={styles.confirmLabel}>Plan</span>
              <span style={styles.confirmValue}>{selectedPlan.label}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.confirmRow}>
              <span style={styles.confirmLabel}>Monthly EMI</span>
              <span style={{ ...styles.confirmValue, color: "#00C896", fontWeight: 700 }}>
                ₹{installmentAmount.toLocaleString()}
              </span>
            </div>
            <div style={styles.divider} />
            <div style={styles.confirmRow}>
              <span style={styles.confirmLabel}>Remaining Limit After</span>
              <span style={styles.confirmValue}>
                ₹{(profile?.bnpl_limit - parseFloat(amount)).toLocaleString()}
              </span>
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            onClick={handleConfirm}
            disabled={busy}
            style={styles.btn}
          >
            {busy ? "Processing..." : "Confirm & Buy Now →"}
          </button>

          <p style={styles.footerNote}>
            🔒 Secured by TurboPay. No interest charged.
          </p>
        </div>
      </div>
    )
  }

  // MAIN FORM
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => router.push("/dashboard")} style={styles.backBtn}>
          ← Back
        </button>
        <div style={styles.limitBadge}>
          Limit: ₹{profile?.bnpl_limit?.toLocaleString()}
        </div>
      </header>

      <h1 style={styles.pageTitle}>Buy Now Pay Later</h1>
      <p style={styles.pageSub}>Shop now, pay in easy installments</p>

      {/* Amount Input */}
      <div style={styles.section}>
        <label style={styles.label}>Purchase Amount</label>
        <div style={styles.amountRow}>
          <span style={styles.rupee}>₹</span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.amountInput}
          />
        </div>
        <p style={styles.hint}>Min ₹500 · Max ₹{profile?.bnpl_limit?.toLocaleString()}</p>
      </div>

      {/* Merchant Selection */}
      <div style={styles.section}>
        <label style={styles.label}>Select Merchant</label>
        <div style={styles.merchantGrid}>
          {MERCHANTS.map((m) => (
            <div
              key={m.name}
              onClick={() => setSelectedMerchant(m)}
              style={{
                ...styles.merchantTile,
                borderColor: selectedMerchant?.name === m.name
                  ? "#00C896"
                  : "rgba(255,255,255,0.08)",
                background: selectedMerchant?.name === m.name
                  ? "rgba(0,200,150,0.1)"
                  : "#1A211D",
              }}
            >
              <span style={styles.merchantIcon}>{m.icon}</span>
              <span style={styles.merchantName}>{m.name}</span>
              <span style={styles.merchantCat}>{m.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Selection */}
      <div style={styles.section}>
        <label style={styles.label}>Choose Your Plan</label>
        <div style={styles.planRow}>
          {PLANS.map((p) => (
            <div
              key={p.months}
              onClick={() => setSelectedPlan(p)}
              style={{
                ...styles.planTile,
                borderColor: selectedPlan.months === p.months
                  ? "#00C896"
                  : "rgba(255,255,255,0.08)",
                background: selectedPlan.months === p.months
                  ? "rgba(0,200,150,0.1)"
                  : "#1A211D",
              }}
            >
              <span style={styles.planLabel}>{p.label}</span>
              <span style={styles.planSub}>{p.sublabel}</span>
              {amount && (
                <span style={styles.planEMI}>
                  ₹{Math.ceil(parseFloat(amount) / p.months).toLocaleString()}/mo
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <button onClick={handleProceed} style={styles.btn}>
        Proceed to Confirm →
      </button>

      <p style={styles.footerNote}>
        🔒 No interest · No hidden charges · 100% digital
      </p>
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
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #1A211D",
    borderTop: "3px solid #00C896",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    paddingTop: "0.5rem",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#6B8C7A",
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: 0,
  },
  limitBadge: {
    background: "#1A211D",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "0.3rem 0.8rem",
    fontSize: "0.8rem",
    color: "#00C896",
    fontWeight: 600,
  },
  pageTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#F0FFF8",
    marginBottom: "0.3rem",
    letterSpacing: "-0.02em",
  },
  pageSub: {
    fontSize: "0.85rem",
    color: "#6B8C7A",
    marginBottom: "1.75rem",
  },
  section: {
    marginBottom: "1.75rem",
  },
  label: {
    display: "block",
    fontSize: "0.75rem",
    color: "#6B8C7A",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: "0.75rem",
  },
  amountRow: {
    display: "flex",
    alignItems: "center",
    background: "#111714",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "0.75rem 1rem",
  },
  rupee: {
    fontSize: "1.5rem",
    color: "#00C896",
    fontWeight: 700,
    marginRight: "0.5rem",
  },
  amountInput: {
    background: "none",
    border: "none",
    color: "#F0FFF8",
    fontSize: "1.5rem",
    fontWeight: 700,
    outline: "none",
    width: "100%",
  },
  hint: {
    fontSize: "0.75rem",
    color: "#6B8C7A",
    marginTop: "0.5rem",
  },
  merchantGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.6rem",
  },
  merchantTile: {
    border: "1px solid",
    borderRadius: "12px",
    padding: "0.85rem",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    transition: "all 0.15s",
  },
  merchantIcon: {
    fontSize: "1.3rem",
    marginBottom: "2px",
  },
  merchantName: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#F0FFF8",
  },
  merchantCat: {
    fontSize: "0.7rem",
    color: "#6B8C7A",
  },
  planRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "0.6rem",
  },
  planTile: {
    border: "1px solid",
    borderRadius: "12px",
    padding: "0.85rem 0.6rem",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    textAlign: "center",
    transition: "all 0.15s",
  },
  planLabel: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#F0FFF8",
  },
  planSub: {
    fontSize: "0.65rem",
    color: "#6B8C7A",
  },
  planEMI: {
    fontSize: "0.75rem",
    color: "#00C896",
    fontWeight: 600,
    marginTop: "4px",
  },
  btn: {
    width: "100%",
    padding: "0.95rem",
    background: "#00C896",
    color: "#000",
    border: "none",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  errorBox: {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px solid #FF5A5A",
    color: "#FF5A5A",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },
  footerNote: {
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#6B8C7A",
    marginTop: "1rem",
  },
  card: {
    background: "#111714",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "1.75rem",
    marginTop: "1rem",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#F0FFF8",
    marginBottom: "0.3rem",
    marginTop: "1rem",
  },
  cardSub: {
    fontSize: "0.85rem",
    color: "#6B8C7A",
    marginBottom: "1.5rem",
  },
  confirmBox: {
    background: "#0A0F0D",
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "1.5rem",
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.6rem 0",
  },
  confirmLabel: {
    fontSize: "0.85rem",
    color: "#6B8C7A",
  },
  confirmValue: {
    fontSize: "0.85rem",
    color: "#F0FFF8",
    fontWeight: 500,
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.05)",
  },
  successCard: {
    background: "#111714",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "2rem 1.75rem",
    marginTop: "2rem",
    textAlign: "center",
  },
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#00C896",
    color: "#000",
    fontSize: "1.8rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.25rem",
  },
  successTitle: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#F0FFF8",
    marginBottom: "0.4rem",
  },
  successSub: {
    fontSize: "0.85rem",
    color: "#6B8C7A",
    marginBottom: "1.5rem",
  },
  successDetails: {
    background: "#0A0F0D",
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "1.5rem",
    textAlign: "left",
  },
  successRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
  },
  successLabel: {
    fontSize: "0.85rem",
    color: "#6B8C7A",
  },
  successValue: {
    fontSize: "0.85rem",
    color: "#F0FFF8",
    fontWeight: 500,
  },
}