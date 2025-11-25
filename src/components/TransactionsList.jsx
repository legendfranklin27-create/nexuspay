import React from 'react'

export default function TransactionsList({ txs = [] }){
  if(!txs || txs.length===0) return <div className="small muted p-2">No transactions yet.</div>
  return (
    <div className="space-y-3">
      {txs.map(tx=> (
        <div key={tx.id} className="p-3 rounded-lg bg-gray-900">
          <div className="flex justify-between">
            <div>
              <div className="font-semibold">{tx.recipient}</div>
              <div className="small muted">{tx.description}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-400">- ₦{(parseFloat(tx.amount)||0).toLocaleString()}</div>
              <div className="small muted">{ (tx.timestamp && tx.timestamp.toDate) ? tx.timestamp.toDate().toLocaleString() : 'N/A' }</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
