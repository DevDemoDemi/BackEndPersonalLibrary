const express = require('express');
require('dotenv').config();

const app = express();



module.exports = (app, db) => {

    app.route('/').get((req, res) => {
        let message2;
        if (fullDelete) {
            fullDelete = false
            message2 = 'Complete delete successful'
        } else if (deleted) {
            deleted = false
            message2 = 'Delete successful'
        } else {
            message2 = 'Welcome! What would you like to do today?'
        }
        res.render(process.cwd() + '/views/index.pug', { show: true, message: message2 });
    });

    app.route('/added').get((req, res) => {
        db.collection('books').find({}).toArray((err, data) => {
            if (err) {
                return err
            } else {
                let title = data[data.length - 1].title
                let id = data[data.length - 1]._id
                let message = 'ADDED'
                res.render(process.cwd() + '/views/index.pug', { show: true, message: message, title: title, id: id })
            }
        })
    })

    app.route('/api/books').get((req, res) => {
        db.collection('books').find({}).toArray((err, data) => {
            if (err) {
                return err
            } else {
                res.render(process.cwd() + '/views/books.pug', { data: data, message: '' })
            }
        })
    })

    app.route('/api/books/id/:bookid').get((req, res) => {
        db.collection('books').find({}).toArray((err, data) => {
            if (err) {
                return err
            } else {
                let queryFind = data.filter(obj => { return obj._id == query })
                if (queryFind.toString() == '') {
                    let message = 'Unfortunately, this book does not exist in your library.'
                    res.render(process.cwd() + '/views/books.pug', { message: message, data: data })
                } else {
                    let title = queryFind[0].title
                    let id = queryFind[0]._id
                    let comments;
                    if (queryFind[0].comments.length == 0) {
                        comments = 'No comments to display'
                    } else {
                        comments = queryFind[0].comments
                    }
                    res.render(process.cwd() + '/views/index.pug', { show: true, title: title, id: id, comments: comments, message: '' })
                }
            }
        })
    })

    let query;
    app.route('/api/books/:id').get((req, res) => {
        query = req.query.bookid
        db.collection('books').find({}, (err, data) => {
            if (err) {
                return err
            } else {
                res.redirect('/api/books/id/' + query)
            }
        })
    })

    app.route('/api/books/id').post((req, res, next) => {
        query = req.body.commentid
        db.collection('books').find({}).toArray((err, data) => {
            if (err) {
                next(err)
            } else {
                query = req.body.commentid
                let queryFind = data.filter(obj => { return obj._id == query })
                if (queryFind.toString() == '') {
                    let message = 'Unfortunately, this book does not exist in your library.'
                    res.render(process.cwd() + '/views/books.pug', { message: message, data: data })
                } else {
                    queryFind[0].comments.push(req.body.comment)
                    db.collection('books').replaceOne({ title: queryFind[0].title }, {
                        title: queryFind[0].title,
                        comments: queryFind[0].comments
                    })
                    res.redirect('/api/books/id/' + query)
                }
            }
        })
    })

    let deleted = false
    app.route('/api/books/:delete').post((req, res, next) => {
        db.collection('books').find({}).toArray((err, data) => {
            if (err) {
                next(err)
            } else {
                query = req.body.deleteid
                let queryFind = data.filter(obj => { return obj._id == query })
                if (queryFind.toString() == '') {
                    let message = 'Unfortunately, this book does not exist in your library.'
                    res.render(process.cwd() + '/views/books.pug', { message: message, data: data })
                } else {
                    db.collection('books').deleteOne({ title: queryFind[0].title }, (err, data) => {
                        if (err) {
                            return err
                        } else {
                            deleted = true
                            res.redirect('/')
                        }
                    })
                }
            }
        })
    })

    app.route('/api/books').post((req, res, next) => {
        db.collection('books').findOne({ title: req.body.booktitle }, function (err, book) {
            if (err) {
                next(err);
            } else if (book) {
                res.redirect('/');
            } else {
                db.collection('books').insertOne({
                    title: req.body.booktitle,
                    comments: []
                },
                    (err, doc) => {
                        if (err) {
                            res.redirect('/');
                        } else {
                            next(null, book);
                        }
                    }
                )
            }
        })
    },
        (req, res, next) => {
            res.redirect('/added');
        }
    );

    let fullDelete = false
    app.route('/delete').get((req, res) => {
        db.dropCollection('books', (err, delOK) => {
            if (err) {
                return err
            } else {
                fullDelete = true
                res.redirect('/')
            }
        })
    })


    app.get('*', (req, res) => {
        res.render(process.cwd() + '/views/404.pug')
    })

    //Start our server and tests!
    app.listen(process.env.PORT || 3000, function () {
        console.log("Listening on port " + process.env.PORT);
        if (process.env.NODE_ENV === 'test') {
            console.log('Running Tests...');
            setTimeout(function () {
                try {
                    runner.run();
                } catch (e) {
                    let error = e;
                    console.log('Tests are not valid:');
                    console.log(error);
                }
            }, 1500);
        }
    });


}