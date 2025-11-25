import React, { useEffect } from 'react'
export default function Notification({ notification, setNotification }){
  useEffect(()=> {
    if(notification){ const t = setTimeout(()=> setNotification(null), 4500); return ()=> clearTimeout(t) }
  }, [notification, setNotification])
  if(!notification) return null
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 p-3 rounded-xl shadow-lg z-50">
      <div className="font-semibold">{notification.type}</div>
      <div className="small muted mt-1">{notification.message}</div>
      <div className="mt-2 text-right"><button className="text-sm" onClick={()=> setNotification(null)}>Close</button></div>
    </div>
  )
}
