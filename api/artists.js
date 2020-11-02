const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

// creation of artIdRouter for /api/artists/:artistId route

artistsRouter.param('artistId', (req, res, next, artistsId) => {
    db.get("SELECT * FROM Artist WHERE id = $artistsId", 
        {
        $artistsId: artistsId
        },
        (error, row) => {
            if(error){
                next(error);
            } else if (row) {
                req.artist = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    )
});

//get method for artistsid route
artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

//method to get all employed artists
artistsRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Artist WHERE Artist.is_currently_employed = 1", (error, rows) => {
        if(error){
            next(error);
        } else {
            res.status(200).json({artists: rows});
        }
    });
});

//post method for new artist
artistsRouter.post('/', (req, res, next) => {
    const artist = req.body.artist;
    const isEmployed = artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if(!artist.name || !artist.dateOfBirth || !artist.biography){
        return res.sendStatus(400);
    }
    db.run("INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) " +
        "VALUES ($name, $date, $biography, $employed)", 
        {
            $name: artist.name,
            $date: artist.dateOfBirth,
            $biography: artist.biography, 
            $employed: isEmployed
        },
        function(error) {
            if(error){
                next(error);
            } else {
                db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`, (error, row) => {
                    res.status(201).json({artist: row});
                });
            }
        }
    );
});

//put method
artistsRouter.put('/:artistId', (req, res, next) => {
    const artist = req.body.artist;
    const name = artist.name;
    const dateOfBirth = artist.dateOfBirth;
    const biography = artist.biography;
    const id = req.params.artistId;
    const isEmployed = artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if(!name || !dateOfBirth || !biography){
        return res.sendStatus(400);
    }
    db.run("UPDATE Artist SET name = $name, date_of_birth = $date, biography = $bio, is_currently_employed = $employed WHERE Artist.id = $id", 
        {
            $name: name,
            $date: dateOfBirth,
            $bio: biography, 
            $employed: isEmployed,
            $id: id 
        }, 
        (error) => {
            if(error){
                next(error);
            } else {
                db.get(`SELECT * FROM Artist WHERE Artist.id = ${id}`, (error, row) => {
                    res.status(200).json({artist: row});
                });
            }
        }
    )
});

//delete handler for artistID
artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run("UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $id", 
        { 
            $id: req.params.artistId 
        }, 
        (error) => {
            if(error){
                 next(error);
            } else {
                db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (error, row) => {
                    res.status(200).json({artist: row});
                });
            }
        }
    )
});

module.exports = artistsRouter;