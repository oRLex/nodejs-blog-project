const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const fs = require('fs')
const bodyParser = require('body-parser');
const crypto = require('crypto');
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
      req.flash('error_msg', 'Not Authorized')
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
    errors.push({text: 'Please add a title'})
  }
  if(!req.body.details){ // это значит рекваирим.тело всего документа. name="detail"
    errors.push({text: 'Please add a details'})
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

// Edit Form process
router.put('/:id', ensureAuthenticated, upload.single('image'), async function(req, res) {
  
  Idea.findByIdAndUpdate({  _id: req.params.id  }, async function(req){
    if (req.file.path){
      try{
        await cloudinary.v2.uploader.destroy(req.body.imgId)
        var result = await cloudinary.v2.uploader.upload(req.file.path);
        req.body.img = result.secure_url;
        req.body.imgId = result.public_id;
      } catch(err) {
        req.flash('success_msg', 'Image Error', err.message);
        return res.redirect('/ideas');
    }
  }
  })
  .then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.img = req.body.img;
    idea.imgId = req.body.imgId;

    idea.save()
    .then(idea => {
      req.flash('success_msg', 'Item updated');
      res.redirect('/ideas')
    })
  })
   
  
});

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({_id: req.params.id})
  .then(() => {
    req.flash('success_msg', 'Item removed');
    res.redirect('/ideas')
  })
})




module.exports = router;