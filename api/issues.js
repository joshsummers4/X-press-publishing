const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//issue param to check issueId
issuesRouter.param('issueId', (req, res, next, issueId) => {
    db.get("SELECT * FROM Issue WHERE id = $issueId", 
        {
        $issueId: issueId
        },
        (error, row) => {
            if(error){
                next(error);
            } else if (row) {
                req.issue = row;
                next();
            } else {
                res.sendStatus(404);
            }
        }
    )
});

//get method to retrive all issues
issuesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE Issue.series_id = ${req.params.seriesId}`, (error, row) => {
        if(error){
            next(error);
        } else {
            res.status(200).json({issues: row});
        }
    });
});

//post method to add new issue
issuesRouter.post('/', (req, res, next) => {
    const issue = req.body.issue;
    db.get(`SELECT * FROM Artist WHERE Artist.id =${issue.artistId}`, (error, row) => {
        if (error) {
            next(error);
        } else {
            if (!issue.name || !issue.issueNumber || !issue.publicationDate || !issue.artistId){
                return res.sendStatus(400);
            }
            db.run("INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) " +
                "VALUES ($name, $number, $date, $artistId, $seriesId)",
                {
                    $name: issue.name,
                    $number: issue.issueNumber,
                    $date: issue.publicationDate,
                    $artistId: issue.artistId,
                    $seriesId: req.params.seriesId
                },
                function(error) {
                    if(error){
                        next(error);
                    } else {
                        db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, (error, row) => {
                            res.status(201).json({issue: row});
                        });
                    }
                }
            )
        }
    })
    
    

});

//put method for issueId route
issuesRouter.put('/:issueId', (req, res, next) => {
    const issue = req.body.issue;
    db.get(`SELECT * FROM Artist WHERE Artist.id =${issue.artistId}`, (error, row) => {
        if (error) {
            next(error);
        } else {
            if (!issue.name || !issue.issueNumber || !issue.publicationDate || !issue.artistId){
                return res.sendStatus(400);
            }
            db.run("UPDATE Issue SET name = $name, issue_number = $number, publication_date = $date, artist_id = $artistId, series_id = $seriesId WHERE Issue.id = $id",
            {
                $id: req.params.issueId,
                $name: issue.name,
                $number: issue.issueNumber,
                $date: issue.publicationDate,
                $artistId: issue.artistId,
                $seriesId: req.params.seriesId
            },
                (error) => {
                    if(error){
                        next(error);
                    } else {
                        db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`, (error, row) => {
                            res.status(200).json({issue: row});
                        });
                    }
                }
            )
        }
    })
});

//delete issueId route
issuesRouter.delete('/:issueId', (req, res, next) => {
    const issuesId = req.params.issueId;
    db.run(`DELETE FROM Issue WHERE Issue.id = ${issuesId}`, (error, row) => {
        if(error){
            next(error);
        } else {
            res.sendStatus(204);
        }
    })
});

module.exports = issuesRouter;