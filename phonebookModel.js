const mongoose = require("mongoose")

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3, // Minimum length requirement for the name field
  },
  number: String,
  _id: mongoose.Schema.Types.ObjectId,
})

const PhonebookEntry = mongoose.model("PhonebookEntry", phonebookSchema)

module.exports = PhonebookEntry
