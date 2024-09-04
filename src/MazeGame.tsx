import { Maze, MazeCell, Route } from '@types'
import { Ghost, Key } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

const DIRECTION = [
  [-1, 0],
  [0, -1],
  [1, 0],
  [0, 1],
]
const HIGHLIGHT_CLASS = 'bg-sky-300'

const MazeGame = ({ maze }: { maze: Maze }) => {
  const startPoint = useMemo<[number, number]>(() => {
    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[0].length; j++) {
        if (maze[i][j] === 'start') {
          return [i, j]
        }
      }
    }
    throw new Error('Start point not found in the maze')
  }, [])
  const route = useMemo<Route>(() => {
    const hash = maze.map(row => row.map(() => false))
    const path: Route = []

    const dfs = ([row, col]: [number, number]) => {
      path.push([row, col, 1])
      if (maze[row][col] === 'end') {
        return 1
      }

      hash[row][col] = true

      for (let i = 0; i < DIRECTION.length; i++) {
        const [addRow, addCol] = DIRECTION[i]
        const [nextRow, nextCol] = [row + addRow, col + addCol]
        if (
          nextRow < 0 ||
          nextRow > maze.length - 1 ||
          nextCol < 0 ||
          nextCol > maze[0].length - 1 ||
          maze[nextRow][nextCol] === 'wall' ||
          hash[nextRow][nextCol]
        ) {
          continue
        } else {
          const hasKey = dfs([row + addRow, col + addCol])
          if (hasKey) return path
          path.push([row, col, 0])
        }
      }
      return 0
    }
    dfs([startPoint[0], startPoint[1]])
    return path
  }, [])
  const cell = useRef(
    new Array(maze.length).fill(null).map(() => new Array(maze[0].length))
  )
  const [started, setStarted] = useState(false)
  const [ghost, setGhost] = useState<[number, number]>(startPoint)
  const timeoutIds = useRef<NodeJS.Timeout[]>([])
  const handleStart = () => {
    route.forEach(([r, c, dir], i) => {
      const id = setTimeout(() => {
        cell.current[r][c] = true
        if (i > 0 && dir === 0) {
          cell.current[route[i - 1][0]][route[i - 1][1]] = false
        }
        // cell.current[r][c].classList.add(HIGHLIGHT_CLASS)
        // if (i > 0 && dir === 0) {
        //   cell.current[route[i - 1][0]][route[i - 1][1]].classList.remove(
        //     HIGHLIGHT_CLASS
        //   )
        // }
        setGhost([r, c])
      }, 500 * i)
      timeoutIds.current.push(id)
    })
  }

  const handleReset = () => {
    route.forEach(
      ([r, c]) => (cell.current[r][c] = false)
      // cell.current[r][c].classList.remove(HIGHLIGHT_CLASS)
    )

    timeoutIds.current.forEach(id => clearTimeout(id))
    timeoutIds.current = []
    setGhost(startPoint)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (started) {
      handleReset()
    } else {
      handleStart()
    }
    setStarted(prev => !prev)
  }

  const getCell = (str: MazeCell, [rowIdx, colIdx]: [number, number]) => {
    const isGhost = rowIdx === ghost[0] && colIdx === ghost[1]
    switch (str) {
      case 'wall':
        return (
          <div key={`${rowIdx - colIdx}`} className="h-10 w-10 bg-sky-800" />
        )
      case 'path':
      case 'start':
        return (
          <div
            key={`${rowIdx - colIdx}`}
            // ref={el => {
            //   cell.current[rowIdx][colIdx] = el
            // }}
            className={`flex items-center justify-center h-10 w-10 bg-sky-100 ${cell.current[rowIdx][colIdx] ? HIGHLIGHT_CLASS : ''}`}
          >
            {isGhost && <Ghost className="text-red-400" />}
          </div>
        )
      case 'end':
        return (
          <div
            key={`${rowIdx - colIdx}`}
            // ref={el => {
            //   cell.current[rowIdx][colIdx] = el
            // }}
            className={`flex items-center justify-center h-10 w-10 bg-sky-100 ${cell.current[rowIdx][colIdx] ? HIGHLIGHT_CLASS : ''}`}
          >
            {isGhost ? (
              <Ghost className="text-red-400" />
            ) : (
              <Key className="text-red-400" />
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="mb-10">
      {maze.map((row, rowIdx) => (
        <div key={rowIdx} className="flex">
          {row.map((col, colIdx) => getCell(col, [rowIdx, colIdx]))}
        </div>
      ))}
      <button
        className="mt-10 text-center rounded bg-red-300 w-full"
        onClick={e => handleClick(e)}
      >
        {started ? 'Reset' : 'Start'}
      </button>
    </div>
  )
}

export default MazeGame
