import 'feathercss/dist/feather.min.css'
import './style.css'

import AdjustButton from './AdjustButton'
import DarkThemeButton from './DarkThemeButton'
import React, { useEffect, useState } from 'react'
import * as Papa from 'papaparse'
import generateSchema from './generator'
import * as xlsx from 'xlsx'

function App() {
  let [darkTheme, setDarkTheme] = useState(false)
  let [option,setOption]=useState('ddl')
  let [content, setContent] = useState('')
  let schemmeOptions=new Map()
  schemmeOptions.set('ddl','DDL')
  schemmeOptions.set('js-object','JS Object')
  schemmeOptions.set('bq-schema','BigQuery schema')
  schemmeOptions.set('columns','Columns')

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
    // console.log(file.name)
    let reader=new FileReader()
    reader.addEventListener('load',event=>{
      let workbook=xlsx.read(event.target.result)
      // console.log(workbook.SheetNames)
      let csvString=xlsx.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]])
      Papa.parse(csvString, {
        header: true,
        transformHeader:(header)=>{
          let newHeader=header.toLowerCase()
          newHeader=newHeader.replace(/ +/g,'_')
          return newHeader
        },
        complete: function({ data }) {
          generateSchema(data).then((schemaStrings) => {
            setContent(schemaStrings)
          })
        }
      })
    })

    reader.readAsArrayBuffer(file) // this function activate the file reader
  }

  function handleOptionChange(e){
    setOption(e.target.value)
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
      <form className='container controls-container' onSubmit={(e) => {
        e.preventDefault()
      }}>
        <input type="file" className='button hidden' onChange={handleChange} ref={inputRef} multiple={false} />
        <select onChange={handleOptionChange} value={option}>
          {Array.from(schemmeOptions.entries()).map(([key,value])=>(
            <option value={key}>{value}</option>
          ))}
        </select>
        <button className='primary-button' onClick={() => {
          inputRef.current.click()
        }}> upload file</button>
      </form>
      <div className='container'>
        <pre>
          <code>
            {content[option]??''}
          </code>
        </pre>
      </div>
    </div >
  );
}

export default App;
