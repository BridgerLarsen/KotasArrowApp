const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const auth = require('../../middleware/auth');
const Dog = require('../../models/Dog');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
})

const fileFilter = function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer(
    { 
        storage, 
        limits: {
            fileSize: 1024 * 1024 * 16
        },
        fileFilter
    }
)

// @route GET api/dogs
// @desc GET All dogs
// @access public
router.get('/', (req, res) => {
    Dog.find()
    .sort({ dateOfBirth: 0 })
    .then(dogs => {
        res.json({ "dogs" : dogs })
    })
    .catch(err => {
        res.status(400).send(err)
    })
})

// @route GET api/dogs
// @desc GET a single dog
// @access public
router.get('/:id', (req, res) => {
    Dog.findById(req.params.id)
    .then(dog => {
        res.json({ "dog": dog });
    })
    .catch(err => {
        res.status(400).send("Could not get dog");
    })
})

// @route POST api/dogs
// @desc Create another dog profile
// @access private
const cbUpload = upload.fields([{ name: 'imgProfileUrl', maxCount: 1 }, { name: 'images', maxCount: 16 }])

router.post('/add', auth, cbUpload, (req, res, next) => { 

    const imagesCb = () => {
        var imagesArr = [];

        req.files.images.map(img => {
            imagesArr.push({ src: `${process.env.ORIGIN || 'http://localhost:5000'}/${img.path}` });
        })

        return imagesArr;
    }
    
    let imgProfileUrl = req.files.imgProfileUrl ? `${req.protocol}://${req.headers.host || 'http://localhost:5000'}/${req.files.imgProfileUrl[0].path}` : "";
    let images = req.files.images ? imagesCb() : []; 

    const {
        name,
        breedingName,
        gender,
        dateOfBirth,
        dimensions,
        color
    } = req.body;

    const {
        weight,
        height
    } = dimensions;

    const newDogData = {
        name,
        breedingName,
        gender,
        dateOfBirth,
        dimensions: {
            weight,
            height
        },
        color,
        imgProfileUrl,
        images
    }
    
    const newDog = new Dog(newDogData);

    newDog.save()
    .then(dog => {
        res.status(200).json(dog);
    })
    .catch(err => {
        res.status(400).send(err)
    })
})

// @route UPDATE api/dogs
// @desc Update dog profile
// @access private

router.patch('/update/:id', auth, cbUpload, (req, res) => {
    const imagesCb = () => {
        var imagesArr = [];

        if (req.body.existingImages) {
            req.body.existingImages.map(img => {
                imagesArr.push({ src: img })
            })
        }

        if (req.files.images) {
            req.files.images.map(img => {
                imagesArr.push({ src: `${process.env.ORIGIN || 'http://localhost:5000'}/${img.path}` });
            })
        }

        return imagesArr;
    }

    let imgProfileUrl = req.files.imgProfileUrl ? `${process.env.ORIGIN || 'http://localhost:5000'}/${req.files.imgProfileUrl[0].path}` : req.body.imgProfileUrl;
    let images = imagesCb(); 
        
    const {
        name,
        breedingName,
        gender,
        dateOfBirth,
        dimensions,
        color
    } = req.body;

    const {
        weight,
        height
    } = dimensions;

    Dog.findById(req.params.id)
        .then(dog => {
            dog.name = name;
            dog.breedingName = breedingName;
            dog.gender = gender;
            dog.dateOfBirth = dateOfBirth;
            dog.dimensions.weight = weight;
            dog.dimensions.height = height;
            dog.color = color;
            dog.imgProfileUrl = imgProfileUrl;
            dog.images = images;

            dog.save()
                .then(dog => {
                    res.status(200).json(dog)
                })
                .catch(err => {
                    res.status(400).send(err);
                })
        })
})





// @route DELETE api/dogs
// @desc Delete dog profile
// @access private
router.delete('/delete/:id', auth, (req, res) => {
    Dog.findById(req.params.id)
        .then(dog => {
            if (dog.imgProfileUrl) {
                var imgProfileUrlPath = dog.imgProfileUrl.replace(
                    `${process.env.ORIGIN || 'http://localhost:5000'}`, 
                    path.dirname(fs.realpathSync('uploads/'))
                )
                if (fs.existsSync(imgProfileUrlPath)) {
                    fs.unlinkSync(imgProfileUrlPath);
                }
            } 
            
            if (dog.images) {
                dog.images.map(img => {
                    var imgPath = img.src.replace(
                            `${process.env.ORIGIN || 'http://localhost:5000'}`, 
                            path.dirname(fs.realpathSync('uploads/'))
                        )
                    if (fs.existsSync(imgPath)) {
                        fs.unlinkSync(imgPath);
                    }
                })

            }
            dog.remove().then(() => res.json(dog));
        })
        .catch(err => {
            res.status(404).json({Success: false, msg: err});
        })
})


// @route Delete
// desc Delete an image if desired from file system when updating a document
// access private
router.delete('/deleteAnImage/:id', auth, (req, res) => {
    Dog.findById(req.params.id)
        .then(dog => {
            if (dog.imgProfileUrl === req.query.imgProfileUrl) {
                var imgProfileUrlPath = dog.imgProfileUrl.replace(
                    `${process.env.ORIGIN || 'http://localhost:5000'}`, 
                    path.dirname(fs.realpathSync('uploads/'))
                )
                fs.unlinkSync(imgProfileUrlPath);

                res.status(200).json({ msg: "Success!"})
            } 
            
            if (req.query.image) {
                dog.images.map(img => {
                    if (img.src === req.query.image) {
                        var imgPath = img.src.replace(
                            `${process.env.ORIGIN || 'http://localhost:5000'}`, 
                            path.dirname(fs.realpathSync('uploads/'))
                        )
                        fs.unlinkSync(imgPath);

                        res.status(200).json({ msg: "Success!"})
                    }
                })
            }
        })
        .catch(err => {
            res.status(404).send(err)
        })
})

module.exports = router;