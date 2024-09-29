require('./db/mongoose_connection')

const Students = require('./model/studentsModel')
const Mentor = require('./model/mentorModel')

const express = require('express')
const app = express()
const port = 8888

// middleware
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("Welcome!!!")
})

//API 1 - create mentor
app.post('/createMentor',async(req,res)=>{
   let exists = await Mentor.find({'mName':req.body.mName})
   if(exists){
        res.send("Trying creating with a different one!!")
   } else {
        let mData = new Mentor({
            mName : req.body.mName,
            technology : req.body.technology,
            experience : req.body.experience,
            students_assigned : []
    })
    mData.save().then((data)=>res.send(data))
   }
}) 

//API 2 - create student
app.post('/createStudent',async(req,res)=>{
    let exists = await Students.findOne({'sName':req.body.sName})
   if(exists){
        res.send("Trying creating with a different one!!")
   } else {
        let sData = new Students({
            sName : req.body.sName,
            email :req.body.email,
            isAssigned : false,
            mName : "",
            prev_mName : ""
        })
        sData.save().then((data)=>res.send(data))
   }
}) 

//API 3 - assign student to mentor
app.put('/assignStudent/:mentorName',async(req,res)=>{
    // one or more students cand be choosen so assuming students as query strings
    // list of students who are not mentee to any mentor
   let sData = await Students.find({'isAssigned' : false},{sName:1,_id:0})
   let list =[]
   for(i in sData){
    list.push(sData[i].sName)
   }
//    console.log("list",list)
//    res.send(`Students available to assign - ${list}`)
  //assigning students to mentor
  let students = [...req.query.students]
  let count =0
//   console.log("students",students)
  for(let i=0;i<students.length;i++){
    for(j=0;j<list.length;j++){
        if(students[i] == list[j]){
            count++
        }
    }
  }
  if(count == students.length){
    let data = await Mentor.findOne({'mName' : req.params.mentorName})
    let updated_mentee =  [...data.students_assigned,...students]
    let updated_data = await Mentor.findOneAndUpdate({'mName':req.params.mentorName},{$set : {'students_assigned' : updated_mentee}})
    for(let i=0;i<students.length;i++){
        let update_students1 = await Students.findOneAndUpdate({'sName':students[i]},{$set : {'isAssigned' : true}})
        let update_students2 = await Students.findOneAndUpdate({'sName':students[i]},{$set : {'mName': req.params.mentorName}})
    }
    res.send("success") 
  } else {
    res.send(`Students are already assigned to mentee.please refer Students List \n ${list}`)
  }

})

//API 4 - Assign / change mentor

app.put('/changeMentor/:studentName/:mentorName',async(req,res)=>{
        // validations
        let isValidsName = await Students.findOne({'sName': req.params.studentName})
        let isValidmName = await Mentor.findOne({'mName' : req.params.mentorName})
        
        if(isValidmName && isValidsName){
            let sData = await Students.findOne({'sName': req.params.studentName})
            if(sData.isAssigned){
                // updating prev_mName
                let prev_mName = sData.mName
                let updatePrev_mName = await Students.findOneAndUpdate({'sName' : req.params.studentName} ,{$set : {'prev_mName' : prev_mName}})
                // deleting student from mentee list
                let temp = await Mentor.findOne({'mName' : sData.mName})
                const list = temp.students_assigned 
                const newlist = list.filter(e=>e != req.params.studentName)
                let updateMenteeList = await Mentor.findOneAndUpdate({'mName' : sData.mName} ,{$set : {'students_assigned' : newlist}})
                // updating Mentor Name
                let setNewmentor = await Students.findOneAndUpdate({'sName': req.params.studentName},{$set : {'mName' : req.params.mentorName }})
                // updating student name in the mentor db
                let newMentor = await Mentor.findOne({'mName' : req.params.mentorName})
                let newMenteeList =[ ...newMentor.students_assigned,req.params.studentName]
                let setMentee  = await Mentor.findOneAndUpdate({'mName' : req.params.mentorName},{$set : {'students_assigned' : newMenteeList}})
                res.send("Success")
            } else if(!sData.isAssigned) { 
                // updating Mentor Name
                let setNewmentor = await Students.findOneAndUpdate({'sName': req.params.studentName},{$set : {'mName' : req.params.mentorName }})
                // updating student name in the mentor db
                let newMentor = await Mentor.findOne({'mName' : req.params.mentorName})
                let newMenteeList =[ ...newMentor.students_assigned,req.params.studentName]
                let setMentee  = await Mentor.findOneAndUpdate({'mName' : req.params.mentorName},{$set : {'students_assigned' : newMenteeList}})
                // updating bool value to true
                if(setNewmentor){
                    let setBool = await Students.findOneAndUpdate({'sName': req.params.studentName},{$set : {'isAssigned' : true }})
                } 
                res.send("Success")
            } else {
                res.send("Invalid Student Name")
            }
        } else {
            res.send("Invalid Student/Mentor")
        }
    
})

//API 5 - getStudentsByMentorName
app.get('/getStudentsByMentorName/:mentorName',async(req,res)=>{
   const mentorData = await Mentor.find({'mName':req.params.mentorName})
   const temp = mentorData[0]
   if(temp){
    
        if(temp.students_assigned){
            res.send(temp.students_assigned)
        } else {
            res.send("No mentee for this mentor")
        }
   } else {
        res.send("Mentor Not found in DB")
   }
   
})

//API 6 - previous Mentor
app.get('/previousMentor/:studentName',async (req,res)=>{
    const prevData = await Students.find({'sName' : req.params.studentName})
    const temp = prevData[0]
    if(temp){
        if(temp.prev_mName){
            res.send(`Previous Mentor for ${req.params.studentName} - ${temp.prev_mName}`)
        } else {
            res.send("No mentor assigned earlier")
        }
    }  else{
        res.send("Student not found in DB")
    }
})

app.listen(port,()=>{
    console.log("Server Started")
})