import React, { useState } from 'react'

export default function TransferCard({ onTransfer, isTransferring, accountNumber, setNotif }){
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [type, setType] = useState('P2P')

  const submit = async () => {
    if(!amount || !recipient){ setNotif?.({type:'error', message:'Enter amount and account'}); return }
    await onTransfer({ amount, recipientName, recipientAccount: recipient, type })
    setAmount(''); setRecipient(''); setRecipientName('')
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm muted">Account</div>
          <div className="font-bold">{accountNumber || 'Fetching...'}</div>
        </div>
        <div className="space-x-2">
          <button className={`btn ${type==='P2P' ? 'btn-primary' : ''}`} onClick={()=>setType('P2P')}>P2P</button>
          <button className={`btn ${type==='Bank' ? 'btn-primary' : ''}`} onClick={()=>setType('Bank')}>Bank</button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <input className="p-3 rounded-lg bg-gray-800" placeholder="Recipient account" value={recipient} onChange={e=>setRecipient(e.target.value)} />
        <input className="p-3 rounded-lg bg-gray-800" placeholder="Recipient name (optional)" value={recipientName} onChange={e=>setRecipientName(e.target.value)} />
        <input className="p-3 rounded-lg bg-gray-800" placeholder="Amount (NGN)" value={amount} onChange={e=>setAmount(e.target.value)} />
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={submit} disabled={isTransferring}>{isTransferring? 'Sending...': `Send ₦${amount || '0.00'}`}</button>
        </div>
      </div>
    </div>
  )
}
