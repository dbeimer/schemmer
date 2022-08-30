import 'feathercss/dist/feather.min.css'
import './style.css'

import AdjustButton from './AdjustButton'
import DarkThemeButton from './DarkThemeButton'
import { useEffect, useState } from 'react'

function App() {
  let [darkTheme, setDarkTheme] = useState(false)


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

  let content = `
rut_empleador varchar(20) null,
dv varchar(50) null,
  `
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
            {content.trim()}
          </code>
        </pre>
      </div>
    </div >
  );
}

export default App;
