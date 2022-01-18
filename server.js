
const express = require('express')
const session = require('express-session')
const app = express();
const mongoose = require('mongoose')
const mongoDBSession = require('connect-mongodb-session')(session)
const bcrypt = require('bcryptjs')


const UserModel = require('./models/user')

const port = process.env.PORT || 5000
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

const isAuth =(req,res,next)=>{
   if(req.session.isAuth){
       next()
   }else{
       res.redirect('/login')
   }
}
app.get('/',(req,res)=>{
    res.render('landing')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post("/login",async (req,res)=>{
    const {email, password}=req.body;
    // console.log(email)
    // console.log(password)
    const user = await UserModel.findOne({email})

    if(!user){
        return res.redirect('/login');
    } 
    console.log(user)

    const isMatch = user.password === password ;
    // const isMatch = true

    if(!isMatch){
        return res.redirect('/login')
    }
    req.session.isAuth=true
    res.redirect('/dashboard')
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.post("/register", async (req,res)=>{
    const {username,email,password} = req.body;
    let user = await UserModel.findOne({email})
    if(user){
         return res.redirect('/register')
    }

    
//    const hashedPsw = await bcrypt.hash(password,10)
  
   
   

    user = new UserModel({
        username,
        email,
        password,
    });

    await user.save()

    res.redirect("/login");
})

app.get("/dashboard",isAuth, (req,res)=>{
    res.render("dashboard")
})

app.post('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('/')
    })
})
app.listen(port,console.log('running'))