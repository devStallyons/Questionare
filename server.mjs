import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
const app = express()
import cookieParser from 'cookie-parser';
import { userModel , questionModel } from './dbRepo/model.mjs';
// import AuthApis from './apis/auth.mjs'
const port = process.env.PORT || 5001
import cookie from 'cookie'
mongoose.set('strictQuery', true);


const SECRET = process.env.SECRET || "topsecret";



app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: ['http://localhost:3000', 'https://localhost:3000', "*"],
    credentials: true
}));


// app.use('/api/v1', AuthApis)



app.post("/api/login", async (req, res) => {
  try {
    let body = req.body;
    body.email = body.email.toLowerCase();

    if (!body.email || !body.password) {
      res.status(400).send(`Required fields missing`);
      return;
    }

    // Check if user exists
    const user = await userModel.findOne({ email: body.email }, "email role password ");

    if (user) {
      const isMatched = await body.password == user.password;

      if (isMatched) {
        res.status(200).send({
          message: "Login Successful",
          profile: {
            email: user.email,
            role: user.role,
            // age: user.age,
            _id: user._id
          }
        });
      } else {
        res.status(401).send({ message: "Incorrect email or password" });
      }
    } else {
      res.status(401).send({ message: "User not found" });
    }
  } catch (err) {
    console.log("DB error: ", err);
    res.status(500).send({ message: "Login failed, please try later" });
  }
});
   

app.get("/api/users", async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).send(users)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.post("/api/question", async (req, res) => {
//   try {
//     // Validate the input
//     if (!req.body.question || !req.body.answer) {
//       res.status(400).json({ error: "Invalid input" });
//       return;
//     }

//     const answer = req.body.answer; // Single answer

//     // Create a new question using the questionModel
//     const save = await questionModel.create({
//       question: req.body.question,
//       answer: answer
//     });

//     console.log("save: ", save);

//     res.status(200).json({ message: "Question saved successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while saving the question" });
//   }
// });

app.post("/api/question", async (req, res) => {
  try {
    // Validate the input
    if (!req.body.question || !req.body.answer || isNaN(req.body.answer)) {
      res.status(400).json({ error: "Answer must be a number." });
      return;
    }

    const answer = parseInt(req.body.answer); // Convert answer to an integer

    // Create a new question using the questionModel
    const save = await questionModel.create({
      question: req.body.question,
      answer: answer
    });

    console.log("save: ", save);

    res.status(200).json({ message: "Question saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while saving the question" });
  }
});



app.delete("/api/question/:id", async (req, res) => {
  try {
    const deletedQuestion = await questionModel.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting the question" });
  }
});


app.put("/api/question/:id", async (req, res) => {
  try {
    const updatedQuestion = await questionModel.findByIdAndUpdate(
      req.params.id,
      {
        question: req.body.question,
        answer: req.body.answer
      },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.status(200).json({ message: "Question updated successfully", question: updatedQuestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the question" });
  }
});


app.get("/api/questions", async (req, res) => {
  try {
    const questions = await questionModel.find();
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while retrieving questions");
  }
});




app.get("/api/random-question", async (req, res) => {
  try {
    const numQuestions = parseInt(req.query.num) || 1; // Number of questions to retrieve (default: 1)
    const questions = await questionModel.aggregate([{ $sample: { size: numQuestions } }]);
    
    if (questions.length === 0) {
      res.status(404).json({ error: "No questions found" });
      return;
    }
    
    const randomQuestions = questions.map((question) => ({
      id: question._id,
      question: question.question
    }));
    
    res.json({ questions: randomQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while retrieving random questions" });
  }
});




// const shownQuestions = []; // Array to store the IDs of shown questions

// app.get("/api/random-question", async (req, res) => {
//   try {
//     const numQuestions = parseInt(req.query.num) || 1; // Number of questions to retrieve (default: 1)
    
//     const questions = await questionModel.aggregate([
//       { $match: { _id: { $nin: shownQuestions } } }, // Exclude already shown questions
//       { $sample: { size: numQuestions } }
//     ]);

//     if (questions.length === 0) {
//       res.status(404).json({ error: "No questions found" });
//       return;
//     }
    
//     const randomQuestions = questions.map((question) => ({
//       id: question._id,
//       question: question.question
//     }));

//     // Add the IDs of the shown questions to the array
//     randomQuestions.forEach((question) => {
//       shownQuestions.push(question.id);
//     });
    
//     res.json({ questions: randomQuestions });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while retrieving random questions" });
//   }
// });

app.post('/api/submit-answers', async (req, res) => {
  if (!body.answers) {
    res.status(400).send(`Required fields missing`);
    return;
  }
  const answers = req.body.answers;
  let correctAnswers = 0;

  try {

    for (const [questionId, answer] of Object.entries(answers)) {
      const { min, max } = answer;

      const question = await questionModel.findById(questionId);
      if (!question) {
        console.log(`Question ${questionId} not found`);
        continue;
      }

      const actualAnswer = question.answer;

      if (min <= actualAnswer && actualAnswer <= max) {
        console.log(`Question ${questionId}: Correct`);
        correctAnswers++;
      } else {
        console.log(`Question ${questionId}: Wrong`);
      }
    }

    const score = Math.floor((correctAnswers / Object.keys(answers).length) * 100);
    res.json({ message: `Your score is ${score}` });
  } catch (error) {
    console.error('Failed to submit answers:', error);
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});



const __dirname = path.resolve();
// app.use('/', express.static(path.join(__dirname, './twitter/build')))
// app.use('*', express.static(path.join(__dirname, './twitter/build')))

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// THIS IS THE ACTUAL SERVER WHICH IS RUNNING



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})