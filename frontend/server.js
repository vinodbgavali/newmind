require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const verifyToken = require('./middleware/verifyToken');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));






// Routes
app.get('/', (req, res) => res.render('login', { error: null }));
app.get('/register', (req, res) => res.render('register', { error: null }));
app.get('/login', (req, res) => res.render('login', { error: null }));
app.get('/dashboard',(req, res) => res.render('dashboard', { error: null }));
app.get('/folder/', (req, res) => res.render('folder', { error: null }));
app.get('/folder/:folderId', (req, res) => res.render('folder', {folderId : req.params.folderId, error: null }));
app.get('/document/:id', verifyToken,  (req, res) => res.render('document', { error: null }));
app.get('/filter', verifyToken, (req, res) => res.render('filter', { documents: [], search: '', error: null }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Frontend running on http://localhost:${PORT}`);
});