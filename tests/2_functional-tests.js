const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {

  suite('Routing tests', () => {

    suite('POST /api/books with title => create book object/expect book object', () => {

      test('Test POST /api/books with title', done => {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end((err, res) => {
            assert.equal(res.body.title, 'Test Book');
            const bookId = res.body._id;
            chai.request(server)
              .delete(`/api/books/${bookId}`) // Delete in the end
              .end(() => {
                done();
              })
          });
      });

      test('Test POST /api/books with no title given', done => {
        chai.request(server)
          .post('/api/books')
          .send({ title: '' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', () => {

      test('Test GET /api/books', done => {
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            if (res.body.length > 0) {
              res.body.forEach(book => {
                assert.isObject(book); // Check if each book is an object
                assert.containsAllKeys(book, ['_id', 'title', 'commentcount']); // Check each book if they contain the keys: id, title and commentcount
              });
            }
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', () => {

      test('Test GET /api/books/[id] with id not in db', done => {
        chai.request(server)
          .get('/api/books/1762227bf05f1044133f2c05')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', done => {
        // Get the list of books to ensure there's at least one book available
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            if (res.body.length > 0) {
              const bookId = res.body[0]._id; // Use the _id of the first book

              // Now, test the GET /api/books/[id] with a valid book id
              chai.request(server)
                .get(`/api/books/${bookId}`)
                .end((err, res) => {
                  assert.equal(res.status, 200);
                  assert.isObject(res.body);
                  assert.containsAllKeys(res.body, ['_id', 'title', 'comments']);
                  done();
                });
            } else {
              done('No books found in the database');
            }
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', () => {

      test('Test POST /api/books/[id] with comment', done => {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Comment to Update' })
          .end((err, res) => {
            const bookId = res.body._id; // Use the _id of the first book
            chai.request(server)
              .post(`/api/books/${bookId}`)
              .send({ comment: 'Comment Test' })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.include(res.body.comments, 'Comment Test');

                chai.request(server)
                  .delete(`/api/books/${bookId}`)
                  .end(() => {
                    done();
                  })
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', done => {
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            if (res.body.length > 0) {
              const bookId = res.body[0]._id; // Use the _id of the first book
              chai.request(server)
                .post(`/api/books/${bookId}`)
                .send({ comment: '' })
                .end((err, res) => {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'missing required field comment');
                  done();
                });
            } else {
              done('No books found in the database');
            }
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', done => {
        chai.request(server)
          .post('/api/books/1762227bf05f1044133f2c05')
          .send({ comment: 'Comment Test' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', () => {

      test('Test DELETE /api/books/[id] with valid id in db', done => {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Comment to Delete' })
          .end((err, res) => {
            const bookId = res.body._id;
            chai.request(server)
              .delete(`/api/books/${bookId}`)
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'delete successful');
                done();
              });
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', done => {
        chai.request(server)
          .delete('/api/books/1762227bf05f1044133f2c05')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

  });

});
