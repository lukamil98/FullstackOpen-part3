const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")

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

const PORT = 3001

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

// Endpoint to get phonebook entries
app.get("/api/persons", (req, res) => {
  res.json(phonebookEntries)
})

// Endpoint to get phonebook entries
app.get("/api/persons/:id", (req, res) => {
  const id = parseInt(req.params.id)
  // Find the entry with the given ID
  const entry = phonebookEntries.find((entry) => entry.id === id)

  // If the entry is not found, respond with a 404 status code
  if (!entry) {
    return res.status(404).json({ error: "Person not found" })
  }

  // Respond with the information for the found entry
  res.json(entry)
})

// Endpoint for /info
app.get("/info", (req, res) => {
  const requestTime = new Date()
  const entryCount = phonebookEntries.length

  const infoMessage = `<p>Phonebook has info for ${entryCount} people</p>
                      <p>${requestTime}</p>`

  res.send(infoMessage)
})

// Endpoint to delete a phonebook entry by ID
app.delete("/api/persons/:id", (req, res) => {
  const id = parseInt(req.params.id)
  // Find the index of the entry with the given ID
  const index = phonebookEntries.findIndex((entry) => entry.id === id)

  // If the entry is not found, respond with a 404 status code
  if (index === -1) {
    return res.status(404).json({ error: "Person not found" })
  }

  // Remove the entry from the phonebookEntries array
  const deletedEntry = phonebookEntries.splice(index, 1)

  // Respond with the deleted entry
  res.json(deletedEntry[0])
})

// Endpoint to add a new phonebook entry
app.post("/api/persons", (req, res) => {
  const body = req.body

  // Check if name or number is missing
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "Name and number are required" })
  }

  // Check if the name already exists in the phonebook
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
  // Use a big enough range to minimize the likelihood of duplicate IDs
  return Math.floor(Math.random() * 1000000)
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
