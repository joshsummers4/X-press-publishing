const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues.js');

//series param method
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get("SELECT * FROM Series WHERE id = $seriesId", 
        {
        $seriesId: seriesId
        },
        (error, row) => {
            if(error){
                next(error);
            } else if (row) {
                req.series = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    )
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

//get method for all data in series table
seriesRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Series", (error, rows) => {
        if(error){
            next(error);
        } else {
            res.status(200).json({series: rows});
        }
    });
});

//get method for /:seriesId route 
seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
});

//post method to insert new series
seriesRouter.post('/', (req, res, next) => {
    const series = req.body.series;
    if (!series.name || !series.description){
        return res.sendStatus(400);
    }
    db.run("INSERT INTO Series (name, description) VALUES ($name, $description)", 
    {
        $name: series.name,
        $description: series.description
    },
    function(error) {
        if(error){
            next(error);
        } else {
            db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`, (error, row) => {
                res.status(201).json({series: row});
            });
        }
    })
});

//put method for /:seriesId route
seriesRouter.put('/:seriesId', (req, res, next) => {
    const series = req.body.series;
    if (!series.name || !series.description){
        return res.sendStatus(400);
    }
    db.run("UPDATE Series SET name = $name, description = $description WHERE Series.id = $id", 
        {
            $name: series.name,
            $description: series.description,
            $id: req.params.seriesId
        }, 
        (error) => {
            if(error){
                next(error);
            } else {
                db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`, (error, row) => {
                    res.status(200).json({series: row});
                });
            }
        }
    )
});

//delete method for seriesId route
seriesRouter.delete('/:seriesId', (req, res, next) => {
    const serieId = req.params.seriesId;
    db.get(`SELECT * FROM Issue WHERE Issue.series_id = ${serieId}`, (error, rows) => {
        if (error){
            next(error);
        } else if (rows) {
            return res.sendStatus(400); 
        } else {
            db.run(`DELETE FROM Series WHERE Series.id = ${serieId}`, (error, row) => {
                res.sendStatus(204);
            })
        }
    });
});

module.exports = seriesRouter; 