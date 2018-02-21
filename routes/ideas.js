const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
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
router.post('/', ensureAuthenticated, (req, res)=>{ 
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
      title: req.body.title,
      details: req.body.details
    })
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    }
    new Idea(newUser)
      .save()
      .then(idea  => {
        req.flash('success_msg', 'Item added');
        res.redirect('/ideas')
      })
  }
})

// Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;

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