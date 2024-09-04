import { Maze } from '@types'
import { useEffect, useState } from 'react'
import MazeGame from './MazeGame'

export default function App() {
  const [data, setData] = useState<Maze[]>()
  useEffect(() => {
    fetch('http://localhost:8080/api/maze')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="flex flex-col justify-center items-center p-10">
      {data && data.map((maze, i) => <MazeGame key={i} maze={maze} />)}
    </div>
  )
}
