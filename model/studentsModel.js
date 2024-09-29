const mongoose = require('mongoose')

const Students = mongoose.model('Students',{
    sName : {
        type : String,
        required : true,
        trim:true
    },
    email:{
        type :String,
        required :true,
        trim:true
    },
    isAssigned : {
        type : Boolean,
        trim: true
    },
    mName : {
        type : String,
        trim : true
    },
    prev_mName :{
        type : String,
        trim :true
    }
})

module.exports = Students