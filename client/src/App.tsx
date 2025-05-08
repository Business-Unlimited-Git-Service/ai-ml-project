// import React from 'react'
import { createRoot } from 'react-dom/client';
import '../styles.css'
import UserInput from '../components/userInput.tsx'

function App() {
  return (
      <div>
       <UserInput/>
      </div>
  )
}

createRoot(document.querySelector('#root')!).render(<App />);

export default App
