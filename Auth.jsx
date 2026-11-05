import React from "react"
import { supabase } from "./supabase"

export default function Auth() {
    const [mode, setMode] = React.useState("login")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [message, setMessage] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setMessage("")
        setLoading(true)

        if (mode === "signup") {
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) {
                setMessage(error.message)
            } else {
                setMessage("Check your email to confirm your account, then log in.")
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setMessage(error.message)
            }
        }

        setLoading(false)
    }

    return (
        <section className="auth-container">
            <h2>{mode === "login" ? "Log in to Chef Claude" : "Create your account"}</h2>

            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password (at least 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
                </button>
            </form>

            {message && <p className="auth-message">{message}</p>}

            <button
                className="auth-switch"
                onClick={() => {
                    setMode(mode === "login" ? "signup" : "login")
                    setMessage("")
                }}
            >
                {mode === "login"
                    ? "New here? Create an account"
                    : "Already have an account? Log in"}
            </button>
        </section>
    )
}