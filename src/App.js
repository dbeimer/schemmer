import 'feathercss/dist/feather.min.css'
import './style.css'

import AdjustButton from './AdjustButton'
import DarkThemeButton from './DarkThemeButton'
import React, { useEffect, useState } from 'react'
import * as Papa from 'papaparse'
import generateSchema from './generator'

function App() {
  let [darkTheme, setDarkTheme] = useState(false)
  let [content, setContent] = useState('')

  const inputRef = React.useRef(null)


  function changeTheme() {
    console.log('se ejecuta el cambio de tema')
    let parentElement = window.document.documentElement;
    if (darkTheme) {
      parentElement.setAttribute('data-theme', 'dark')
      setDarkTheme(false)
    } else {
      parentElement.setAttribute('data-theme', 'light')
      setDarkTheme(true)
    }
  }

  useEffect(changeTheme, [])

  function handleChange(e) {
    let file = e.target.files[0]
    Papa.parse(file, {
      header: true,
      complete: function({ data }) {
        generateSchema(data).then((text) => {
          console.log(text)
          setContent(text)
        })
      }
    })
  }

  return (
    <div className="App">
      <header>
        <div className='container header'>
          <AdjustButton onClick={() => { console.log('test') }} />
          <h2>Schemmer</h2>
          <DarkThemeButton dark={darkTheme} changeTheme={changeTheme} />
        </div>
      </header >
      <div className='container'>
        <pre>
          <code>
            {content}
          </code>
        </pre>
      </div>
      <form className='container' onSubmit={(e) => {
        e.preventDefault()
      }}>
        <input type="file" className='button' onChange={handleChange} ref={inputRef} multiple={false} />
        <button className='primary-button' onClick={() => {
          inputRef.current.click()
        }}> upload file</button>
      </form>
    </div >
  );
}

export default App;
