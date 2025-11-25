import React, { useState, useRef, useEffect } from 'react'

export default function AICareCard({ setNotif }){
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState([{role:'system', text:'Hello! Ask about transfers or accounts.'}])
  const endRef = useRef(null)
  useEffect(()=> endRef.current?.scrollIntoView({behavior:'smooth'}), [msgs])

  const send = async () => {
    if(!input.trim()) return
    setMsgs(prev => [...prev, {role:'user', text: input}])
    setInput('')
    try {
      const res = await fetch('/api/ai', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ prompt: input }) })
      const json = await res.json()
      const text = json?.raw?.text || json?.category || 'AI did not respond'
      setMsgs(prev => [...prev, {role:'assistant', text}])
    } catch(e){
      console.error(e); setNotif?.({type:'error', message:'AI proxy error'})
    }
  }

  return (
    <div>
      <h3 className="font-semibold">AI Customer Care</h3>
      <div className="mt-3 p-3 rounded-lg bg-gray-900 max-h-48 overflow-auto">
        {msgs.map((m,i)=> <div key={i} className={`mb-2 ${m.role==='user' ? 'text-right' : 'text-left'}`}><div className="inline-block p-2 rounded-lg bg-gray-800">{m.text}</div></div>)}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input className="flex-1 p-2 rounded-md bg-gray-800" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a question..." />
        <button className="btn btn-primary" onClick={send}>Send</button>
      </div>
    </div>
  )
}
