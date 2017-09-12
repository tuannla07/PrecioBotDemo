var builder = require('botbuilder');
var https = require('https');
var querystring = require('querystring');

//load LUIS config api path model
var model =  process.env.LUIS_MODEL;

var dialog = new builder.IntentDialog();

module.exports = dialog.matches(/^search/i, [
    function (session, args, next) {
        if (session.message.text.toLowerCase() == 'search') {
            // TODO: Prompt user for text`
            builder.Prompts.text(session, 'Who are you looking for?');
        } else {
            var query = session.message.text.substring(7);
            next({ response: query });
        }
    },
    function (session, result, next) {
        
        var query = result.response;
        if (!query) {
            session.endDialog('Request cancelled');
        } else {
            var usernames = ['tuan','ngoc'];
            builder.Prompts.choice(session, 'What user do you want to load?', usernames);
        }
    }, function(session, result, next) {
        // TODO: Display final request
        session.send(result.response.entity);
    }
]);