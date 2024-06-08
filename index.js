const express = require('express')
const guitarras = require('./data/guitarras.js')
const app = express()
app.listen(3000, () => console.log("Servidor encendido!"))

app.use(express.static('public'))

app.get('/', async (req, res) => {
  console.log(guitarras)
  res.send(guitarras)
})


app.get('/guitarras', (req, res) => {
  res.json({
    guitarras: HATEOAS()
  })
})

app.get('/guitarra/:id', (req, res) => {
  const guitar = guitarras.filter(guitar => guitar.id == req.params.id)

  res.send(guitar)
})

// GET /api/v2/body/:cuerpo
app.get("/api/v2/body/:cuerpo", (req, res) => {
  const guitarrasCuerpo = guitarras.filter(guitarra => guitarra.body.toLocaleUpperCase() == req.params.cuerpo.toLocaleUpperCase())

  // { cant: number, guitarras: [{}] }
  res.json({
    cant: guitarrasCuerpo.length,
    guitarras: guitarrasCuerpo
  })
})

/**
 *  GET /api/v2/guitarras?values=desc
 *  GET /api/v2/guitarras?values=asc
 *  GET /api/v2/guitarras?page=2
 */
app.get("/api/v2/guitarras", (req, res) => {
  const { values, page } = req.query
  
  if ( values == 'asc' || values == 'desc' ) {
    res.send(ordenarGuitarras(guitarras, values))
  } else if (page) {
    res.send({
      guitarras: HATEOASV2().slice(page * 2 - 2, page * 2)
    })
  } else {
    res.send({
      guitarras: HATEOASV2()
    })
  }
})

/**
 * Filtrado de campos
 * 
 * GET /api/v2/guitarras/:id?fields=id,name,marca,color
 */
app.get("/api/v2/guitarras/:id" , (req, res) => {
  let {fields} = req.query
  fields = fields.split(",")

  const guitarraId = guitarras.filter(g => g.id == req.params.id)
  const guitarraIdFiltrada = filtrarCampos(guitarraId[0], fields)

  res.json({
    guitarra: guitarraIdFiltrada
  })
})


function HATEOAS() {
  const hateoas = guitarras.map(guitar => {
    return {
      name: guitar.name,
      href: `http://localhost:3000/guitarra/${guitar.id}`
    }
  })
  return hateoas
}

function HATEOASV2() {
  const hateoas = guitarras.map(guitar => {
    return {
      name: guitar.name,
      href: `http://localhost:3000/api/v2/guitarras/${guitar.id}`
    }
  })
  return hateoas
}

function ordenarGuitarras(guitarras, orden) {
  // const variable = (prueba_logica) ? caso_verdad : caso_falso
  // casos posibles orden = asc | des
  const guitarrasOrdenadas = orden == 'asc' 
                            ? guitarras.sort( (guit1, guit2) => guit1.value - guit2.value )
                            : orden == 'desc' ? guitarras.sort( (guit1, guit2) => guit2.value - guit1.value ) : false

  return guitarrasOrdenadas
}

/**
 * 
 * @param {Object} guitarra 
 * @param {Array<string>} campos [id, brand, color]
 */
function filtrarCampos(guitarra, campos) {
  for ( let propiedad in guitarra  ) {
    if ( !campos.includes(propiedad) ) delete guitarra[propiedad]
  }

  return guitarra
}