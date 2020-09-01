import React, { useState } from "react"
import axios from "axios"
import "./styles.css"

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [output, setOutput] = useState([])
  const [commands, setCommands] = useState([])

  // Seek Position
  let [seekPosition, setSeekPosition] = useState(0)

  // PromptPrefix
  const [user, setUser] = useState("user@solaris")
  const [path, setPath] = useState("/")
  const [userType, setUserType] = useState("$")

  const parseCommand = prompt => {
    // Add output
    const newOutput = [...output, ...[{ prompt: prompt, orig: "user" }]]

    switch (prompt) {
      case "clear":
        setOutput([])
        break
      case "menu":
        loadFile("menu")
        break
      default:
        setOutput([
          ...newOutput,
          ...[{ prompt: `Command '${prompt}' not found`, orig: "system" }],
        ])
    }
  }

  const handleEvents = e => {
    // Enter
    if (e.keyCode === 13) {
      // Add command to history
      const newCommands = [...commands, prompt]
      setCommands(newCommands)

      setPrompt("")
      setSeekPosition(0)

      parseCommand(prompt)
    }

    // Up Arrow
    if (e.keyCode === 38) {
      if (commands.length <= 0 || seekPosition === commands.length) {
        return
      }

      // Set
      setSeekPosition(++seekPosition)
      setPrompt([...commands][commands.length - seekPosition])
    }

    // Down Arrow
    if (e.keyCode === 40) {
      if (commands.length <= 0 || seekPosition <= 1) {
        return
      }

      setSeekPosition(--seekPosition)
      setPrompt([...commands][commands.length - seekPosition])
    }
  }

  const handleInput = e => setPrompt(e.target.value)

  const loadFile = file => {
    axios
      .get(`/static/${file}`)
      .then(response => {
        const lines = response.data.split("\n")

        const lineArray = lines.map(line => {
          return { prompt: line, orig: "system" }
        })

        const concat = output.concat(lineArray)
        setOutput(concat)
      })
      .catch(error => {
        setOutput([
          ...output,
          ...[{ prompt: `Error loading ${file}`, orig: "system" }],
        ])
      })
  }

  const promptPrefix = () => {
    return (
      <React.Fragment>
        <span>{user}</span>
        <span>:</span>
        <span>{path}</span>
        <span>{userType}</span>
      </React.Fragment>
    )
  }

  return (
    <div className="screen">
      <div className="output">
        {output.map((out, key) => {
          return (
            <div key={key} className="output_prompt">
              {out.orig === "user" ? promptPrefix() : null}
              {out.prompt}
            </div>
          )
        })}
      </div>

      <div className="input">
        <label className="user">
          {promptPrefix()}
          <input
            type="text"
            value={prompt}
            className="prompt"
            onChange={handleInput}
            onKeyDown={handleEvents}
            autoFocus
          />
        </label>
      </div>
    </div>
  )
}
