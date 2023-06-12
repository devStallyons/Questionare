import mongoose from 'mongoose';

let userSchema= new mongoose.Schema({
    email : { type: String, required: true }, 
    password :  { type: String, required: true },
    role :{ type: String },
})
userSchema.index({ email: 'text', role: 'text' });

export const userModel= mongoose.model("Users", userSchema);


const questionSchema = new mongoose.Schema({
  question: { type: String, required: true }, 
  answer: { type: String, required: true }, 
  createdOn: {type: Date, default: Date.now}
});


export const questionModel = mongoose.model('Question', questionSchema);




const mongodbURI = process.env.mongodbURI || "mongodb+srv://NewUser:awais123@cluster0.p8wthrf.mongodb.net/questionare?retryWrites=true&w=majority";

mongoose.connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongoose is connected");
  })
  .catch((error) => {
    console.log("Mongoose connection error: ", error);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => {
  console.log("Mongoose is disconnected");
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log("App is terminating");
  mongoose.connection.close(() => {
    console.log('Mongoose default connection closed');
    process.exit(0);
  });
});
