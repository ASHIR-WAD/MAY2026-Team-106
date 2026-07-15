import { useEffect } from 'react'
import { apiGet } from './lib/api'

function App() {
  useEffect(() => {
    async function test() {
      try {
        const events = await apiGet('/events')
        console.log(events)
      } catch (err) {
        console.error(err)
      }
    }

    test()
  }, [])

  return <h1>Testing API</h1>
}

export default App