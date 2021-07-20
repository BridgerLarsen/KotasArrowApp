const express = require('express');
const router = express.Router();

const auth = require('../../../middleware/auth');
const Faq = require('../../../models/faq/Faq');

// @route GET api/faqs
// @desc GET All faqs
// @access public
router.get('/', (req, res) => {
    Faq.find()
    .sort({ type: 1})
    .then(faq => {
        res.json({ "faqs" : faq })
    })
    .catch(err => {
        console.log(err);
    })
})

// @route GET api/faq
// @desc GET a single faq
// @access public
router.get('/:id', (req, res) => {
    Faq.findById(req.params.id)
    .then(faq => {
        res.json({ "faq": faq });
    })
    .catch(err => {
        res.status(400).send("Could not get faq", err);
    })
})

// @route POST api/faqs
// @desc Create faq
// @access private
router.post('/add', auth, (req, res) => {
    const newFaq = new Faq(req.body);
    
    newFaq.save()
    .then(faq => {
        res.status(200).json(faq);
    })
    .catch(err => {
        console.log(err);
    })
})

// @route UPDATE api/faqs
// @desc Update faq
// @access private
router.patch('/update/:id', auth, (req, res) => {
    Faq.findById(req.params.id)
        .then(faq => {
            faq.type = req.body.type;
            faq.question = req.body.question;
            faq.answer = req.body.answer;
            faq.subType = req.body.subType;

            faq.save()
                .then(faq => {
                    res.status(200).json(faq)
                })
                .catch(err => {
                    res.status(400).send(err);
                })
        })
})


// @route DELETE api/faqs
// @desc Delete faq
// @access private
router.delete('/delete/:id', auth, (req, res) => {
    Faq.findById(req.params.id)
        .then(faq => {
            faq.remove().then(() => res.json(faq));
        })
        .catch(err => {
            res.status(404).json({Success: false});
        })
})

module.exports = router;