'use strict';
var https = require('https');
var rootCas = require('ssl-root-cas/latest').create();
https.globalAgent.options.ca = rootCas;
//var spauth = require('node-sp-auth');
var request = require('request-promise');
var spAuth = require('spo-auth');
var $ = require('cheerio');
var omniaSettings = require('./botsetting');
var ajaxservice = require('./ajaxservice');

var self = module.exports = {

    doAuthenticaion: function (callback) {

        if(omniaSettings._omniaTokenKey !== undefined && omniaSettings._omniaTokenKey !== null && omniaSettings._omniaTokenKey !== "")
        {
            callback();
            return;
        }

        var config = {
            host : process.env.OMNIA_HOST_URL,
            login : process.env.OMNIA_LOGIN_USERNAME,
            password : process.env.OMNIA_LOGIN_PASSWORD
        };

        spAuth.getRequestDigest(config, function (err, data) {         
            var appRedUrl = process.env.OMNIA_APP_REDIRECT_URL;
            var spHostUrl = appRedUrl.substring(appRedUrl.indexOf("SPHostUrl%3d") + 12, appRedUrl.indexOf("%26"));
            appRedUrl = appRedUrl.replace(spHostUrl, process.env.OMNIA_SITE_COLLECTION_URL);

            var requestOptions = {            
                host: data.host,
                path: appRedUrl,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Content-type': 'text/html; charset=utf-8',
                    'Cookie': 'FedAuth=' + data.FedAuth + '; rtFa=' + data.rtFa,
                    'X-RequestDigest': data.digest
                }
            };
            
            var req = https.request(requestOptions, function (res) {
                var resp = '';

                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    resp += chunk;
                });

                res.on('error', function (err) {
                    console.log(err);
                })

                res.on('end', function () {
                    var arrDOM = $.parseHTML(resp);
                    var form = arrDOM.filter((ele)=>{
                        return ele.name =='form' && ele.attribs.id === "frmRedirect";
                    });
                    if(form !== undefined && form !== null && form.length > 0)
                    {
                        var postUrl = $(form[0]).attr("action");
                        self.doOnlineTokenDance(callback ,data, postUrl, $(form[0]));
                    }
                    
                });
            })

            req.end('');
        });
    },

    doOnlineTokenDance : function (callback, data ,postUrl, form) {  
        var options = {
            method:"POST",
            uri : postUrl,
            rejectUnauthorized: false,
            body:{
                SPAppToken: form.find("input[name='SPAppToken']").val(),
                SPSiteUrl: form.find("input[name='SPSiteUrl']").val(),
                SPSiteTitle: form.find("input[name='SPSiteTitle']").val(),
                SPSiteLogoUrl: form.find("input[name='SPSiteLogoUrl']").val(),
                SPSiteLanguage: form.find("input[name='SPSiteLanguage']").val(),
                SPSiteCulture: form.find("input[name='SPSiteCulture']").val(),
                SPRedirectMessage: form.find("input[name='SPRedirectMessage']").val(),
                SPCorrelationId: form.find("input[name='SPCorrelationId']").val(),
                SPErrorCorrelationId: form.find("input[name='SPErrorCorrelationId']").val(),
                SPErrorInfo: form.find("input[name='SPErrorInfo']").val()
            },
            json: true,
            headers:{
                Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                ContentType:'application/json; charset=utf-8',
                Cookie: 'FedAuth=' + data.FedAuth + '; rtFa=' + data.rtFa
            }
        }
        request(options).then(function(response){
            omniaSettings._omniaTokenKey = response[0];
            callback();
        }).catch((err)=>{
            console.log(err);
        });
    },

    getImportantAnouncement : function (callback) {
        var url = omniaSettings._omniaIntranetApiPath + "announcements?status=1";
        ajaxservice.buildRequest(url)
            .doGet().then((result)=>{
                var resultData = JSON.parse(result);
                callback(resultData.data);
            }).catch((error)=>{
                console.log(error);
            });
    },

    getNews : function (newscenterUrl, callback){
        var url = omniaSettings._omniaIntranetApiPath + "newsviewer?&v=2.0";
        var data = {
                    "newsCenterQuery": [
                        {
                        "newsCenterTitle": "News",
                        "newsCenterUrl": newscenterUrl,
                        "filters": [],
                        "useTargetingSettings": false,
                        "availableFields": [
                            {
                            "displayName": "Hide physical URLs from search",
                            "internalName": "PublishingIsFurlPage",
                            "typeAsString": "Boolean",
                            "additionalInfo": {},
                            "isSelected": false,
                            "isShowInEditMode": false,
                            "isShowInViewMode": false,
                            "isShowInShowMore": false,
                            "isShared": false,
                            "isShowLabel": false,
                            "readOnlyField": false,
                            "required": false,
                            "groupPermission": null,
                            "canEditField": false,
                            "displayFormat": null,
                            "isFieldAllowMultiple": false
                            },
                            {
                            "displayName": "Hide from Internet Search Engines",
                            "internalName": "RobotsNoIndex",
                            "typeAsString": "Boolean",
                            "additionalInfo": {},
                            "isSelected": false,
                            "isShowInEditMode": false,
                            "isShowInViewMode": false,
                            "isShowInShowMore": false,
                            "isShared": false,
                            "isShowLabel": false,
                            "readOnlyField": false,
                            "required": false,
                            "groupPermission": null,
                            "canEditField": false,
                            "displayFormat": null,
                            "isFieldAllowMultiple": false
                            },
                            {
                            "displayName": "Enterprise Keywords",
                            "internalName": "TaxKeyword",
                            "typeAsString": "TaxonomyFieldTypeMulti",
                            "additionalInfo": {
                                "termSetId": "63186e99-24a8-4f06-8387-f0edd7839bad",
                                "allowMultipleValues": "True",
                                "createValuesInEditForm": "False",
                                "open": "True"
                            },
                            "isSelected": false,
                            "isShowInEditMode": false,
                            "isShowInViewMode": false,
                            "isShowInShowMore": false,
                            "isShared": false,
                            "isShowLabel": false,
                            "readOnlyField": false,
                            "required": false,
                            "groupPermission": null,
                            "canEditField": false,
                            "displayFormat": null,
                            "isFieldAllowMultiple": true
                            }
                        ],
                        "isLoadingFields": false
                        }
                    ],
                    "periodType": 4,
                    "periodField": "",
                    "viewFields": null,
                    "itemLimit": 5,
                    "skipId": 0,
                    "orderByFields": [
                        {
                        "fieldName": "ArticleStartDate",
                        "ascending": false,
                        "editable": true
                        },
                        {
                        "fieldName": "Modified",
                        "ascending": false,
                        "editable": false
                        }
                    ],
                    "priority": 1,
                    "translatedNews": 1,
                    "pageLocale": "en-us"
                    };
        var strData = JSON.stringify(data);
        ajaxservice.buildRequest(url)
            .doPost(strData).then((result)=>{
                var resultData = JSON.parse(result);
                callback(resultData.data);
            }).catch((error)=>{
                console.log(error);
            });
    }
}