const mongoose = require('mongoose')

const Mentor = mongoose.model('Mentor',{
    mName : {
        type : String,
        required : true,
        trim :  true
    },
    technology:{
        type : String,
        required : true,
        trim :true
    },
    experience:{
        type : String,
        required :true,
        trim :true
    },
    students_assigned :{
        type : Array,
        trim:true
    }
})

module.exports = Mentor