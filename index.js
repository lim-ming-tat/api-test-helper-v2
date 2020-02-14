"use strict" 

const crypto = require('crypto');
const request = require('superagent');
const fs = require('fs');
const promise = require('bluebird');
const qs = require('querystring');
const { URL } = require('url');

const _ = require("lodash");

const apex = require('node-apex-api-security').ApiSigningUtil;

//const dateFormat = require('./timestamp').dateFormat;
const { DateTime } = require("luxon");

var totalTest = 0;
var passedTest = 0;
var skipTest = 0;

let util = {};
const indentation = "   ";

function nonceLib() {
    return crypto.randomBytes(32).toString('base64');
}

util.invokeRequest = (param) => {
    return new promise(function(resolve, reject){
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
        if (param.ignoreServerCert == undefined || param.ignoreServerCert)
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        const targetURL = new URL(param.invokeUrl);

        // construct query string
        if (param.queryString != undefined) {
            targetURL.search = qs.stringify(param.queryString, null, null, {encodeURIComponent: encodeURIComponent}) + targetURL.search.replace('?', '&');
        }

        let req = request(param.httpMethod, targetURL.href);

        req.buffer(true);

        if (param.caCertFileName != undefined){
            //req.ca(fs.readFileSync(param.caCertFileName, "utf8"));
            req.ca(fs.readFileSync(param.caCertFileName));
        }

        if (param.signature != undefined && param.signature.length > 0) {
            req = req.set("Authorization", param.signature);
        }

        if (param.testTag != undefined && param.testTag) {
            req = req.set("NODE-Test-Tag", param.id + ". " + param.description);
        }
    
        if (param.httpHeaders != undefined) {
            // Iterate through properties of headers
            for (let key in param.httpHeaders) {
                req = req.set(key, param.httpHeaders[key]);
            }
        }

        if ((param.httpMethod == "POST" || param.httpMethod == "PUT") && param.formData != undefined) {
            let postData = qs.stringify(param.formData, null, null, {encodeURIComponent: encodeURIComponent});
            req = req.type("application/x-www-form-urlencoded").set("Content-Length", Buffer.byteLength(postData)).send(postData);
        }

        if ((param.httpMethod == "POST" || param.httpMethod == "PUT") && param.jsonData != undefined) {
            if (param.base64Data != undefined) {
                let buff = fs.readFileSync(param.base64Data.dataFileName);  
                let base64data = buff.toString('base64');
                param.jsonData[param.base64Data.fieldName] = base64data;
            }

            let postData = JSON.stringify(param.jsonData);
            req = req.type("application/json").send(postData);
        }

        if ((param.httpMethod == "POST" || param.httpMethod == "PUT") && param.textData != undefined) {
            let postData = param.textData.data

            if (param.textData.dataFileName != undefined) {
                postData = fs.readFileSync(param.textData.dataFileName, "utf8")

                //console.log(JSON.stringify(param, null, 4));
                if (param.textData.replaceMapper != undefined) {
                    var jsonData = JSON.stringify(postData);
            
                    for (let key in param.textData.replaceMapper) {
                        var replace = "{{" + key + "}}";
                        var regex = new RegExp(replace, "g");
            
                        jsonData = jsonData.replace(regex, _.get(param, _.get(param.textData.replaceMapper, key)));
                    }
                    postData = JSON.parse(jsonData)
                }
            }

            req = req.type(param.textData.contentType).send(postData);
        }

        if ((param.httpMethod == "POST" || param.httpMethod == "PUT") && param.binaryData != undefined) {
            let postData = null;

            if (param.binaryData.dataFileName != undefined)
                postData = fs.readFileSync(param.binaryData.dataFileName)

            req = req.type(param.binaryData.contentType).send(postData);
        }

        // handle multiPartData POST request
        if (param.multiPartData != undefined) {
            if (param.multiPartData.fields != undefined) {
                for (let key in param.multiPartData.fields) {
                    req = req.field(key, param.multiPartData.fields[key]);
                }
            }

            if (param.multiPartData.attachments != undefined) {
                for (let key in param.multiPartData.attachments) {
                    if (Array.isArray(param.multiPartData.attachments[key])) {
                        _.forEach(param.multiPartData.attachments[key], function(paramValue) { 
                            // trigger error if file not found...
                            // req.attach does not propagate error
                            fs.readFileSync(paramValue);

                            req = req.attach("files", paramValue);
                        });
                    } else {
                        // trigger error if file not found...
                        // req.attach does not propagate error
                        fs.readFileSync(param.multiPartData.attachments[key]);

                        req = req.attach(key, param.multiPartData.attachments[key]);
                    }
                }
            }

            req = req.type("multipart/form-data");
        }

        //param.startTime = new Date();
        param.startTime = DateTime.local();
        req.then(function(res) {
            //param.timespan = param.startTime.timespan();
            param.endTime = DateTime.local();
            resolve(res);
        })
        .catch(function(err) {
            //param.timespan = param.startTime.timespan();
            param.endTime = DateTime.local();
            reject(err);
        });
    });
}

