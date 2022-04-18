const ObjectID = require('mongodb').ObjectID
const passport = require('passport')
const LocalStrategy = require('passport-local');
require('dotenv').config();


module.exports = (app, db) => {

    passport.serializeUser((book, done) => {
        done(null, book._id);
    });

    passport.deserializeUser((id, done) => {
        db.collection('books').findOne(
            { _id: new ObjectID(id) },
            (err, doc) => {
                done(null, doc);
            }
        );
    });

    passport.use(new LocalStrategy(
        function (title, id, done) {
            db.collection('books').findOne({ title: booktitle }, function (err, book) {
                if (err) { return done(err); }
                if (!book) { return done(null, false); }
                return done(null, book);
            });
        }
    ));

}