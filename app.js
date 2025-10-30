require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectToDatabase = require('./lib/mongodb');
const Aircraft = require('./models/aircraft');
const User = require('./models/user');
const Inquiry = require('./models/inquiry');

const app = express();
const port = 3000;

// Connect to MongoDB
connectToDatabase().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});

// --- Middleware ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));

// --- Session Configuration with MongoDB Store ---
app.use(session({
  secret: 'mongodb+srv://aerolux_user:mypassword@cluster0.shhw6yy.mongodb.net/aerolux_db?appName=Cluster0' || 'a-very-secret-key-that-should-be-in-env-file',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production', // use secure cookies in production
    httpOnly: true
  }
}));

// Middleware to make user session available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// --- Authentication Middleware (DISABLED) ---
const requireLogin = (req, res, next) => {
    // Authentication disabled - allow all access
    next();
};

// --- Routes ---

app.get('/', (req, res) => res.render('index'));

// Disabled authentication routes (commented out for now)
/*
app.get('/register', (req, res) => res.render('register'));

app.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        // Use lower salt rounds for serverless (faster)
        const saltRounds = process.env.NODE_ENV === 'production' ? 8 : 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const newUser = await User.create({
            full_name: fullName,
            email: email,
            password_hash: passwordHash
        });
        
        req.session.user = {
            id: newUser._id,
            full_name: newUser.full_name,
            email: newUser.email
        };
        res.redirect('/aircraft');
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            res.status(500).send('Error registering user. The email is already in use.');
        } else {
            res.status(500).send('Error registering user. Please try again.');
        }
    }
});

app.get('/login', (req, res) => res.render('login', { error: null }));

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        
        if (user && await bcrypt.compare(password, user.password_hash)) {
            req.session.user = {
                id: user._id,
                full_name: user.full_name,
                email: user.email
            };
            res.redirect('/aircraft');
        } else {
            res.render('login', { error: 'Invalid email or password.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred during login.');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/');
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});
*/

app.get('/aircraft', requireLogin, async (req, res) => {
    try {
        const filter = {};
        
        if (req.query.manufacturer && req.query.manufacturer !== 'All') {
            filter.manufacturer = req.query.manufacturer;
        }
        if (req.query.year) {
            filter.year = { $gte: parseInt(req.query.year) };
        }
        
        const aircrafts = await Aircraft.find(filter).lean();
        res.render('aircraft_list', { aircrafts: aircrafts });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching aircraft listings.");
    }
});

app.get('/aircraft/:id', requireLogin, async (req, res) => {
    const { id } = req.params;
    try {
        const plane = await Aircraft.findOne({ id: parseInt(id) }).lean();
        if (!plane) return res.status(404).send("Aircraft not found.");
        res.render('details', { plane: plane });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching aircraft details.");
    }
});

// --- INQUIRY ROUTES ---

// Handle the form submission
app.post('/inquire', async (req, res) => {
    const { userName, userEmail, subject, message, aircraftId } = req.body;
    try {
        await Inquiry.create({
            user_name: userName,
            user_email: userEmail,
            subject: subject,
            message: message,
            aircraft_id: aircraftId ? parseInt(aircraftId) : null
        });
        res.redirect('/inquiry-confirmation');
    } catch (err) {
        console.error('Error saving inquiry:', err);
        res.status(500).send('There was an error submitting your inquiry. Please try again later.');
    }
});

// **THIS IS THE MISSING ROUTE**
// Display a simple "thank you" page after submission
app.get('/inquiry-confirmation', (req, res) => {
    res.render('inquiry_confirmation');
});

// Static Pages
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));

// Only start server if running locally (not in Vercel)
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    app.listen(port, () => {
        console.log(`AeroLux server running at http://localhost:${port}`);
    });
}

// Export for Vercel serverless deployment
module.exports = app;