util.performTest = (params) => {
    return util.performTestInternal(params)
        .then(message => {
            if (defaultParam.suppressMessage == undefined || !defaultParam.suppressMessage)
            {
                //console.log("\n<<<<<< Start >>>>>>\n" + message + "\n<<<<<< End >>>>>>")
                console.log(`\n${defaultParam.batchPrefix}${message}\n${defaultParam.batchSuffix}`)
            }
        });
}
util.performTestInternal = (params) => {
    var cloneParams = JSON.parse(JSON.stringify(params));

    return util.performTestRecursive(cloneParams)
}

util.performTestRecursive = (params) => {
    //console.log( "Entering recursive function for [", params.length, "]." );
    
    var testFunction = util.executeTest;

    // Once we hit zero, bail out of the recursion. The key to recursion is that
    // it stops at some point, and the callstack can be "rolled" back up.
    if ( params.length === 0 ) {
        return( Promise.resolve("") );
    }
    
    var item = params;
    var newParams = [];

    if (Array.isArray(params)){
        // clone the parameter array, may not work if consists of object reference
        var cloneParams = JSON.parse(JSON.stringify(params));

        // split the array to first item and the rest of the array
        item = cloneParams.splice(0,1)[0];
        newParams = cloneParams.splice(0);
    }

    var tangentialPromiseBranch = undefined;

    //parallel execution of call
    if(item.parallel != undefined && item.parallel > 1) {
        var parallel = item.parallel;
        item.parallel = undefined;

        var functionArray = [];
        var itemJson = JSON.stringify(item);

        for (var i = 0; i < parallel; i++) {
            var newItem = JSON.parse(itemJson);

            if (newItem.queryString == undefined) newItem.queryString = {};

            newItem.id += " parallel=" + i;
            newItem.queryString.llid = require('uuid/v1')().substring(0,8);
            newItem.description += " llid=" + newItem.queryString.llid;

            functionArray.push(util.performTestRecursive(newItem));
        }

        tangentialPromiseBranch = Promise.all(functionArray);
    }
    else 
    {
        // Implement repeats call for parameter with repeats attribute
        if (item.repeats != undefined && item.repeats > 1){
            var repeats = item.repeats - 2;
            item.repeats = undefined;

            // assign uuid to first item
            if (item.queryString == undefined) item.queryString = {};

            var stringCopy = JSON.stringify(item);

            item.id += " repeat=1";
            item.queryString.uuid = require('uuid/v1')().substring(0,8);
            item.description += " uuid=" + item.queryString.uuid;

            var repeatedParam = "";
            if (repeats == 0) {
                // repeats 2 times, so just add 1 item
                repeatedParam = JSON.parse('[' + stringCopy + ']');
            } else {
                repeatedParam = JSON.parse('[' + (stringCopy + ',').repeat(repeats) + stringCopy + ']');
            }

            var repeatCounter = 1;

            // assign uuid to the rest
            _.forEach(repeatedParam, function(param) {
                param.id += " repeat=" + ++repeatCounter;
                param.queryString.uuid = require('uuid/v1')().substring(0,8); param.description += " uuid=" + param.queryString.uuid; 
            });

            newParams = _.concat(repeatedParam, newParams);
        }

        tangentialPromiseBranch = testFunction(item);
    }

    return (tangentialPromiseBranch.then(
        function(message) {
            // message can be string or array, array return by promise.all 
            //console.log("6..." + message);
            if (Array.isArray(message) && message.length > 0) message = message.join("");
            return ( util.performTestRecursive(newParams).then( (childMessage) => { 
                //console.log("7.1..." + message + "<<<");
                //console.log("7.2..." + childMessage + "<<<");
                if (childMessage.trim().length == 0) return message
                if (message.trim().length == 0) return childMessage
                //if (Array.isArray(childMessage)) childMessage = childMessage.join("\nzzz");

                return message + childMessage

            })
            ); // RECURSE!
        }
    )
    );
}

