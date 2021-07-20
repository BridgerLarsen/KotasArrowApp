const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');

const dogs = require('./routes/api/dogs');
const reviews = require('./routes/api/reviews');
const faq = require('./routes/api/faq/faq');
const users = require('./routes/api/users');
const auth = require('./routes/api/auth');
const faqTypes = require('./routes/api/faq/faqTypes')

const port = process.env.PORT || 5000;

const app = express();

dotenv.config();

app.use(express.urlencoded({
    limit: '16mb',
    extended: true,
}))

app.use(express.json({ limit: '16mb', extended: true }));

app.use(cors({ origin: process.env.ORIGIN || 'http://localhost:3000', credentials: true }));

app.use(cookieParser(process.env.COOKIESECRET));

app.use('/uploads', express.static('uploads'));


mongoose
    .connect(process.env.MONGOURI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useCreateIndex: true 
        }
    )

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDb Connected...')
})

app.use('/api/dogs', dogs);
app.use('/api/reviews', reviews);
app.use('/api/faqs', faq);
app.use('/api/faqTypes', faqTypes);
app.use('/api/users', users)
app.use('/api/auth', auth);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}

app.listen(port, () => console.log(`Server started on port ${port}`));