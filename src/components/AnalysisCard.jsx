import React from 'react'

export default function AnalysisCard({ recentTransactions = [] }){
  return (
    <div>
      <h3 className="font-semibold">Spending Analysis</h3>
      <p className="small muted mt-2">Overview of categories and totals</p>
      {/* A compact chart could go here */}
    </div>
  )
}
