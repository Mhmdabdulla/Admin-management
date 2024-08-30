const express = require('express')
const app = express()
const hbs = require('hbs')
const session = require('express-session')
const bodyparser = require('body-parser')
const path = require('path')
const collection = require('./src/userdb');
const{ ObjectId,MongoClient }= require('mongodb')
const cookieParser = require('cookie-parser')

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json()) 
//app.use(cookieParser());

app.use(session({
    secret: 'your_secret_key', // Replace with your secret key
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false,// Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24
     } 
}))

app.set('view engine','hbs');
app.set('views',path.join(__dirname,'views'))

const admin = {
    username:"admin",
    pssword:"admin@123"
}


app.get('/admin/login',(req,res)=>{
    if(req.session.admin){
      res.redirect('/admin/panel');
     
      
    }
    else{
      
      res.render('AdminLogin')
      
    }
 
     
    
    
})

app.post('/admin/login',(req,res)=>{
    const {username,password} = req.body;

    if(!username||!password){
        return res.render('AdminLogin',{error:'username and password are required'})
    }

    if(username === admin.username && password === admin.pssword){
        req.session.admin = true;
        return res.redirect('/admin/panel')
        }
        else{
            
            return res.render('AdminLogin',{error:'invalid username or password'})
        }
    })

    app.get("/admin/panel",(req,res)=>{
        if(req.session.admin){
            res.render('AdminPanel',{username:admin.username})
           
        }
        else{
            res.redirect('/admin/login')
            
        }
    })
    app.get('/admin/logout',(req,res)=>{
        req.session.destroy((err)=>{
            if(err){console.log(err)}

            res.redirect('/admin/login')
        })
    })

    //router for userdetails page
app.get('/admin/users',async (req,res)=>{
  
    if(req.session.admin){
        res.render('userList',{users:await collection.find()})
    }
    else{
        res.redirect('/admin/login')
    }
})

//route to handle search
app.post('/admin/users/search', async (req, res) => {
    const { query } = req.body;
    if (req.session.admin) {
      const results = await collection.find({$or:[{name:new RegExp(query,'i')},{email:new RegExp(query,'i')}]})
      
      res.render('userList', { users: results, query });
    } else {
      res.redirect('/admin/login');
    }
  });

  
//route for create newuser form
app.get('/admin/users/create',(req,res)=>{
    if(req.session.admin){
        res.render('createUser')
    }
    else{
        res.redirect('/admin/login')
    }
})

//route for create
app.post('/admin/users/create',async (req,res)=>{
  const userData ={
    name:req.body.name,
    age:req.body.age,
    email:req.body.email
  }
    console.log(userData)
    if(req.session.admin){
          await collection.insertMany([userData])
          res.redirect('/admin/users')
    }
    else{
        res.redirect('/admin/login')
    }
});
//route for display form for edit
app.get('/admin/users/edit/:id', async (req, res) => {
  const { id } = req.params;
  
  if (req.session.admin) {
    try {
      const user = await collection.findById(id);
      if (user) {
        res.render('editUser', { user });
      } else {
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Error occurred while fetching user details');
    }
  } else {
    res.redirect('/admin/login');
  }
});

//route for edit
app.post('/admin/users/edit/:id',  async (req, res) => {
    const {id}= req.params;
    const {name,age,email } = req.body;
    
    if (req.session.admin) {
      await collection.updateOne({_id:id},{$set:{name:name,age:age,email:email}})

      
      res.redirect('/admin/users');
    } else {
      res.redirect('/admin/login');
    }
  });

//route for delete
app.post('/admin/users/delete/:id', async (req, res) => {
  const {id} = req.params;  
try {
  if (req.session.admin) {
    await collection.deleteOne({_id :new  ObjectId(id)})// converting id to object id
    
    res.redirect('/admin/users');
  } else {
    res.redirect('/admin/login');
  }

  
} catch (error) {
  console.log(error)
}
}); 




app.listen('4000',()=>{console.log('server is running on port 4000')})

  