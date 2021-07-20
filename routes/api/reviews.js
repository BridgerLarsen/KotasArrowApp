const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const Review = require('../../models/Reviews');
  
router.get('/', (req, res) => {
    Review.find()
    .sort( {date: -1 } )
    .then(reviews => {
        res.json({ "reviews": reviews })
    })
    .catch(err => {
        res.status(400).send(err)
    })
})

// @route GET api/review
// @desc GET a single review
// @access public
router.get('/:id', (req, res) => {
    Review.findById(req.params.id)
    .then(review => {
        res.json({ "review": review })
    })
    .catch(err => {
        res.status(400).send("Could not get review")
    })
})

// @route POST api/reviews
// @desc Create another review
// @access private
router.post('/add', auth, (req, res) => {
    const newReview = new Review(req.body);

    newReview.save()
    .then(review => {
        res.status(200).json(review)
    })
    .catch(err => {
        res.status(400).send(err)
    })
})

// @route PATCH api/reviews
// @desc Update review
// @access private
router.patch('/update/:id', auth, (req, res) => {
    Review.findById(req.params.id)
        .then(review => {
            review.name = req.body.name;
            review.review = req.body.review;
            // review.date = req.body.date;

            review.save()
                .then(review => {
                    res.status(200).json(review)
                })
                .catch(err => {
                    res.status(400).send("Update to review failed")
                })
        })
})

// @route DELETE api/review
// @desc Delete a review
// @access private
router.delete('/delete/:id', auth, (req, res) => {
    Review.findById(req.params.id)
        .then(review => {
            review.remove().then(() => res.json(review));
        })
        .catch(err => {
            res.status(404).send("Failed to delete review")
        })
})

module.exports = router;