var builder = require('botbuilder');
var https = require('https');
module.exports = [
    // Destination
    function (session) {
        session.send(randomGreeting());
        session.endDialog();
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