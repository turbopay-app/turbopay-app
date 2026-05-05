"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export default function Home() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success">("error")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

 useEffect(() => {
  // Timeout fallback — if Supabase takes too long, show login anyway
  const timeout = setTimeout(() => {
    setLoading(false)
  }, 3000)

  supabase.auth.getSession().then(({ data: { session } }) => {
    clearTimeout(timeout)
    if (session) {
      router.push("/dashboard")
    } else {
      setLoading(false)
    }
  })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.push("/dashboard")
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleSubmit = async () => {
    setMessage("")
    setBusy(true)

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      if (error) {
        setMessage(error.message)
        setMessageType("error")
      }
    } else {
      if (password.length < 6) {
        setMessage("Password must be at least 6 characters")
        setMessageType("error")
        setBusy(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })
      if (error) {
        setMessage(error.message)
        setMessageType("error")
      } else {
        setMessage("Account created! Logging you in...")
        setMessageType("success")
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })
      }
    }

    setBusy(false)
  }

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingLogo}>T</div>
          <p style={styles.loadingText}>TurboPay</p>
          <div style={styles.loadingSpinner} />
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>T</div>
          <span style={styles.logoText}>TurboPay</span>
        </div>

        <h1 style={styles.headline}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p style={styles.subline}>
          {mode === "login" ? "Login to your account" : "Sign up to get started"}
        </p>

        <label style={styles.label}>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={handleSubmit}
          disabled={busy}
          style={styles.btn}
        >
          {busy ? "Please wait..." : mode === "login" ? "Login →" : "Sign up →"}
        </button>

        {message && (
          <div style={{
            ...styles.messageBox,
            borderColor: messageType === "error" ? "#FF5A5A" : "#00C896",
            color: messageType === "error" ? "#FF5A5A" : "#00C896",
          }}>
            {message}
          </div>
        )}

        <div style={styles.toggleRow}>
          {mode === "login" ? (
            <>
              <span style={styles.toggleText}>New to TurboPay?</span>
              <button
                onClick={() => { setMode("signup"); setMessage("") }}
                style={styles.toggleBtn}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <span style={styles.toggleText}>Already have an account?</span>
              <button
                onClick={() => { setMode("login"); setMessage("") }}
                style={styles.toggleBtn}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>

      <p style={styles.footer}>Secure · TurboPay</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  loadingScreen: {
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
  loadingSpinner: {
    width: "24px",
    height: "24px",
    border: "2px solid #1A211D",
    borderTop: "2px solid #00C896",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginTop: "8px",
  },
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    background: "#0A0F0D",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#111714",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "2rem 1.75rem",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "2rem",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#00C896",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1rem",
  },
  logoText: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#F0FFF8",
    letterSpacing: "-0.02em",
  },
  headline: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#F0FFF8",
    marginBottom: "0.4rem",
    letterSpacing: "-0.02em",
  },
  subline: {
    fontSize: "0.9rem",
    color: "#6B8C7A",
    marginBottom: "1.75rem",
  },
  label: {
    display: "block",
    fontSize: "0.75rem",
    color: "#6B8C7A",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
    marginTop: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.8rem 1rem",
    background: "#1A211D",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#F0FFF8",
    fontSize: "1rem",
    outline: "none",
  },
  btn: {
    width: "100%",
    padding: "0.85rem",
    background: "#00C896",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "1.5rem",
  },
  messageBox: {
    marginTop: "1rem",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "0.85rem",
  },
  toggleRow: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.85rem",
  },
  toggleText: {
    color: "#6B8C7A",
    marginRight: "6px",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#00C896",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
    padding: "0",
  },
  footer: {
    marginTop: "1.5rem",
    fontSize: "0.75rem",
    color: "#6B8C7A",
  },
}