const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Dog = new Schema({
    name: {
        type: String,
        required: true
    },
    breedingName: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String,
        required: true
    },
    dimensions: {
        weight: {
            type: String
        },
        height: {
            type: String
        }
    },
    color: {
        type: String,
        required: true
    },
    imgProfileUrl: {
        type: String
    },
    images: [{
        src: { type: String }
    }] 
})

module.exports = mongoose.model('Dog', Dog);