util.displayTestResult = () => {
    return Promise.resolve("Test Results::: " + passedTest + "/" + totalTest + "\nSkip Test   ::: " + skipTest);
}

var startDate;
util.startTestTimer = () => {
    //startDate = new Date();
    startDate = DateTime.local();
    return Promise.resolve();
}

util.displayElapseTime = () => {
    if (startDate == undefined) return Promise.resolve("Start timer not started!");

    //var ts = startDate.timespan();

    //var message = getElapseTime(startDate, ts);
    var message = getElapseTime(startDate);

    return Promise.resolve(message);
}

function showBaseString(param) {
    // get baseString
    let baseProps = {
        authPrefix: param.authPrefix.toLowerCase(),
        //signatureMethod: param.signatureMethod || "signatureMethod",
        signatureMethod: param.signatureMethod || _.isNil(param.secret) ? 'SHA256withRSA' : 'HMACSHA256',
        appId: param.appId,
        urlPath: param.signatureUrl,
        httpMethod: param.httpMethod,
        queryString: param.queryString || null,
        formData: param.formData || null,
        nonce: param.nonce || "nonce",
        timestamp: param.timestamp || "timestamp"
    };

    param.baseString = apex.getSignatureBaseString(baseProps);
}

function getDescription(param) {
    return param.description == undefined ? "undefined" : param.description.replace(/\n/g, "\n" + indentation);

}

util.getApexSecurityToken = (param) => {
    // no geteway security require...
    if (param.signatureUrl != undefined) {
        // patch, fields rename
        param.urlPath = param.signatureUrl;
        param.certFileName = param.privateCertFileName;

        // set nouce & timestamp
        param.nonce = param.nonce || nonceLib();
        param.timestamp = param.timestamp || (new Date).getTime();

        // set signatureMethod
        //param.signatureMethod = _.isNil(param.secret) ? 'SHA256withRSA' : 'HMACSHA256';

        param.signature = apex.getSignatureToken(param);

        if (param.debug) showBaseString(param);
    }

    if (param.nextHop != undefined && param.nextHop.signatureUrl != undefined) {
        // propagate queryString and formData to nextHop...
        param.nextHop.queryString = param.queryString;
        param.nextHop.formData = param.formData;

        // propagate old peroperty...
        param.nextHop.urlPath = param.nextHop.signatureUrl;
        param.nextHop.certFileName = param.nextHop.privateCertFileName;

        // set nouce & timestamp
        param.nextHop.nonce = param.nextHop.nonce || nonceLib();
        param.nextHop.timestamp = param.nextHop.timestamp || (new Date).getTime();

        // set signatureMethod
        //param.nextHop.signatureMethod = _.isNil(param.secret) ? 'SHA256withRSA' : 'HMACSHA256';

        let childToken = apex.getSignatureToken(param.nextHop);

        if (param.debug) showBaseString(param.nextHop);

        if (childToken != null) {
            if (param.signature != undefined && param.signature.length > 0 ) {
                param.signature += ', ' + childToken;
            } else {
                param.signature = childToken;
            }
        }
    }
}

var defaultParam = undefined;
util.setDefaultParam = (defaultValue) => {
    defaultParam = defaultValue;

    if (defaultParam.batchPrefix == undefined) defaultParam.batchPrefix = "== Start =="
    if (defaultParam.batchSuffix == undefined) defaultParam.batchSuffix = "==  End  =="
}

util.getDefaultParam = () => {
    return defaultParam;
}

util.displaySessionData = () => {
    return Promise.resolve("Session Data::: " + JSON.stringify(defaultParam.sessionData, null, 4));
}

function propagateDefaultValue(param) {
    if (defaultParam == undefined) return;

    for (let key in defaultParam) {
        if (param[key] == undefined) param[key] = defaultParam[key];
    }
}

