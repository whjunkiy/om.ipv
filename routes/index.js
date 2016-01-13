var express = require('express');
var router = express.Router();
var md5 = require('MD5');
var Promise = require('promise');
var EventEmitter = require('events').EventEmitter;


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'OM - IPV' });
});

router.post('/ckeckAuth',function(req, res) {
    var ans = 0;
    console.log('ans = 0');
    if (req.session.user.status) {
        ans = req.session.user;
    }
    console.log('ans after = ' + ans);
    res.send(ans);
});

router.post('/getpl',function(req, res) {
    var tpl    = '';
    var params = {};
    if (req.body.tpl) tpl = req.body.tpl;
    if (req.body.params) params = req.body.params;
    res.render(tpl, params);
});

router.post('/regc',function(req, res) {
    var cn       = req.body.cn;
    var email    = req.body.email;
    var password = req.body.password;

    var db         = req.db;
    var collection = db.get('companies');
    var myevt      = new EventEmitter();
    console.log("\n !!!!  GOTCHA!!!!  \n");
    myevt.on('looked up', function(data) {
        if (!data.email && !data.code) {
            collection.insert({cn: cn, email: email, password: md5(password)},function(e, docs){
                collection = db.get('uzers');
                var user = {cn: cn, email: email, password: md5(password), status: 5, fname: '', sname: '', tname: '', pg: 'directors'};
                collection.insert(user,function(e, docs){
                    req.session.user = user;
                    res.send('HI!');
                });
            });
        } else {
            if (data.email) {
                res.send('ALREADY!');
            } else {
                console.log(data);
                res.send('ERROR!');
            }
        }
    });

    collection.findOne({email: email},function(e,docs) {
        if (!docs && !e) {
            myevt.emit('looked up', {});
        } else if (!e) {
            myevt.emit('looked up', docs);
        } else {
            myevt.emit('looked up', e);
        }
    });

});

router.post('/login',function(req, res) {
    var email    = req.body.email;
    var password = req.body.password;
    var db         = req.db;
    var collection = db.get('uzers');
    var myevt      = new EventEmitter();

    myevt.on('looked up', function(data) {
        if (!data.email && !data.code) {
            res.send('empty');
        } else {
            if (data.email) {
                if (data.password == md5(password)) {
                    req.session.user = data;
                    res.send('hi');
                } else {
                    res.send('hack');
                }
            } else {
                console.log(data);
                res.send('ERROR!');
            }
        }
    });

    collection.findOne({email: email},function(e,docs) {
        if (!docs && !e) {
            myevt.emit('looked up', {});
        } else if (!e) {
            myevt.emit('looked up', docs);
        } else {
            myevt.emit('looked up', e);
        }
    });

});

router.get('/regc',function(req, res) {
    var db       = req.db;
    var cn       = req.query.cn;
    var email    = req.query.email;
    var password = req.query.password;
    //console.log(req);
    console.log("\n !!!! MAIL::::" + email + " \n");
    var collection = db.get('companies');
   // collection.remove({}, function(e, docs){});
    var myevt      = new EventEmitter();

    myevt.on('looked up', function(data) {
        console.log("\n -- DATA --  \n");
        console.log(data);
        console.log("\n -- !DATA! --  \n");
        if (!data.email && !data.code) {
            collection.insert({cn: cn, email: email, password: md5(password)},function(e, docs){
                res.send('HI!!!!');
            });
        } else {
            if (data.email) {
                res.send('ALREADY!!!!');
            } else {
                console.log(data);
                res.send('ERROR!!!!');
            }
        }
    });

    collection.findOne({email: email},function(e,docs) {
        console.log("\n -- DOCS --  \n");
        console.log(docs);
        console.log("\n -- !DOCS! --  \n");
        console.log("\n -- E --  \n");
        console.log(e);
        console.log("\n -- !E! --  \n");
        if (!docs && !e) {
            myevt.emit('looked up', {});
        } else if (!e) {
            myevt.emit('looked up', docs);
        } else {
            myevt.emit('looked up', e);
        }
    });

});

router.post('/getPersonal', function(req, res) {
    if (req.session.user.status > 2) {
        var pers = {};
        var db         = req.db;
        var collection = db.get('uzers');
        collection.find({cn: req.session.user.cn}, function(e,docs) {
            if (e) {
                //res.render('admin/personal', {user: req.session.user, personas: docs});
                console.log(e);
            } else {
                if (!docs) docs = {};
                res.render('admin/personal', {user: req.session.user, personas: docs});
            }
        });
    }
});

router.post('/AddNewPerson',function(req, res) {
    var cn         = req.session.user.cn;
    var email      = req.body.email;
    var password   = req.body.password;
    var name       = req.body.name;
    var place      = req.body.place;
    var status     = req.body.status;
    var db         = req.db;
    var collection = db.get('uzers');
    var myevt      = new EventEmitter();

    collection.findOne({email: email},function(e,docs) {
        if (!docs && !e) {
            myevt.emit('looked up', {});
        } else if (!e) {
            myevt.emit('looked up', docs);
        } else {
            myevt.emit('looked up', e);
        }
    });

    myevt.on('looked up', function(data) {
        if (!data.email && !data.code) {
            var user = {cn: cn, email: email, password: md5(password), status: status, name: name, place: place};
            collection.insert(user,function(e, docs){
                res.send('OK!');
            });
        } else {
            if (data.email) {
                res.send('ALREADY!');
            } else {
                console.log(data);
                res.send('ERROR!');
            }
        }
    });

});

module.exports = router;
