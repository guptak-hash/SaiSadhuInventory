const mongoose=require('mongoose');
require('dotenv').config();

const connectDB=()=>{
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('DB connection success ')
}).catch((err)=>{
    console.log('DB connection fail')
})
}

module.exports=connectDB