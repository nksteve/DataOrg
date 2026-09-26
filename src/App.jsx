import { useEffect, useState } from 'react'
import { initAuth, signIn, signOut, isSignedIn } from './driveApi'
import Explorer from './components/Explorer'

export default function App() {
  const [authed, setAuthed] = useState(isSignedIn())
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    initAuth((ok, err) => {
      setAuthed(ok)
      setAuthError(err || null)
    })
  }, [])

  if (!authed) {
    return (
      <div className="signin-screen">
        <div className="signin-card">
          <h1>MyVault</h1>
          <p>Your document archive, in one place.</p>
          {authError && <p className="error-text">Sign-in failed: {authError}</p>}
          <button className="btn primary" onClick={signIn}>Sign in with Google</button>
        </div>
      </div>
    )
  }

  return <Explorer onSignOut={signOut} />
}
