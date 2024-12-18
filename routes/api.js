'use strict';
const Book = require('../models.js')
const mongoose = require ('mongoose')
module.exports = app => {

  app.route('/api/books')
    .get(async (req, res) => {
      const books = await Book.find({});
      const response = books.map(book => ({
        _id: book._id,
        title: book.title,
        commentcount: book.comments.length,
      }));
      res.json(response);
    })

    .post(async (req, res) => {
      const bookTitle = req.body.title;
      // Check if title is included in the request
      if (!bookTitle) return res.send('missing required field title');
      // Add book
      const newBook = await new Book({ title: bookTitle });
      newBook.save();
      res.json({ _id: newBook._id, title: bookTitle });
    })

    .delete(async (req, res) => {
      await Book.deleteMany({});
      res.send('complete delete successful');
    });

  app.route('/api/books/:id')
    .get(async (req, res) => {
      const bookId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookId))
        return res.send('Invalid book ID');

      const book = await Book.findOne({ _id: bookId });
      if (!book) return res.send('no book exists');
      res.json({
        _id: book._id,
        title: book.title,
        comments: book.comments,
      });
    })

    .post(async (req, res) => {
      const bookId = req.params.id;
      const comment = req.body.comment;
      if (!comment) return res.send('missing required field comment');

      const updatedBook = await Book.findByIdAndUpdate(
        bookId,
        { $push: { comments: comment } },
        { new: true },
      );
      if (!updatedBook) return res.send('no book exists');

      res.json({
        _id: updatedBook.id,
        title: updatedBook.title,
        comments: updatedBook.comments,
      });
    })

    .delete(async (req, res) => {
      let bookId = req.params.id;
      const deletedBook = await Book.findByIdAndDelete(bookId);
      if (!deletedBook) return res.send('no book exists');
      res.send('delete successful');
    });
};