function applyReplaceMaps(param) {
    // setup the athhorization header for cm api
    // prerequisite: 
    //      param.sessionData.atmoToken
    //      param.sessionData.csrfToken
    if (param.setupCmApiHeader) {
        if (param.httpHeaders == undefined) param.httpHeaders = {};

        if (param.sessionData.atmoToken) param.httpHeaders.cookie = param.sessionData.atmoToken.cookie;
        if (param.sessionData.csrfToken) param.httpHeaders['X-' + param.sessionData.csrfToken.name] = param.sessionData.csrfToken.token;
    }

    // replace property value with value from sessionData
    if (param.replaceMaps != undefined) {
        param.replaceMaps.forEach(item => {
            // skipTest mapping has been perfrom during skipTestCheck, skip it here...
            if (item.propertyName != "skipTest") {
                if (typeof _.get(param, item.propertyName) == "string") {
                    var replace = "{{" + item.replaceValue + "}}";
                    var regex = new RegExp(replace, "g");

                    _.set(param, item.propertyName, _.get(param, item.propertyName).replace(regex, _.get(param, item.replaceValue)));
                } else {
                    _.set(param, item.propertyName, _.get(param, item.replaceValue));
                }
            }
        });
    }
}

function skipTestCheck(param) {
    // perform replace mapping for skipTest only, as it should be validated before the preHttpRequest processing
    if (param.replaceMaps != undefined) {
        param.replaceMaps.forEach(item => {
            if (item.propertyName == "skipTest") {
                _.set(param, item.propertyName, _.get(param, item.replaceValue));
            }
        });
    }

    if (param.skipTest != undefined && param.skipTest)
        return true;
    else
        return false;
}

