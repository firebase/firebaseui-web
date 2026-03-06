import React, { useState } from 'react'

export default function Hello({ name = 'World' }) {
  const [count, setCount] = useState(0)

  return (
    <div style={{ border: '2px dashed #61dafb', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
      <p style={{ margin: '0 0 0.5rem' }}>
        ⚛️ Hello from <strong>React</strong>, {name}!
      </p>
      <button onClick={() => setCount((c) => c + 1)}>
        React count: {count}
      </button>
    </div>
  )
}
