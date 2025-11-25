export const generateAccountNumber = () => Array.from({length:10}).map(()=>Math.floor(Math.random()*10)).join('')
