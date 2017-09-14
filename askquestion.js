var builder = require('botbuilder');
var https = require('https');
module.exports = [
    // Destination
    function (session, args, next) {
        var appearenceEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'appearence');

        if (appearenceEntity) {
            // city entity detected, continue to next step
            session.send("Alright , you are very very handsome !!");
            var message =  new builder.Message(session).addAttachment(createAnimationCard(session));
            session.send(message);
            session.endDialog();
        } else {
            session.send("Who the hell are you ? :^)");
            session.endDialog();
        }
    }
];

function randomGreeting(){
    var emotions =[
        '(yawn) yesss !',
        '(yn) hello you',
        ':) yoyo hello , how can i help you? ',
        ':D hi there !',
    ];
    var item = emotions[Math.floor(Math.random()*emotions.length)]; 
    return item;
}

function createAnimationCard(session) {
    return new builder.HeroCard()
        .title('You are handsome , yeah yeah!')
        .images([builder.CardImage.create(session, 'https://trello-attachments.s3.amazonaws.com/55123b69640dfffcaabc228e/59b79085d6c970e3c93e478a/6026cff212739a8f0d8eb6a0b00667fa/you-look-handsome.jpg')]);
}