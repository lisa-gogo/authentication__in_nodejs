
const express = require('express')
const session = require('express-session')
const app = express();
const mongoose = require('mongoose')
const mongoDBSession = require('connect-mongodb-session')(session)
const bcrypt = require('bcryptjs')

const UserModel = require('./models/user')

mongoose.connect('mongodb+srv://lisa:lisa@cluster0.y7ebr.mongodb.net/sessions?retryWrites=true&w=majority')
.then(res=>{
    console.log('MongoDB connected')
})


const store = new mongoDBSession({
    uri:'mongodb+srv://lisa:lisa@cluster0.y7ebr.mongodb.net/sessions?retryWrites=true&w=majority',
    collection:'mySessions'
})

app.set('view engine',"ejs")
app.use(express.urlencoded({extended:true}))
app.use(
    session({
        secret :'key that will sign',
        resave:false,//'for every server we want to create new session',
        saveUninitialized:false,
        store: store,

    })
)
// app.get('/',(req,res)=>{
//     req.session.isAuth=true
//     console.log(req.session)
//     console.log(req.session.id)
//     res.send('Hello')
// });
app.get('/',(req,res)=>{
    res.render('landing')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post("/login",(req,res)=>{})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.post("/register", async (req,res)=>{
    const {username,email,password} = req.body;
    let user = await UserModel.findOne({email})
    if(user){
        return res.redirect('/register')
    }
    
    
   const hashedPsw = await bcrypt.hash(password,12) 

    user = new UserModel({
        username,
        email,
        hashedPsw
    });

    await user.save()

    res.redirect("/login");
})

app.get("/dashboard",(req,res)=>{
    res.render("dashboard")
})
app.listen(5000,console.log('running'))