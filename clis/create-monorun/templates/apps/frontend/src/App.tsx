import { useState } from 'react'
import { greeting, add } from '@repo/ui'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Monorun + Vite + React</h1>
        <p>{greeting}</p>
        <p>2 + 3 = {add(2, 3)}</p>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </div>
    </>
  )
}

export default App
