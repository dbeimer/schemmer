import * as dataForge from 'data-forge'

const equivalences = {
  postgresql: {
    string: 'varchar',
    number: 'int',
    float: 'numeric',
    date: 'date',
    datetime: 'timestamp',
    time: 'time',
  },
  bq_schema: {
    string: 'STRING',
    number: 'INTEGER',
    float: 'FLOAT',
    date: 'DATE',
    datetime: 'DATETIME',
    time: 'TIME',
  }
}


function isDate(value) {
  return (value.split('-').length === 3 || value.split('/').length === 3)
    && (value.split('-').every(isNumber) || value.split('/').every(isNumber))
}

function isNumber(value) {
  return !isNaN(value)
}

function isFloat(value) {
  return !isNaN(value) && value.includes('.')
}

function isTime(value) {
  let arraySplit = value.split(':')
  return (arraySplit.length === 2 || arraySplit.length === 3) &&
    arraySplit.every(isNumber)
}

function isDateTime(value) {
  return value.split(' ').length === 2 && isDate(value.split(' ')[0]) && isTime(value.split(' ')[1])
}

function checkDataType(value) {
  let type = 'string'

  if (value.toLowerCase() === 'null' || !value) {
    return null
  } else {

    type = isDate(value) ? 'date' : type
    type = isNumber(value) ? 'number' : type
    type = isFloat(value) ? 'float' : type
    type = isTime(value) ? 'time' : type
    type = isDateTime(value) ? 'datetime' : type

  }

  return {
    type: type,
    value: value,
    length: value.length
  }

}

function detectSchema(data) {

  console.log(data.length)
  let dataFrame = (new dataForge.DataFrame(data))
  let dataAnalisis = []

  for (const column of dataFrame.getColumns()) {
    let columnData = dataFrame.getSeries(column.name).toArray()
    let typeDataResults = []
    for (const data of columnData) {
      let typeData = checkDataType(data)
      typeDataResults.push(typeData)
    }


    typeDataResults = typeDataResults.filter(value => !!value)
    let dfTypeData = new dataForge.DataFrame(typeDataResults)
      .orderByDescending(x => x.length)

    if (dfTypeData.count() === 0) continue
    let types = dfTypeData.groupBy(x => x.type).select(x => {
      let firstAndLongest = x.first()
      return {
        column: column.name,
        type: firstAndLongest.type,
        length: (10 - (firstAndLongest.length % 10)) + firstAndLongest.length,
        count: x.count()
      }
    }).orderByDescending(column => column.count).inflate()


    let lastTypeDefinition = types.first().type
    if (types.count() > 1) {
      let arrayTypes = types.getSeries('type').toArray()

      lastTypeDefinition = arrayTypes.includes('number') && arrayTypes.includes('float') ? 'float' : lastTypeDefinition
      //NOTE:aqui tratar casos especiales
    }

    dataAnalisis.push({
      column: column.name,
      type: lastTypeDefinition,
      length: types.first().length
    })
  }

  return dataAnalisis
}


async function generateSchema(data) {
  // let data = await fileToJsonObject(file)

  let defColumns = [
    {
      column: 'file',
      type: 'string',
      length: 100
    },
    {
      column: 'created_at',
      type: 'datetime',
    },
    {
      column: 'updated_at',
      type: 'datetime',
    },
  ]


  let schema = detectSchema(data)

  if (true) {
    schema = schema.concat(defColumns)
  }

  let schemaStrings ={
    'ddl':'',
    'bq-schema':'',
    'js-object':'',
    'columns':''
  }
  for (const [index, column] of schema.entries()) {
    let end = index === schema.length - 1 ? '\n' : ',\n'
    let longitude = column.type === 'string' ? `(${column.length})` : ''
    schemaStrings.ddl += `${column.column} ${equivalences.postgresql[column.type]}${longitude} NULL${end}`
  }

  for (const [index, column] of schema.entries()) {
    let end = index === schema.length - 1 ? '\n' : ',\n'
    // let longitude = column.type === 'string' ? `(${column.length})` : ''
    schemaStrings['bq-schema'] += `{name: "${column.column}", type: "${equivalences.bq_schema[column.type]}", mode: "NULLABLE"}${end}`
  }

  for (const [index, column] of schema.entries()) {
    let end = index === schema.length - 1 ? '\n' : ',\n'
    schemaStrings['js-object'] += `${column.column}: row.${column.column}${end}`
  }

  schemaStrings.columns += schema.map(column => column.column).join(',\n')

  return schemaStrings
}

export default generateSchema
