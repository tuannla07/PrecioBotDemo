var builder = require("botbuilder");
var restify = require("restify");
var dialog = require('./dialog');
var trello = require('./trello');
var omnianews = require('./omnianews');
var greeting = require('./greeting');
var askquestion = require('./askquestion');

module.exports={
    start : function() {
        var server = restify.createServer();

        server.listen(process.env.port || process.env.PORT || 3979, function(){
            console.log("%s listening to %s", server.name , server.url);
            console.log(process.env.MICROSOFT_APP_ID);
            console.log(process.env.MICROSOFT_APP_PASSWORD);
        });

        var connector = new builder.ChatConnector({
            appId: process.env.MICROSOFT_APP_ID,
            appPassword: process.env.MICROSOFT_APP_PASSWORD
        });

        var bot = new builder.UniversalBot(connector,function (session) {
            session.send('Sorry, I did not understand \'%s\'', session.message.text);
        });

        server.post("/api/messages",connector.listen());

        var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL);
        // recognizer.onEnabled((context ,callback)=>{
        //     if(context.dialogStack().length > 0){
        //         callback(null, false);
        //     }
        //     else{
        //         callback(null,true);
        //     }
        // });
        bot.recognizer(recognizer);

        bot.dialog('askquestion', askquestion)
        .triggerAction({
            matches: 'askquestion',
            onInterrupted: function (session) {
                session.endConversation('hmmmm , i got error with LUIS ai , please start over again!');
            }
        });

        bot.dialog('sayGreeting', greeting)
        .triggerAction({
            matches: 'sayGreeting',
            onInterrupted: function (session) {
                session.endConversation('hmmmm , i got error with LUIS ai , please start over again!');
            }
        });

        bot.dialog('searchTrello', trello)
        .triggerAction({
            matches: 'searchTrello',
            onInterrupted: function (session) {
                session.endConversation('hmmmm, Trello is not response now');
            }
        });

        bot.dialog('searchOmnia', omnianews)
        .triggerAction({
            matches: 'searchOmnia',
            onInterrupted: function (session) {
                session.endConversation('hmmmm, Omnia is not response now');
            }
        });

    }
}