\
import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import AuthScreens from './components/AuthScreens'
import TransferCard from './components/TransferCard'
import AnalysisCard from './components/AnalysisCard'
import AICareCard from './components/AICareCard'
import TransactionsList from './components/TransactionsList'
import Notification from './components/Notification'
import { auth, db } from './lib/firebaseClient'
import { onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { generateAccountNumber } from './utils/helpers'

const STARTING_BALANCE = 1000000

export default function App(){
  const [user, setUser] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [liveBalance, setLiveBalance] = useState(0)
  const [accountNumber, setAccountNumber] = useState(null)
  const [txs, setTxs] = useState([])
  const [view, setView] = useState('home')
  const [notif, setNotif] = useState(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const APP_ID = import.meta.env.VITE_APP_ID || 'nexuspay-default-app'

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, user => {
      if(user){ setUser(user); setIsAuthReady(true) } else { setUser(null); setIsAuthReady(true); setLiveBalance(0); setAccountNumber(null); setTxs([]) }
    })
    return () => unsub()
  },[])

  useEffect(()=> {
    if(!user) return
    const balancePath = `artifacts/${APP_ID}/users/${user.uid}/user_data/balance`
    const profilePath = `artifacts/${APP_ID}/users/${user.uid}/user_data/profile`
    const balanceRef = doc(db, balancePath)
    const profileRef = doc(db, profilePath)
    getDoc(balanceRef).then(snap=>{ if(!snap.exists()) setDoc(balanceRef, { balance: STARTING_BALANCE, lastUpdated: Timestamp.now() }) }).catch(console.error)
    getDoc(profileRef).then(snap=>{ if(!snap.exists()) setDoc(profileRef, { email: user.email || null, accountNumber: generateAccountNumber(), createdAt: Timestamp.now() }) }).catch(console.error)
    const unsubB = onSnapshot(balanceRef, snap => { if(snap.exists()) setLiveBalance(snap.data().balance || 0) }, err=>console.error(err))
    const unsubP = onSnapshot(profileRef, snap => { if(snap.exists()) setAccountNumber(snap.data().accountNumber) }, err=>console.error(err))
    const txCol = collection(db, `artifacts/${APP_ID}/public/data/transactions`)
    const q = query(txCol, where('senderId', '==', user.uid))
    const unsubT = onSnapshot(q, snap => {
      const arr = snap.docs.map(d => ({ id:d.id, ...d.data(), amount: parseFloat(d.data().amount || 0) }))
      arr.sort((a,b)=> (b.timestamp?.toDate?.()||0) - (a.timestamp?.toDate?.()||0))
      setTxs(arr)
    }, err=>console.error(err))
    return ()=>{ unsubB(); unsubP(); unsubT() }
  }, [user])

  const authActions = {
    signUp: async (email,password) => {
      try { const c = await createUserWithEmailAndPassword(auth,email,password); setNotif({type:'success', message:'Account created.'}); return {ok:true} }
      catch(e){ console.error(e); return {ok:false, error:e.message} }
    },
    signIn: async (email,password) => {
      try { await signInWithEmailAndPassword(auth,email,password); setNotif({type:'info', message:'Signed in.'}); return {ok:true} }
      catch(e){ console.error(e); return {ok:false, error:e.message} }
    },
    reset: async (email) => {
      try { await sendPasswordResetEmail(auth,email); setNotif({type:'info', message:'Reset email sent.'}) }
      catch(e){ console.error(e); setNotif({type:'error', message:'Reset failed.'}) }
    },
    signOut: async () => {
      try { await firebaseSignOut(auth); setNotif({type:'info', message:'Signed out.'}) } catch(e){ console.error(e) }
    }
  }

  const handleTransfer = async ({ amount, recipientName, recipientAccount, type }) => {
    if(!user){ setNotif({type:'alert', message:'Sign in required.'}); return }
    const num = parseFloat(amount)
    if(isNaN(num) || num<=0){ setNotif({type:'error', message:'Invalid amount.'}); return }
    if(num > liveBalance){ setNotif({type:'alert', message:`Insufficient funds (₦${liveBalance.toLocaleString()})`); return }

    setIsTransferring(true)
    setNotif({type:'info', message:'Processing transfer and categorization...'})

    try {
      const payload = { prompt: `Categorize this transaction into ['P2P Transfer','Bank Transfer','Bills','Groceries','Food & Dining','Transport','Utilities','Shopping','Other']: Transfer of ₦${num} to ${recipientName} (${recipientAccount})` }
      const res = await fetch('/api/ai', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      let category = 'Other', confidence = 0.0
      if(res.ok){ const json = await res.json(); if(json?.category) { category = json.category; confidence = parseFloat(json.confidence||0) } }
      const balanceRef = doc(db, `artifacts/${APP_ID}/users/${user.uid}/user_data/balance`)
      await updateDoc(balanceRef, { balance: Math.max(0, liveBalance - num), lastUpdated: Timestamp.now() })
      const txCol = collection(db, `artifacts/${APP_ID}/public/data/transactions`)
      await addDoc(txCol, {
        senderId: user.uid,
        senderAccount: accountNumber || null,
        recipient: recipientName || recipientAccount,
        account: recipientAccount,
        amount: num,
        currency: 'NGN',
        type,
        status: 'Completed',
        timestamp: Timestamp.now(),
        description: `${type} to ${recipientName} (${recipientAccount})`,
        category, confidence
      })
      setNotif({type:'success', message:`Sent ₦${num.toLocaleString()} — ${category}`})
    } catch(e){
      console.error(e); setNotif({type:'security', message:'Transfer failed. Funds secure.'})
    } finally { setIsTransferring(false) }
  }

  const totalSpent = useMemo(()=> txs.reduce((s,t)=> s + (parseFloat(t.amount)||0), 0), [txs])

  return (
    <div className="container">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">NexusPay</h1>
          <p className="text-sm muted">P2P Transfers & AI Care</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs muted">Balance</div>
            <div className="font-bold">₦{liveBalance.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
          </div>
          <button className="btn btn-primary" onClick={()=> authActions.signOut()}>Sign Out</button>
        </div>
      </header>

      <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.4}} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card">
            <TransferCard onTransfer={handleTransfer} isTransferring={isTransferring} accountNumber={accountNumber} setNotif={setNotif} />
          </div>

          <div className="card mt-6">
            <AICareCard setNotif={setNotif} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card">
            <h3 className="font-semibold">Spending Summary</h3>
            <div className="mt-3">
              <div className="text-sm muted">Total tracked</div>
              <div className="font-bold text-xl">₦{totalSpent.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold">Transactions</h3>
            <div className="mt-3 max-h-60 overflow-auto">
              <TransactionsList txs={txs} />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold">Resources</h3>
            <a className="text-indigo-300" href="/swarm.pdf" target="_blank" rel="noreferrer">View uploaded PDF</a>
          </div>
        </aside>
      </motion.div>

      <div className="mt-6">
        <button className="btn" onClick={()=> setView(v=> v==='home'?'analysis':'home')}>Toggle View</button>
      </div>

      <Notification notification={notif} setNotification={setNotif} />
    </div>
  )
}
