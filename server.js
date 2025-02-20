const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomNumber = require('random-number-csprng'); // Replace random with random-number-csprng

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());


let questions = require('./questions.json');
let users = {};

// Load users from users.json if it exists
const usersFilePath = path.join(__dirname, 'users.json');
if (fs.existsSync(usersFilePath)) {
  users = require(usersFilePath);
} else {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'brainbite09@gmail.com', // Replace with your email
    pass: 'aejc fvoy fgkh qkqd' // Replace with your app password
  }
});

// Function to generate OTP
async function generateOtp() {
  return await randomNumber(100000, 999999);
}

// Function to send OTP email
function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: 'brainbite09@gmail.com', // Replace with your email
    to: email,
    subject: 'Your OTP for Registration',
    text: `Your OTP for registration is: ${otp}. Please do not share it with anyone.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending OTP email:', error);
    } else {
      console.log('OTP email sent:', info.response);
    }
  });
}

// Function to validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

app.get('/api/questions', (req, res) => {
  console.log('Sending questions:', questions); // Debugging line
  res.json(questions);
});

app.get('/api/ai-questions', async (req, res) => {
  try {
    // Mock questions for the quiz
    const questions = [
      // Python questions
      {
        question: "What is the output of the following Python code: print(2 + 3 * 4)?",
        options: ["14", "20", "11", "None of the above"],
        correctAnswer: 0,
        type: "python"
      },
      {
        question: "What is the output of the following Python code: print(10 // 3)?",
        options: ["3", "3.33", "4", "None of the above"],
        correctAnswer: 0,
        type: "python"
      },
      {
        question: "Which of the following is a valid Python function definition?",
        options: ["def func():", "function func():", "func() =>", "None of the above"],
        correctAnswer: 0,
        type: "python"
      },
      {
        question: "What is the output of the following Python code: print(len('hello'))?",
        options: ["4", "5", "6", "None of the above"],
        correctAnswer: 1,
        type: "python"
      },
      {
        question: "Which of the following is a valid Python list?",
        options: ["[1, 2, 3]", "{1, 2, 3}", "(1, 2, 3)", "None of the above"],
        correctAnswer: 0,
        type: "python"
      },
      {
        question: "What is the output of the following Python code: print('hello'.upper())?",
        options: ["HELLO", "hello", "Hello", "None of the above"],
        correctAnswer: 0,
        type: "python"
      },
      {
        question: "Which of the following is a valid Python dictionary?",
        options: ["{'key': 'value'}", "{'key', 'value'}", "['key', 'value']", "None of the above"],
        correctAnswer: 0,
        type: "python"
      },
      {
        question: "What is the output of the following Python code: print(2 ** 3)?",
        options: ["6", "8", "9", "None of the above"],
        correctAnswer: 1,
        type: "python"
      },
      {
        question: "Which of the following is a valid Python tuple?",
        options: ["(1, 2, 3)", "[1, 2, 3]", "{1, 2, 3}", "None of the above"],
        correctAnswer: 0,
        type: "python"
      },
      {
        question: "Which of the following is a valid Python set?",
        options: ["{1, 2, 3}", "[1, 2, 3]", "(1, 2, 3)", "None of the above"],
        correctAnswer: 0,
        type: "python"
      },
      // HTML/CSS questions
      {
        question: "Which of the following is a valid HTML tag?",
        options: ["<div>", "<span>", "<p>", "All of the above"],
        correctAnswer: 3,
        type: "htmlcss"
      },
      {
        question: "Which of the following is a valid HTML attribute?",
        options: ["class", "id", "style", "All of the above"],
        correctAnswer: 3,
        type: "htmlcss"
      },
      {
        question: "Which of the following is a valid CSS property?",
        options: ["color", "font-size", "margin", "All of the above"],
        correctAnswer: 3,
        type: "htmlcss"
      },
      {
        question: "What is the correct HTML element for inserting a line break?",
        options: ["<br>", "<lb>", "<break>", "None of the above"],
        correctAnswer: 0,
        type: "htmlcss"
      },
      {
        question: "Which of the following is a valid CSS selector?",
        options: [".class", "#id", "element", "All of the above"],
        correctAnswer: 3,
        type: "htmlcss"
      },
      {
        question: "Which of the following is a valid HTML form element?",
        options: ["<input>", "<form>", "<button>", "All of the above"],
        correctAnswer: 3,
        type: "htmlcss"
      },
      {
        question: "Which of the following is a valid CSS color value?",
        options: ["#ff0000", "rgb(255, 0, 0)", "red", "All of the above"],
        correctAnswer: 3,
        type: "htmlcss"
      },
      {
        question: "Which of the following is a valid HTML table element?",
        options: ["<table>", "<tr>", "<td>", "All of the above"],
        correctAnswer: 3,
        type: "htmlcss"
      },
      {
        question: "Which of the following is a valid CSS display value?",
        options: ["block", "inline", "flex", "All of the above"],
        correctAnswer: 3,
        type: "htmlcss"
      },
      {
        question: "Which of the following is a valid HTML image element?",
        options: ["<img>", "<image>", "<pic>", "None of the above"],
        correctAnswer: 0,
        type: "htmlcss"
      },
      // C questions
      {
        question: "What is the size of an int in C?",
        options: ["2 bytes", "4 bytes", "8 bytes", "Depends on the system"],
        correctAnswer: 3,
        type: "c"
      },
      {
        question: "Which of the following is a valid C data type?",
        options: ["int", "float", "char", "All of the above"],
        correctAnswer: 3,
        type: "c"
      },
      {
        question: "Which of the following is a valid C loop statement?",
        options: ["for", "while", "do-while", "All of the above"],
        correctAnswer: 3,
        type: "c"
      },
      {
        question: "What is the correct syntax for a C function definition?",
        options: ["returnType functionName(parameters) { }", "function functionName(parameters) { }", "def functionName(parameters):", "None of the above"],
        correctAnswer: 0,
        type: "c"
      },
      {
        question: "Which of the following is a valid C conditional statement?",
        options: ["if", "else", "switch", "All of the above"],
        correctAnswer: 3,
        type: "c"
      },
      {
        question: "Which of the following is a valid C array declaration?",
        options: ["int arr[10];", "int arr = [10];", "int arr(10);", "None of the above"],
        correctAnswer: 0,
        type: "c"
      },
      {
        question: "Which of the following is a valid C pointer declaration?",
        options: ["int *ptr;", "int ptr*;", "int &ptr;", "None of the above"],
        correctAnswer: 0,
        type: "c"
      },
      {
        question: "Which of the following is a valid C string declaration?",
        options: ["char str[] = 'hello';", "char str[] = \"hello\";", "char str = 'hello';", "None of the above"],
        correctAnswer: 1,
        type: "c"
      },
      {
        question: "Which of the following is a valid C structure declaration?",
        options: ["struct { int x; } s;", "struct s { int x; };", "struct s { int x; } s;", "All of the above"],
        correctAnswer: 3,
        type: "c"
      },
      {
        question: "Which of the following is a valid C preprocessor directive?",
        options: ["#include", "#define", "#ifdef", "All of the above"],
        correctAnswer: 3,
        type: "c"
      }
    ];
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, username, email, password, rememberMe } = req.body;
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ error: 'Please fill in all fields' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const otp = await generateOtp(); // Generate a 6-digit OTP
    console.log(`Generated OTP for ${email}: ${otp}`); // Debugging line
    sendOtpEmail(email, otp); // Send OTP email

    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { fullName, email, password: hashedPassword, otp };
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    res.status(201).json({ message: 'User registered successfully. Please check your email for the OTP.', rememberMe });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const user = users[username];
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful', username, rememberMe });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to log in user' });
  }
});

app.post('/api/questions', (req, res) => {
  const newQuestion = req.body;
  questions.push(newQuestion);
  fs.writeFileSync(path.join(__dirname, 'questions.json'), JSON.stringify(questions, null, 2));
  res.status(201).json(newQuestion);
});

app.put('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const updatedQuestion = req.body;
  questions[questionId] = updatedQuestion;
  fs.writeFileSync(path.join(__dirname, 'questions.json'), JSON.stringify(questions, null, 2));
  res.json(updatedQuestion);
});

app.delete('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  questions.splice(questionId, 1);
  fs.writeFileSync(path.join(__dirname, 'questions.json'), JSON.stringify(questions, null, 2));
  res.status(204).end();
});

app.post('/api/save-progress', (req, res) => {
  const { username, progress } = req.body;
  if (!users[username]) {
    return res.status(400).json({ error: 'User not found' });
  }
  users[username].progress = progress;
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  res.status(200).json({ message: 'Progress saved successfully' });
});

app.get('/api/load-progress/:username', (req, res) => {
  const { username } = req.params;
  if (!users[username]) {
    return res.status(400).json({ error: 'User not found' });
  }
  res.status(200).json(users[username].progress || {});
});

app.post('/api/verify-otp', (req, res) => {
  const { username, otp } = req.body;
  const user = users[username];
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }
  console.log(`Verifying OTP for ${username}: ${otp}`); // Debugging line
  if (user.otp !== parseInt(otp, 10)) {
    console.error(`Invalid OTP for ${username}: ${otp}`); // Debugging line
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  delete user.otp; // Remove OTP after verification
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  res.status(200).json({ message: 'OTP verified successfully. You can now log in.' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
