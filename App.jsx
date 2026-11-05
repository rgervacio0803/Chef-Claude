import React from "react"
import Header from "./Header"
import Main from "./Main"
import Auth from "./Auth"
import { supabase } from "./supabase"

export default function App() {
    const [session, setSession] = React.useState(null)
    const [checking, setChecking] = React.useState(true)

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setChecking(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    async function logOut() {
        await supabase.auth.signOut()
    }

    if (checking) return null

    return (
        <>
            <Header />
            {session && (
                <div className="user-bar">
                    <span>{session.user.email}</span>
                    <button onClick={logOut}>Log out</button>
                </div>
            )}
            {session ? <Main /> : <Auth />}
        </>
    )
}