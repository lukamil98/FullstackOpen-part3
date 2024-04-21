const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const path = require("path")

const app = express()
const baseUrl = "/api/persons" // Define your base URL here

// Middleware setup
app.use(cors())
app.use(express.json())

// Custom token for logging request body
morgan.token("req-body", (req) => JSON.stringify(req.body))

// Morgan middleware with custom log format
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens["req-body"](req, res), // Include request body in log
    ].join(" ")
  })
)

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, "dist")))

// Hardcoded list of phonebook entries
const phonebookEntries = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
  {
    id: 5,
    name: "Luka Poppendieck",
    number: "33-23-6423122",
  },
  {
    id: 6,
    name: "Lena Poppendieck",
    number: "33-23-6423882",
  },
]

// Define API routes
app.get(baseUrl, (req, res) => {
  res.json(phonebookEntries)
})

app.get(`${baseUrl}/:id`, (req, res) => {
  const id = parseInt(req.params.id)
  const entry = phonebookEntries.find((entry) => entry.id === id)
  if (!entry) {
    return res.status(404).json({ error: "Person not found" })
  }
  res.json(entry)
})

// Other API routes go here...

// Endpoint for /info
app.get("/info", (req, res) => {
  const requestTime = new Date()
  const entryCount = phonebookEntries.length
  const infoMessage = `<p>Phonebook has info for ${entryCount} people</p>
                      <p>${requestTime}</p>`
  res.send(infoMessage)
})

// Endpoint to delete a phonebook entry by ID
app.delete(`${baseUrl}/:id`, (req, res) => {
  const id = parseInt(req.params.id)
  const index = phonebookEntries.findIndex((entry) => entry.id === id)
  if (index === -1) {
    return res.status(404).json({ error: "Person not found" })
  }
  const deletedEntry = phonebookEntries.splice(index, 1)
  res.json(deletedEntry[0])
})

// Endpoint to add a new phonebook entry
app.post(baseUrl, (req, res) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "Name and number are required" })
  }
  const nameExists = phonebookEntries.some((entry) => entry.name === body.name)
  if (nameExists) {
    return res.status(400).json({ error: "Name must be unique" })
  }
  const newEntry = {
    id: generateRandomId(),
    name: body.name,
    number: body.number,
  }
  phonebookEntries.push(newEntry)
  res.json(newEntry)
})

// Function to generate a random ID
function generateRandomId() {
  return Math.floor(Math.random() * 1000000)
}

// Simple route to test server
app.get("/", (req, res) => {
  res.send("Hello World!")
})

// Start the server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