util.executeTest = (param) => {
    return new promise(function(resolve, reject){
        var childMessage = "";

    return new promise(function(resolve){

        // propagate default params
        propagateDefaultValue(param);

        if (skipTestCheck(param)) {
            return resolve("???");
        }

        if (param.preHttpRequest != undefined) {
            // execute pre Http Request function from parameters
            util[param.preHttpRequest](param)
                .then(message => { 
                    if (message.trim().length > 0)
                        childMessage += indentation + message.replace(/\n/g, "\n" + indentation)
                });
        }

        applyReplaceMaps(param);

        // Count Test
        totalTest += 1;

        // validate parameters here...
        if (param.formData != undefined && Array.isArray(param.formData)) {
            throw new Error("Property 'formData' cannot be an array.\nparam:::\n" + JSON.stringify(param, null, 4));
        }

        if (param.queryString != undefined && Array.isArray(param.queryString)) {
            throw new Error("Property 'queryString' cannot be an array.\nparam:::\n" + JSON.stringify(param, null, 4));
        }

        // get the authorization token
        util.getApexSecurityToken(param);

        return util.invokeRequest(param).then(function(res) {
            if (!_.isEmpty(res.body))
                param.responseBody = res.body;
            else
                param.responseText = res.text;

            if (param.verifyHttpRequest != undefined) {
                if (param.verifyMessage == undefined) param.verifyMessage = "\n";

                // execute verification function from parameters
                return util[param.verifyHttpRequest](param, res).then(testResult => { 
                    param.testPassed = testResult.result; 
                    return { message: testResult.message, response: res }
                });
            } else if (param.verifyFunction != undefined) {
                if (param.verifyMessage == undefined) param.verifyMessage = "\n";

                // execute verification function from parameters
                return util[param.verifyFunction](param, res).then(testResult => { 
                    param.testPassed = testResult; 
                    return { response: res }
                });
            } else {
                // test pass
                param.testPassed = true;
                return { response: res }
            }
        }).then( (requestResponse) => { 
            var message = requestResponse.message

            //console.log("finally message:::" + message);
            if (message != undefined && message.trim().length > 0)
                childMessage += indentation + message.replace(/\n/g, "\n" + indentation)

            return requestResponse.response
        }).then( (response) => { 
            if (param.postHttpRequest != undefined) {
                // execute post Http Request function from parameters
                return util[param.postHttpRequest](param, response).then(message => { 
                    if (message.trim().length > 0)
                        childMessage += indentation + message.replace(/\n/g, "\n" + indentation)
                });
            }
        }).catch(function(error) { 
            param.error = error;

            if (param.negativeTest != undefined && param.negativeTest){
                param.testPassed = true;
            }
        }).finally( () => { return resolve() });
/*
    }).then( () => { 
        if (param.postHttpRequest != undefined) {
            // execute post Http Request function from parameters
            return util[param.postHttpRequest](param).then(message => { 
                if (message.trim().length > 0)
                    childMessage += indentation + message.replace(/\n/g, "\n" + indentation)
            });
        }
*/
    }).then( () => { 
        if (param.nextHopParams != undefined && param.nextHopParams.length > 0) {
            return util.performTestInternal(param.nextHopParams).then( message => {
                // indent the child message and save for top level...
                if (message.trim().length > 0) childMessage += indentation + message.replace(/\n/g, "\n" + indentation);
            });
        }
    }).then( () => { 
        if (param.delay == undefined) {
            param.delay = 0;
        }
    }).delay(param.delay)
    .catch(function(error) {
        param.error = error;
    }).finally( () => {
        if (param.skipTest != undefined && param.skipTest) {
            skipTest++;
            //return;
            return resolve("");
        }
        var message = ""

        if (param.debug) {
            //console.log(">>> " + param.id + ". " + param.description + " <<< - Start.");
            message += "\n>>> " + param.id + ". " + getDescription(param) + " <<< - Start.";

            if (param.baseString != undefined) {
                //console.log('\nBaseString::: \n' + param.baseString);
                message += "\n" + indentation + 'BaseString::: \n' + indentation + param.baseString + "\n";
            }
            if (param.nextHop != undefined && param.nextHop.baseString != undefined) {
                //console.log('\nNextHop BaseString::: \n' + param.nextHop.baseString);    
                message += "\n" + indentation + 'NextHop BaseString::: \n' + indentation+ param.nextHop.baseString + "\n";
            }

            if (param.signature != undefined) {
                //console.log('\nAuthorization Token::: \n' + param.signature);
                message += "\n" + indentation + 'Authorization Token::: \n' + indentation + param.signature + "\n";
            }
        
            //console.log("\nURL:::");
            //console.warn(param.invokeUrl);
            message += "\n" + indentation + "URL >>> " + setColor.warn(param.invokeUrl);

            if (param.responseBody != undefined || param.responseText != undefined) {
                //console.log("\nResponse:::");
                message += "\n" + indentation + "Response >>> ";
            }
            if (param.responseBody != undefined) {
                //console.log(JSON.stringify(param.responseBody, null, 4));
                message += "OBJECT >>>\n" + indentation + JSON.stringify(param.responseBody, null, 4).replace(/\n/g, "\n" + indentation);
            }
            if (param.responseText != undefined) {
                //console.log("TEXT:::" + param.responseText);
                message += "TEXT >>>\n" + indentation + param.responseText.replace(/\n/g, "\n" + indentation);
            }

            if (param.delay > 0) {
                //console.log("Execution Delay(Milliseconds):::" + param.delay);
                message += "\n" + indentation + "Execution Delay(Milliseconds) >>> " + param.delay;
            }

            if (param.verifyMessage != undefined && param.verifyMessage.trim().length > 0) {
                //console.log(param.verifyMessage);
                //message += "\n" + indentation + param.verifyMessage.replace(/\n/g, "\n" + indentation);
                message += "\n" + indentation + "Validation Message >>> " + setColor.warn(param.verifyMessage) 
            }
        }

        if (param.testPassed != undefined && param.testPassed) {
            passedTest++;

            if(!param.suppressMessage) {
                //if(param.debug) console.log();
                if (param.negativeTest != undefined && param.negativeTest) {

                    if (param.testErrorMessage != undefined && param.testErrorMessage == ((param.error) ? param.error.message : '')) {
                        //console.log(">>> " + param.id + ". " + param.description + " <<< - Negative Test Success.\n" + param.error.message + "\n");
                        message += "\n>>> " + param.id + ". " + getDescription(param) + " <<< - Negative Test Success.";
                        message += "\n" + indentation + param.error.message;
                    } else {
                        passedTest--;
                        //console.log(">>> " + param.id + ". " + param.description + " <<< - Negative Test Failed.\nExpecting Error:::" + param.testErrorMessage + "\n        But Get:::" + ((param.error) ? param.error.message : '') + "\n");
                        //message += "\n" + indentation + ">>> " + param.id + ". " + getDescription(param) + " <<< - Negative Test Failed.\nExpecting Error:::" + param.testErrorMessage + "\n        But Get:::" + ((param.error) ? param.error.message : '') + "\n\n"
                        message += "\n" + indentation + ">>> " + param.id + ". " + getDescription(param) + " <<< - Negative Test Failed."
                        message += "\n" + indentation + "Expecting::: " + setColor.warn(param.testErrorMessage)
                        message += "\n" + indentation + "But Got:::   " + setColor.warn((param.error) ? param.error.message : '')
                    }
                } else {
                    //console.log(">>> " + param.id + ". " + param.description + " <<< - Success.");
                    if (param.debug)
                        message += "\n>>> " + " <<< - Success.";
                    else
                        message += "\n>>> " + param.id + ". " + getDescription(param) + " <<< - Success.";

                        //message += "\n>>> " + param.id + ". " + getDescription(param) + " <<< - ===" + childMessage + "===";
                }

                if (param.delay > 0) {
                    //console.info(">>> Execution Delay(Milliseconds):::" + param.delay);
                    message += "\n" + indentation + ">>> Execution Delay(Milliseconds):::" + param.delay;
                }
            }
        } else {
            //if (param.debug) console.log();
            if (!param.debug) {
                //console.log(">>> " + param.id + ". " + param.description + " <<< - Start.");
                //console.log("\nURL:::");
                //console.warn(param.invokeUrl);
                //console.log();

                message += "\n>>> " + param.id + ". " + getDescription(param) + " <<< - Start.";
                //message += indentation + "URL:::\n"
                //message += indentation + setColor.warn(param.invokeUrl)
                //message += "\n"
                message += `\n${indentation}URL::: ${setColor.warn(param.invokeUrl)}`
            }
            //console.log(">>> " + param.id + ". " + param.description + " <<< - Failed. " + param.error.message);
            //console.log(">>> " + param.id + ". " + param.description + " <<< - Failed. " + setColor.error(param.error.message));
            //message += indentation + ">>> " + param.id + ". " + param.description + " <<< - Failed. " + setColor.error(param.error.message) + "\n"
            
            //message += indentation + "Failed - " + setColor.error(param.error.message) + "\n"
            if (param.error != undefined && param.error.message != undefined) {
                message += "\n" + indentation + "Failed - " + setColor.error(param.error.message)
            }
            if (!param.debug && param.verifyMessage != undefined && param.verifyMessage != "") {
                message += "\n" + indentation + "Validation failed - " + setColor.error(param.verifyMessage) 
            }

            if (param.error != undefined && param.error.response != undefined) {
                //console.error("   >>> statusCode::: " + param.error.response.statusCode);
                //console.error("   >>> clientError::: " + param.error.response.clientError);
                //console.error("   >>> serverError::: " + param.error.response.serverError);
                message += `\n${indentation}>>> statusCode:::  ${param.error.response.statusCode}`
                message += `\n${indentation}>>> clientError::: ${param.error.response.clientError}`
                message += `\n${indentation}>>> serverError::: ${param.error.response.serverError}`
                
                //if(param.debug) console.log(param.error);
                if(param.debug) message += `\n${indentation}${setColor.error(param.error)}`

                //console.log("=== errorText::: ===");
                //console.error(param.error.response.error.text);
                //console.log("=== errorText::: ===");
                //message += indentation + "=== errorText::: ===" + "\n";
                message += `\n${indentation}=== errorText::: ===`
                message += "\n" + indentation + param.error.response.error.text.replace(/\n/g, "\n" + indentation);
                //message += indentation + "=== errorText::: ===" + "\n";
                message += `\n${indentation}=== errorText::: ===`
            }
        }

        //if (param.showElapseTime) console.log("\n" + getElapseTime(param.startTime, param.timespan));
        if (param.showElapseTime) {
            //console.log("\n" + getElapseTime(param.startTime, param.endTime));
            message += "\n" + indentation + getElapseTime(param.startTime, param.endTime).replace(/\n/g, "\n" + indentation);
        }
        
        //console.log("message:::" + message)
        //if (childMessage != "") message += "\n" + indentation + childMessage.replace(/\n/g, "\n" + indentation);

        if (childMessage.trim().length > 0)
            if (message.trim().length > 0 ) 
                message += childMessage;
            else
                message = childMessage;

        if (param.debug || param.error != undefined) {
            //console.log(">>> " + param.id + ". " + param.description + " <<< - END.");
            //message += ">>> " + param.id + ". " + param.description + " <<< - END."
            if(param.testPassed != undefined && param.testPassed && param.error != undefined) message += "\n" + indentation + setColor.error(param.error);
            message += "\n>>> " + " <<< - END.";
        }
                //if (childMessage  != "") message += "\n" + childMessage;
        //console.log(`--==${message}==--`);
        
        resolve(message);
    });
    });
}
/*
function getElapseTime(startDate, ts) {
    var message = "";
    if (startDate == undefined || ts == undefined) return message;

    message += " Start Time: " + startDate.format() + "\n";
    message += "   End Time: " + ts.endDate.format() + "\n";

    if ((ts.totalSeconds()|0) == 0) {
        message += "Elapse Time: " + ts.milliseconds + " milliseconds";
    } else if ((ts.totalMinutes()|0) == 0) {
        message += "Elapse Time: " + ts.seconds + " seconds " + ts.milliseconds + " milliseconds";
    } else if ((ts.totalHours()|0) == 0) {
        message += "Elapse Time: " + ts.minutes + " minutes " + ts.seconds + " seconds " + ts.milliseconds + " milliseconds";
    } else {
        message += "Elapse Time: " + (ts.totalHours()|0) + " hours " + ts.minutes + " minutes " + ts.seconds + " seconds " + ts.milliseconds + " milliseconds";
    }
    return message;
}
*/
function getElapseTime(startTime, endTime, dateFormat) {
    const DATE_FORMAT = "yyyy-MM-dd TT.SSS"

    var stat = {}
    var message = "";

    if (startTime == undefined) return message;
    if (endTime == undefined) endTime = DateTime.local();
    if (dateFormat == undefined) dateFormat = DATE_FORMAT;

    message += "Start Time : " + startTime.toFormat(DATE_FORMAT) + "\n";
    message += "End Time   : " + endTime.toFormat(DATE_FORMAT) + "\n";
    stat.startTime = startTime.toFormat(DATE_FORMAT);
    stat.endTime = endTime.toFormat(DATE_FORMAT);

    var timeSpan = endTime.diff(startTime, ['days', 'hours', 'minutes', 'seconds', 'milliseconds'])

    var elapseTime = ""
    if ((timeSpan.days|0) > 0) {
        elapseTime += timeSpan.days + " days ";
    }

    if ((timeSpan.hours|0) > 0) {
        elapseTime += timeSpan.hours + " hours ";
    }

    if ((timeSpan.minutes|0) > 0) {
        elapseTime += timeSpan.minutes + " minutes ";
    }

    if ((timeSpan.seconds|0) > 0) {
        elapseTime += timeSpan.seconds + " seconds ";
    }

    if ((timeSpan.milliseconds|0) > 0) {
        elapseTime += timeSpan.milliseconds + " milliseconds";
    }
    stat.elapseTime = elapseTime;
    message += "Elapse Time: " + elapseTime;

    return message;
}

