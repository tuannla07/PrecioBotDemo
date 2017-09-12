var builder = require('botbuilder');
var https = require('https');
var querystring = require('querystring');
var trelloService = require('./trelloservice');
module.exports = [
    // Destination
    function (session) {
        session.send(randomEmotion());
        trelloService.getSomeCards((card)=>{
            var message = new builder.Message()
                .attachments([toTrelloCard(card)]);
            session.send(message);
            // End
            session.endDialog();
        });
    }
];

function randomEmotion(){
    var emotions =[
        '(:| alright !!',
        '(shock)',
        '(cool) Here you are!! '
    ];
    var item = emotions[Math.floor(Math.random()*emotions.length)]; 
    return item;
}

function toTrelloCard(card) {
    return new builder.HeroCard()
        .title(card.name)
        .subtitle(card.desc)
        .images([new builder.CardImage().url(card.attachmentUrl)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value(card.url)
        ]);
}