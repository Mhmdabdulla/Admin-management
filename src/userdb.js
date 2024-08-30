const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/userdb")
.then(()=>console.log('database connected'))
.catch(()=>console.log('there is an error'))

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    }
})

const collection = new mongoose.model("collection1",userSchema);
module.exports = collection;