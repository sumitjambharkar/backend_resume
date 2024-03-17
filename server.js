const express = require('express');
const cors = require('cors');
const passport = require('passport');
const Database = require("./Database");
const Resume = require("./model/Resume");
const puppeteer = require('puppeteer');
const session = require('express-session');
const htmlPdf = require('html-pdf');
const pdfLib = require('pdf-lib');
const dotenv = require('dotenv');
dotenv.config()
require("./passport")
const app = express();
const port = 3009 || process.env.PORT;

const corsOptions = {
    origin: ['http://localhost:5173','https://resumeone.vercel.app'],
    methods:"POST,GET",
    Credential:true
};

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(express.json())
app.use(cors(corsOptions))

app.use(passport.initialize());
app.use(passport.session());

Database()

app.get('/', (req, res) => {
    res.send('Hello, World! This is your Express server.');
});


app.post('/create-resume', async (req, res) => {
    try {
        await Resume.create({
            name: req.body.name,
            image: req.body.image,
            content: req.body.content
        })
        res.json({ message: "Added Resume" })
    } catch (error) {
        res.json({ message: "error",error})
    }
});

app.get('/show-resume', async (req, res) => {
    try {
        const data = await Resume.find({},"_id name image");
        res.json(data);
    } catch (error) {
        res.json({ message: "error" });
    }
});


app.get('/single-resume/:id', async (req, res) => {
    try {
        const data = await Resume.findById({_id:req.params.id})
        res.json(data)
    } catch (error) {
        res.json({ message: "error" })
    }
});

app.put('/update-resume/:id', async (req, res) => {
    try {
        const updatedResume = await Resume.findByIdAndUpdate(
            req.params.id,
            { content: req.body.text },
            { new: true }
        );
        res.json(updatedResume);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating resume" });
    }
});


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('http://localhost:5173');
});

app.post('/convertToPdf', async (req, res) => {

    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    await page.setViewport({
        width:595,
        height: 842, // A4 size in pixels
        deviceScaleFactor: 1,
    });

    await page.setContent(req.body.htmlContent);

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
