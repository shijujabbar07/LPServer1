var express = require("express");
var router = express.Router();

var Twitter = require('twitter');
require('dotenv/config');

const apikey = process.env.apikey;
const apikeysecret = process.env.apikeysecret;
const accesstoken = process.env.accesstoken;
const accesstokensecret = process.env.accesstokensecret;

var client = new Twitter({
  consumer_key: apikey,
  consumer_secret: apikeysecret,
  access_token_key: accesstoken,
  access_token_secret: accesstokensecret
});

const sqlite3 = require('sqlite3').verbose();

// create a new database file users.db or open existing users.db
const db = new sqlite3.Database('./tweet.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the tweet.db database.');
});

    // db.run('DROP TABLE IF EXISTS feed', (err) => {
    //     if (err) {
    //         console.log(err);
    //         throw err;
    //     }
    // });

 router.get("/",function(req,res,next){

    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS feed(tid INTEGER PRIMAY KEY ,tweetid LONG UNIQUE,tweet TEXT, twitterid TEXT,createddate TEXT)', (err) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });

        var params = {q: '#liveperson'};
        client.get('search/tweets', params, function(error, tweets, response) {
            if (error)
            {
                console.log(error);
            }
          if (!error) {
            //console.log(tweets);
            //console.log('totalCount: ',tweets.statuses.length)
            for(let i = 0; i < tweets.statuses.length; i++){
              
               var tweetid =tweets.statuses[i].id;
               var createdate =tweets.statuses[i].created_at;
               var usr =tweets.statuses[i].user.screen_name;
               var tweet= tweets.statuses[i].text;
               tweet = tweet.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
        console.log(createdate.substring(0,20));
              db.run("INSERT INTO feed(tweetid,tweet,twitterid,createddate) VALUES("+ tweetid +",'" + tweet + "','" + usr+"','" + createdate.substring(0,20)+"') ON CONFLICT(tweetid) DO UPDATE SET tweet= '" + tweet+ "', twitterid='" + usr+ "'", (err) => {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                });
        
            }
          }
        });

        db.all("SELECT createddate,tweetid,tweet,twitterid FROM feed ORDER BY 2", (err,result) => {
            if (err) {
                console.log(err);
                throw err;
            }
            res.send(result);
        });

    });


 });
 module.exports=router;