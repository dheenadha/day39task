const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/task').then(()=>{
    console.log("Connected to db")
})