const mongoose = require("mongoose")

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
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

const connection = mongoose.connection

// Error handling for MongoDB connection
connection.on("error", (error) => {
  console.error("Error connecting to MongoDB Atlas:", error)
  process.exit(1)
})

// Connection established successfully
connection.once("open", async () => {
  console.log("Connected to MongoDB Atlas")

  // Define Mongoose schema and model for phonebook entries
  const phonebookSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required."], // Specify required and default error message
      minlength: [3, "Name must be at least 3 characters long."], // Specify minlength and default error message
    },
    number: String,
  })

  // Define model
  const Person = mongoose.model("Person", phonebookSchema)

  try {
    if (process.argv.length === 3) {
      // If only password is provided, display all entries
      const entries = await Person.find({})
      console.log("All Entries:")
      entries.forEach((entry) => {
        console.log(entry.name, entry.number)
      })
    } else if (process.argv.length === 5) {
      // If password, name, and number are provided, add a new entry
      const name = process.argv[3]
      const number = process.argv[4]
      const newEntry = new Person({ name, number })
      try {
        await newEntry.validate() // Validate the new entry
        await newEntry.save()
        console.log(`Added new entry: ${name} ${number}`)
      } catch (error) {
        console.error("Validation Error:", error.message)
      }
    }
  } catch (error) {
    console.error("Error:", error.message)
  } finally {
    mongoose.connection.close()
  }
})
