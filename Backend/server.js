const express=require('express');
const connectDB = require('./config/db');
const UserRouter = require('./routes/user.routes');

require('dotenv').config()

const app=express();

connectDB();

app.use(express.json());

app.use('/api', UserRouter)

// app.use('/',BookingRouter)

app.use((req,res)=>{
    res.status(400).json({msg: 'Undefined route'})
});

app.listen(process.env.PORT,()=>{
    console.log('Server started at port ',process.env.PORT);
})