const mongoose = require("mongoose")

// Define the schema for phonebook entries
const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    minlength: [3, "Name must be at least 3 characters long."], // Ensure name is at least 3 characters long
  },
  number: String,
})

// Define the model using the schema
const Person = mongoose.model("Person", phonebookSchema)

// Validate command-line arguments
if (process.argv.length < 3 || process.argv.length > 5) {
  console.log("Usage:")
  console.log("To display all entries: node mongo.js <password>")
  console.log("To add a new entry: node mongo.js <password> <name> <number>")
  process.exit(1)
}

const password = process.argv[2]
const databaseName = "lukamilanovic"
const uri = `mongodb+srv://lukamilanovic:${password}@cluster0.aorxwdw.mongodb.net/${databaseName}`

// Connect to MongoDB Atlas
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const connection = mongoose.connection

// Error handling for MongoDB connection
connection.on("error", (error) => {
  console.error("Error connecting to MongoDB Atlas:", error)
  process.exit(1)
})

// Connection established successfully
connection.once("open", async () => {
  console.log("Connected to MongoDB Atlas")

  try {
    if (process.argv.length === 5) {
      // If password, name, and number are provided, add a new entry
      const name = process.argv[3]
      const number = process.argv[4]

      // Check if name length is at least 3 characters
      if (name.length < 3) {
        throw new Error("Name must be at least 3 characters long.")
      }

      // Create a new instance of the Person model with the provided name and number
      const newEntry = new Person({ name, number })

      // Validate the new entry
      await newEntry.validate()

      // Save the new entry
      await newEntry.save()

      console.log(`Added new entry: ${name} ${number}`)
    }
  } catch (error) {
    console.error("Error:", error.message)
    // Display error notification here
  } finally {
    mongoose.connection.close()
  }
})
