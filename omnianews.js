var builder = require('botbuilder');
var https = require('https');
var querystring = require('querystring');
var omniaService = require('./omniaservice');
var $ = require('cheerio');

var DialogLabels = {
    News: 'News',
    EmployeeNews: 'Employee News'
};

module.exports = [
    // Destination
    function (session, args, next) {
        var newscenterEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'newcenter');

        if (newscenterEntity) {
            // city entity detected, continue to next step
            session.dialogData.searchType = 'news';
            next({ response: newscenterEntity.entity });
        } else {
            // no entities detected, ask user for a destination
            //builder.Prompts.text(session, 'hmm, im connecting to omnia....');
            builder.Prompts.choice(
                session,
                'Which news center do you want to get ?',
                [DialogLabels.News, DialogLabels.EmployeeNews],
                {
                    maxRetries: 3,
                    retryPrompt: 'Not a valid option'
                });
        }
    },function (session, result) {
        if (!result.response) {
            // exhausted attemps and no selection, start over
            session.send('Ooops! Too many attemps :( But don\'t worry, I\'m handling that exception and you can try again!');
            return session.endDialog();
        }

        // on error, start over
        session.on('error', function (err) {
            session.send('Failed with message: %s', err.message);
            session.endDialog();
        });

        // continue on proper dialog
        var selection = result.response.entity;
        switch (selection) {
            case DialogLabels.News:
                session.send('one moments');
                omniaService.doAuthenticaion(()=>{
                    omniaService.getNews(getNewsCenterUrl(selection),(news)=>{
                        var newsItems = getNewsItems(session,news);
                        var message = new builder.Message()
                            .attachmentLayout(builder.AttachmentLayout.carousel)
                            .attachments(newsItems);
                        session.endDialog(message);
                    });
                });
                break;
            case DialogLabels.EmployeeNews:
                session.send('one moments');
                omniaService.doAuthenticaion(()=>{
                    omniaService.getNews(getNewsCenterUrl(selection),(news)=>{
                        var newsItems = getNewsItems(session,news);
                        var message = new builder.Message()
                            .attachmentLayout(builder.AttachmentLayout.carousel)
                            .attachments(newsItems);
                        session.endDialog(message);
                    }); 
                });
                break;
        }
    }
];

function getNewsCenterUrl(newsCenterName){
    var newsCenter =[
        {name:"News", value : 'https://spe596856.sharepoint.com/news'},
        {name:"Employee News", value : 'https://spe596856.sharepoint.com/employee-news'},
    ];

    var item = newsCenter.filter((site)=>{
        return site.name === newsCenterName;
    }); 

    if(item)
        return item[0].value;
    return newsCenter[0].value;
}

function getNewsItems(session, items){
    var arrNewsItems = [];
    for(var i = 0 ; i < items.length ; i++)
    {
        arrNewsItems.push(toCard(session, items[i]));
    }
    return arrNewsItems;
}

function toCard(session, news) {
    var imageUrl = process.env.OMNIA_SITE_COLLECTION_URL + $(news.imageHtml).attr("src");
    var pageUrl = process.env.OMNIA_SITE_COLLECTION_URL + news.url;
    var dateStr=news.modified.replace(/T|\:\d\dZ/g,' ');

    return new builder.HeroCard()
        .title(news.title)
        .subtitle(dateStr)
        .text(news.summary)
        .images([builder.CardImage.create(session, imageUrl)])
        .buttons([builder.CardAction.openUrl(session, pageUrl, 'Read more')]);
}