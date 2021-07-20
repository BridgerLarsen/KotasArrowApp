const express = require('express');
const router = express.Router();

const auth = require('../../../middleware/auth');
const FaqTypes = require('../../../models/faq/FaqTypes');

// @route GET api/faqTypes
// @desc GET All faqsTypes
// @access public
router.get('/', (req, res) => {
    FaqTypes.find()
    .then(faq => {
        res.json({ "faqTypes": faq })
    })
    .catch(err => {
        res.json({ msg: err });
    })
})

// @route POST api/faqsTypes/add
// @desc Create faqsType
// @access private
router.post('/add', auth, (req, res) => {
    const newFaqType = new FaqTypes(req.body);
    
    newFaqType.save()
    .then(faq => {
        res.status(200).json(faq);
    })
    .catch(err => {
        console.log(err);
    })
})

// @route GET api/faqsTypes/update
// @desc PATCH a faqsType
// @access private
router.patch('/update/:id', auth, (req, res) => {
    FaqTypes.findById(req.params.id)
        .then(faqType => {
            faqType.type = req.body.type;
            faqType.subType = req.body.subType;

            faqType.save()
                .then(faqType => {
                    res.status(200).json(faqType);
                })
                .catch(err => {
                    res.status(400).send(err);
                })
        })
        .catch(err => {
            res.status(404).json(err);
        })
})

router.delete('/delete/:id', (req, res) => {
    FaqTypes.findById(req.params.id)
        .then(type => {
            type.remove().then(() => res.json(type));
        })
        .catch(err => {
            res.status(404).send("Failed to delete type");
        })
})

module.exports = router;