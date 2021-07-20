const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Faq = new Schema({
    type: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    subType: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Faq', Faq);

