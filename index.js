const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())

morgan.token('content', function (req, res) { return JSON.stringify(req.body) })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

app.use(cors())

let persons = [
    {
        "name": "Arto Hellas",
        "number": "39-44-5323123",
        "id": 1 
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
]

const dateobj = new Date(); 

const generateId = () => Math.floor(Math.random() * 1000) + 1  

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    res.send('<p>Phonebook has info for ' + persons.length + ' people</p>' + '<p>' + dateobj.toString() + '</p>')
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(note => note.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  else {
    if (persons.filter(person => person.name === body.name) == []) {
        return response.status(400).json({ 
          error: 'name must be unique'
        })
    }
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.use(express.static('build'))

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})