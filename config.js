module.exports = {
  mongoURI:
    process.env.MONGODB_URI ||
    `mongodb+srv://lmilanovic86:${process.env.MONGODB_PASSWORD}@cluster0.h60ndox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
}
