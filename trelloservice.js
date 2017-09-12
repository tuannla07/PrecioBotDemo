'use strict';
var https = require('https');
var rootCas = require('ssl-root-cas/latest').create();
https.globalAgent.options.ca = rootCas;
var request = require('request-promise');

var self = module.exports = {
    getSomeCards : function (callback) {
        var url = "https://api.trello.com/1/boards/sHvwXIFv/cards/?limit=5&key="+process.env.TRELLO_API_KEY+"&token=" + process.env.TRELLO_TOKEN_KEY;
        
        var requestOptions = {    
                method: "GET",
                uri: url
        };
            
        request(requestOptions).then((result)=>{
            var resultData = JSON.parse(result);
            var item = resultData[Math.floor(Math.random()*resultData.length)];

            var attchmentUrl = "https://api.trello.com/1/cards/"+item.id+"/attachments/"+ item.idAttachmentCover+"?&key="+process.env.TRELLO_API_KEY+"&token=" + process.env.TRELLO_TOKEN_KEY;
            var attachmentOptions = {    
                method: "GET",
                uri: attchmentUrl
            };

            request(attachmentOptions).then((result)=>{
                var attachmentData = JSON.parse(result);
                item.attachmentUrl = attachmentData.url;
                callback(item);
            })
        }).catch((error)=>{
            console.log(error);
        });
    }
}