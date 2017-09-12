var request = require('request-promise');
var omniaSettings = require('./botsetting');


var self = module.exports = {

    buildRequest :  (apiPath)=>{
        var fullPath = apiPath ;
        var requestedHeaders = {
            'Accept': 'application/json',
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };
        
        var appendParams = {
            TokenKey: omniaSettings._omniaTokenKey,
            SPUrl: process.env.OMNIA_SITE_COLLECTION_URL,
            Lang: "en-us",
            ContentType :"application/json"
        };

        fullPath = self.updateQueryStringParameter(fullPath, "TokenKey", appendParams.TokenKey);
        fullPath = self.updateQueryStringParameter(fullPath, "SPUrl", appendParams.SPUrl);
        fullPath = self.updateQueryStringParameter(fullPath, "Lang", appendParams.Lang);
        fullPath = self.updateQueryStringParameter(fullPath, "ContentType", appendParams.ContentType);

        var doGet = () => {
            return doHttp(null , "GET");
        };

        var doPost = (body)=>{
            return doHttp(body ,"POST");
        };

        var doHttp = (body , action ) => {
            var requestOptions = {    
                method: action, 
                rejectUnauthorized: false,
                uri: fullPath,
                headers: requestedHeaders
            };
            
            if(action !== "GET" || action !== "DELETE"){
                requestOptions["body"] = body;
            }
                

            return request(requestOptions);
        }

        return {
            doGet: doGet,
            doPost: doPost
        }
    },

    updateQueryStringParameter : (apiPath, key, value) => {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = apiPath.indexOf('?') !== -1 ? "&" : "?";
        if (apiPath.match(re)) {
            return apiPath.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return apiPath + separator + key + "=" + value;
        }
    }
}