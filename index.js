require("dotenv").config() // Load the password from .env file

const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const path = require("path")
const mongoose = require("mongoose")

const app = express()
const baseUrl = "/api/persons" // Defined the base URL here

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
      tokens["req-body"](req, res), // Included request body in log
    ].join(" ")
  })
)

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, "dist")))

// Enable CORS for specific origin and methods
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}
app.use(cors(corsOptions))

// Function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}

// Connect to MongoDB Atlas
const uri = `mongodb+srv://lukamilanovic:${process.env.MONGODB_PASSWORD}@cluster0.aorxwdw.mongodb.net/lukamilanovic`
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
const connection = mongoose.connection
connection.once("open", () => {
  console.log("Connected to MongoDB Atlas")
})

// Define Mongoose schema and model for phonebook entries
const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

// Modify the toJSON method of the schema to transform _id into id
phonebookSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})
const PhonebookEntry = mongoose.model("PhonebookEntry", phonebookSchema)

// Define API routes
app.get(baseUrl, async (req, res) => {
  try {
    const phonebookEntries = await PhonebookEntry.find({})
    res.json(phonebookEntries)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Route handler for adding a new person
app.post(baseUrl, async (req, res) => {
  try {
    const { name, number } = req.body // Extract name and number from request body
    const newEntry = new PhonebookEntry({ name, number }) // Create a new phonebook entry
    const savedEntry = await newEntry.save() // Save the new entry to the database
    res.status(201).json(savedEntry) // Respond with the saved entry and status code 201 (Created)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Route handler for deleting a person by ID
app.delete(`${baseUrl}/:id`, async (req, res) => {
  try {
    const id = req.params.id // Extract the ID from the request parameters
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "ID parameter is missing" })
    }

    // Use the extracted ID to delete the entry
    const deletedEntry = await PhonebookEntry.findByIdAndDelete(id)
    if (!deletedEntry) {
      return res.status(404).json({ error: "Person not found" })
    }

    // Respond with a success message and status code 204 (No Content) to indicate successful deletion
    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Route handler for updating a person's information by ID
app.put(`${baseUrl}/:id`, async (req, res) => {
  try {
    const id = req.params.id // Extract the ID from the request parameters
    const { name, number } = req.body // Extract the updated name and number from the request body
    const updatedEntry = await PhonebookEntry.findByIdAndUpdate(
      id,
      { name, number },
      { new: true } // Set { new: true } to return the updated entry
    )
    if (!updatedEntry) {
      // If the entry with the given ID doesn't exist, respond with 404 (Not Found)
      return res.status(404).json({ error: "Person not found" })
    }
    // Respond with the updated entry and status code 200 (OK)
    res.status(200).json(updatedEntry)
  } catch (error) {
    console.error(error)
    // If there's an error, respond with status code 500 (Internal Server Error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Start the server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