// add support to desplay console message with colors
const colorSet = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    fg: {
     Black: "\x1b[30m",
     Red: "\x1b[31m",
     Green: "\x1b[32m",
     Yellow: "\x1b[33m",
     Blue: "\x1b[34m",
     Magenta: "\x1b[35m",
     Cyan: "\x1b[36m",
     White: "\x1b[37m",
     Crimson: "\x1b[38m"
    },
    bg: {
     Black: "\x1b[40m",
     Red: "\x1b[41m",
     Green: "\x1b[42m",
     Yellow: "\x1b[43m",
     Blue: "\x1b[44m",
     Magenta: "\x1b[45m",
     Cyan: "\x1b[46m",
     White: "\x1b[47m",
     Crimson: "\x1b[48m"
    }
};
var funcNames = ["log", "info", "warn", "error"];
var colors = [colorSet.Reset, colorSet.fg.Green, colorSet.fg.Yellow, colorSet.fg.Red];

// extende console function with color
for (var i = 0; i < funcNames.length; i++) {
    let funcName = funcNames[i];
    let color = colors[i];
    let oldFunc = console[funcName];
    console[funcName] = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length) args = [color + args[0]].concat(args.slice(1), colorSet.Reset);
        oldFunc.apply(null, args);
    };
}

const utilx = require('util');
var setColor = {}
for (var i = 0; i < funcNames.length; i++) {
    let funcName = funcNames[i];
    let color = colors[i];

    setColor[funcName] = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length) {
            args = [color + args[0]].concat(args.slice(1), colorSet.Reset);
            return utilx.format.apply(null, args);
        }
        return "";
    }
}

module.exports = {
    apiHelper : util
};
