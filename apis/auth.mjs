import express from 'express';
import { userModel,  otpModel } from '../dbRepo/model.mjs';
// import {
//     stringToHash,
//     varifyHash,
// } from "bcrypt-inzi"
// import jwt from 'jsonwebtoken';
// import SendEmail from "./sendingMails/sendMails.mjs";
// import { nanoid, customAlphabet } from 'nanoid'
const SECRET = process.env.SECRET || "topsecret";




// dotenv.config()
const router = express.Router()



   
router.post("/api/login", (req, res) =>{
        
       let body = req.body;
       body.email = body.email.toLowerCase();
   
       if (!body.email || !body.password) { // null check - undefined, "", 0 , false, null , NaN
           res.status(400).send(
               `required fields missing, request example: 
                   {
                       "email": "abc@abc.com",
                       "password": "12345"
                   }`
           );
           return;
       }
   
      // check if user exist
   
      userModel.findOne({email: body.email},
       "role email password ",
       (err, data) =>{
           if(!err){
               console.log("data: ", data);
           
           //user found
           if(data) {
               (body.password, data.password).then(isMatched =>{
                   console.log("isMatched: ", isMatched);
   
                   if(isMatched){
                    //    const token = jwt.sign ({
                    //      _id : data._id,
                    //       email: data.email,
                    //       iat: Math.floor(Date.now() / 1000) - 30,
                    //       exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
   
   
                    //    },SECRET)
                    //    console.log("token: ", token);
                    //    res.cookie("Token", token,{
                    //        maxAge: 86_400_000,
                    //        httpOnly: true
                    //    });
   
                       res.send({
                           message: "Login Succesful",
                           profile: {
                               email: data.email,
                               role: data.role,
                               age: data.age,
                               _id: data._id
                           }
                        });
                        return;
   
                   } else{
                       console.log("password did not match");
                       res.status(401).send({ message: "Incorrect email or password" });
                       return;
                   }
                   
   
               });
   
           } else{
               console.log("user not found");
               res.status(401).send({ message: "user not found" });
               return;
           }
           }
           else {
               console.log("db error: ", err);
               res.status(500).send({ message: "login failed, please try later" });
               return;
           }
       });
   
   
   });
   
// router.post("/logout", (req, res) =>{
//        res.cookie('Token', '', {
//            maxAge: 1,
//            httpOnly: true,
//            sameSite: 'none',
//            secure: true
//        }); 
//        res.send({message: "logout successfully"})
//    });


//    router.post('/forget-password', async (req, res) => {


//     try {

//         let body = req.body;
//         body.email = body.email.toLowerCase();

//         if (!body.email) { // null check - undefined, "", 0 , false, null , NaN
//             res.status(400).send(
//                 `required fields missing, request example: 
//                 {
//                     "email": "abc@abc.com",
//                 }`
//             );
//             return;
//         }

//         // check if user exist
//         const user = await userModel
//         .findOne({ email: body.email }, "firstName email password")
//         .exec();
//       if (!user) throw new Error("User not found");
//       const nanoid = customAlphabet("1234567890", 5);
//       const OTP = nanoid();
//     //   console.log(OTP);
  
//       await SendEmail ({
//         email: body.email,
//         subject: `Froget password Email`,
//         text: `Your  forget password OTP code  ${OTP} Please Don't Share this code`,
//       });
//       const hashOTP = await stringToHash(OTP);
//       otpModel.create({ otp: hashOTP, email: body.email });
//       res.send({
//         message: "OTP sent check email",
//       });
//       return;
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({ message: error });                      
//     }
//   });





// router.post('/check-otp', async (req, res) => {
//     try {

//         let body = req.body;
//         body.email = body.email.toLowerCase();
       
//         if (!body.email || !body.otp || !body.newPassword) { // null check - undefined, "", 0 , false, null , NaN
//             res.status(400).send(
//                 `required fields missing, request example: 
//                 {
//                     "email": "abc@abc.com",
//                     "otp": "12345",
//                     "newPassword": "someSecretString",
//                 }`
//             );
           
           
//             return;
//         }
//      console.log(body.otp)
//         // check if otp exist
//         const otpRecord = await otpModel.findOne(
//             { email: body.email }
//         )
//             .sort({ _id: -1 })
//             .exec()

//             console.log("otpRecord:" ,otpRecord)
//             if (!otpRecord) throw new Error("Invalid OTP");
//             if (otpRecord.isUsed) throw new Error("Invalid OTP");
//             await otpModel.updateOne({ isUsed: true }).exec();
        
//             // is se otp 5 minutes bad use nahi hoge
//             const now = moment();
//             const otpCreatedTime = moment(otpRecord.createdOn);
//             const differenceInMin = now.diff(otpCreatedTime, "minutes");
        
//             if (differenceInMin >= 5) throw new Error("Invalid OTP");
        
//             const isMatched = await varifyHash(body.otp, otpRecord.otp);
//             if (!isMatched) throw new Error("Invalid OTP ");
        
//             const newhashPassword = await stringToHash(body.newPassword);
//             await userModel
//               .updateOne({ email: body.email }, { password: newhashPassword })
//               .exec();
//             res.send({
//               message: "password changed success",
//             });
//             return;

//     } catch (error) {
//         console.log("error: ", error);
//         res.status(500).send({
//             message: error.message
//         })
//     }



// })


export default router