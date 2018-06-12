"use strict";
exports.__esModule = true;
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var session = require("express-session");
var ChatModel_1 = require("./model/ChatModel");
var UserModel_1 = require("./model/UserModel");
var MessageModel_1 = require("./model/MessageModel");
var GooglePassport_1 = require("./GooglePassport");
var passport = require('passport');
// Creates and configures an ExpressJS web server.
var userId;
var userName;

var App = /** @class */ (function () {
    //Run configuration methods on the Express instance.
    function App() {
        this.googlePassportObj = new GooglePassport_1["default"]();
        this.expressApp = express();
        this.middleware();
        this.routes();
        this.idGenerator = 100;
        this.Chat = new ChatModel_1.ChatModel();
        this.User = new UserModel_1.UserModel();
        this.Message = new MessageModel_1.MessageModel();
    }
    // Configure Express middleware.
    App.prototype.middleware = function () {
        this.expressApp.use(logger('dev'));
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: false }));
        this.expressApp.use(session({ secret: 'keyboard cat' }));
        this.expressApp.use(passport.initialize());
        this.expressApp.use(passport.session());
    };
    App.prototype.validateAuth = function (req, res, next) {
        if (req.isAuthenticated()) {
            console.log("user is authenticated");
            userId = req.user.id;
            userName = req.user.displayName;
            console.log(userId);
            return next();
        }
        console.log("user is not authenticated");
        res.redirect('/');
    };
    // Configure API endpoints.
    App.prototype.routes = function () {
        var _this = this;
        var router = express.Router();
        router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));
        router.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/#/chatwindow', failureRedirect: '/'
        }));
        router.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        //route to return JSON of chat objects
        router.get('/chats', function (req, res) {
            //console.log("Query all chats");
            //console.log("tt");
            //console.log(_this.googlePassportObj);


            _this.Chat.retrieveAllChats(res);
        });

        //route to return a unique chat based on ID
        router.get('/chats/:chatID', this.validateAuth, function (req, res) {
            var id = req.params.chatID;
            // console.log("Query a user with id:" + id);
            // console.log("tt");
            // console.log(_this.googlePassportObj);
            // userName = _this.googlePassportObj.displayName;

            _this.Chat.retrieveChat(res, { chatID: id });
        });
        //route to return JSON of all users
        router.get('/users', this.validateAuth, function (req, res) {
            // console.log("Query all users");
            // console.log("tt");
            // console.log(_this.googlePassportObj);
            _this.User.retrieveAllUsers(res);
        });
        //route to return JSON of a single user
        router.get('/users/:userID', this.validateAuth, function (req, res) {
            // var id = req.params.userID;
            // console.log("Query a user with id:" + id);
            // console.log("tt");
            // console.log(_this.googlePassportObj);
            _this.User.retrieveUser(res, { userID: id });
        });
        //route to return JSON of messages by chat
        router.get('/messages/:chat_id', this.validateAuth, function (req, res) {

            var id = req.params.chat_id;
            console.log("Query messages from chat:" + id);
            console.log("tt");
            console.log(_this.googlePassportObj);

            _this.Message.retrieveAllMessages(res, { chat_id: id });
        });


        router.get('/mymessages/:chat_id', this.validateAuth, function (req, res) {

            var id = req.params.chat_id;
            console.log("Query messages from chat:" + id);
            console.log("tt");
            console.log(_this.googlePassportObj);

            _this.Message.retrieveMyMessages(res, { chat_id: id, user_id: userId });
        });


        //route to return JSON of all users
        router.get('/messages', this.validateAuth, function (req, res) {
            // console.log("Query all messages");
            // console.log("tt");
            // console.log(_this.googlePassportObj);
            _this.Message.retrieveAll(res);
        });
        router.post("/messages/:chat_id", this.validateAuth, function (req, res) {

            console.log("adding a message");

            _this.Message.addMessage(req.body);
        });
        
        this.expressApp.use('/', router);
        // this.expressApp.use('/app/json/', express.static(__dirname+'/app/json'));
        // this.expressApp.use('/images', express.static(__dirname+'/img'));
        // this.expressApp.use('/', express.static(__dirname+'/pages/'));
        this.expressApp.use('/', express.static(__dirname + '/dist'));
    };
    return App;
}());
exports.App = App;
