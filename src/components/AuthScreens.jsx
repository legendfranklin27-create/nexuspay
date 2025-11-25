import React, { useState } from 'react'

export default function AuthScreens({ actions, setNotification }){
  const [view, setView] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signup = async (e) => {
    e.preventDefault()
    const res = await actions.signUp(email,password)
    if(!res.ok) setNotification?.({type:'error', message: res.error || 'Signup failed'})
  }
  const login = async (e) => {
    e.preventDefault()
    const res = await actions.signIn(email,password)
    if(!res.ok) setNotification?.({type:'error', message: res.error || 'Login failed'})
  }

  return (
    <div className="card">
      {view==='login' ? (
        <form onSubmit={login} className="grid gap-3">
          <label className="small">Email</label>
          <input className="p-2 rounded-md bg-gray-800" value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="small">Password</label>
          <input className="p-2 rounded-md bg-gray-800" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn btn-primary">Sign in</button>
            <button type="button" className="btn" onClick={()=>setView('signup')}>Create</button>
            <button type="button" className="btn" onClick={()=>setView('forgot')}>Forgot</button>
          </div>
        </form>
      ) : view==='signup' ? (
        <form onSubmit={signup} className="grid gap-3">
          <label className="small">Email</label>
          <input className="p-2 rounded-md bg-gray-800" value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="small">Password</label>
          <input className="p-2 rounded-md bg-gray-800" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn btn-primary">Create</button>
            <button type="button" className="btn" onClick={()=>setView('login')}>Back</button>
          </div>
        </form>
      ) : (
        <div>
          <p className="small">Reset password</p>
        </div>
      )}
    </div>
  )
}
