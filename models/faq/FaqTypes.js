const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FaqTypes = new Schema({
    type: {
        type: String,
        required: true
    },
    subType: [{
        name: {
            type: String
        }
    }]
})

module.exports = mongoose.model('FaqTypes', FaqTypes);