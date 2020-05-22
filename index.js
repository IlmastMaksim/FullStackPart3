require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(express.json())
app.use(bodyParser.json())

app.use(express.static('build'))
app.use(express.json())

morgan.token('content', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

app.use(cors())

const Person = require('./models/person')

const dateobj = new Date(); 

const generateId = () => Math.floor(Math.random() * 1000) + 1

const persons = [
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

app.get('/api/persons', (req, res) => {
    Person
        .find({})
        .then(persons => {
          res.json(persons)
        })
        .catch(err => console.log(err))
})

app.get('/info', (req, res) => {
    Person
        .find({})
        .then(persons => {
            res.send('<p>Phonebook has info for ' + persons.length + ' people</p>' + '<p>' + dateobj.toString() + '</p>')
        })
        .catch(err => console.log(err))
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if(person){
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  const person = Person({
    name: body.name,
    number: body.number,
    id: generateId(),
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})