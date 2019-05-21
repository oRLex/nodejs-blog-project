const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const path = require('path');
const multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dnhomnole', 
  api_key: '273631371367265', 
  api_secret: 'KbiY0_DhbSiSGLIu8XLYG4FyPq4'
});


const {ensureAuthenticated} = require('../helpers/auth')

// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas')

// Idea Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({user: req.user.id})
    .sort({date: 'desc'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      })
    })
  
})

// Show single story
router.get('/show/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .populate('user')
  .then(idea => {
    res.render('ideas/show', {
      idea: idea
    })
  })
})

// Add Idea From
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add')
  })

// Edit Idea From
router.get('/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id //даст нам id с определенным с БД значением
  })
  .then((idea) => {
    if (idea.user != req.user.id) {
      req.flash('error_msg', 'Не авторизований')
      res.redirect('/ideas')
    } else{
      res.render('ideas/edit', {
        idea: idea
      });
    }
  });
});




// Proces From
router.post('/',   ensureAuthenticated, upload.single('image'), (req, res)=>{ 
  let errors = []

  if(!req.body.title){ // это значит рекваирим.тело всего документа. name="title"
    errors.push({text: 'Додайте заголовок'})
  }
  if(!req.body.details){ // это значит рекваирим.тело всего документа. name="detail"
    errors.push({text: 'Додайте текст'})
  }
  if(errors.length > 0){
    res.render('/add', {
      errors: errors,
      title: req.body.title
    })
  } else {
    cloudinary.uploader.upload(req.file.path, function(result) {
      req.body.img = result.secure_url;
      req.body.imgId = result.public_id;
      const newUser = {
        title: req.body.title,
        details: req.body.details,
        img:  req.body.img,
        imgId: req.body.imgId,
        user: req.user.id,
        date: req.body.date
      }
        new Idea(newUser)
        .save()
        .then(idea  => {
          req.flash('success_msg', 'Item added');
          res.redirect('/ideas')
        })
    });
  }
})

// EDIT FORM
router.put("/:id", ensureAuthenticated, upload.single('image'), function(req, res){
  

  Idea.findById(req.params.id, async function(err, idea){
    let errors = []

    if(!req.body.title){ // это значит рекваирим.тело всего документа. name="title"
      errors.push({text: 'Please add a title'})
    }
    if(!req.body.details){ // это значит рекваирим.тело всего документа. name="detail"
      errors.push({text: 'Please add a details'})
    }
    if(!req.file){ // это значит рекваирим.тело всего документа. name="detail"
      errors.push({text: 'Please add image'})
    }
      if(err, errors.length > 0){
          req.flash('error_msg', 'barada');
          res.redirect('/ideas');
      } else {
          if (req.file) {
            try {
                await cloudinary.v2.uploader.destroy(idea.imgId);
                var result = await cloudinary.v2.uploader.upload(req.file.path);
                idea.imgId = result.public_id;
                idea.img = result.secure_url;
            } catch(err) {
                req.flash('error_msg', 'Збій обробника на стадії видалення картинки');
                return res.redirect('/ideas');
            }
          }
          idea.title = req.body.title;
          idea.details = req.body.details;
          idea.save();
          req.flash('success_msg', 'Item updated');
          res.redirect('/ideas');
      }
  });
});


// Delete idea
router.delete('/:id', ensureAuthenticated, function(req, res) {
  Idea.findById(req.params.id, async function(err, idea) {
    if(err) {
      req.flash('error_msg', 'Збій обробника на стадії видалення картинки');
      return res.redirect('/ideas');
    }
    try {
        await cloudinary.v2.uploader.destroy(idea.imgId);
        idea.remove();
        req.flash('success_msg', 'Новина успішно видалена!');
        res.redirect('/ideas');
    } catch(err) {
        if(err) {
          req.flash('error_msg', 'Error');
          return res.redirect('/ideas');
        }
    }
  });
});


module.exports = router;