"use strict" 

const helper = require('./../index').apiHelper;
const joseVerify = require('./joseVerify');

let params = require('./customFunctions.json');

// register verification function with helper library
// this supports verification function for each call
// default implementation
helper.myVerifyJws = joseVerify.verifyJws;
helper.myVerifyJwe = joseVerify.verifyJwe;
helper.myVerifyJweJws = joseVerify.verifyJweJws;

var localDebug = false;

helper.preHttpRequest = function(param, response) {
    var message = "\npreHttpRequest"
    if (response == undefined) message += " - Response undefined."

    if (localDebug) console.log(message)

    return Promise.resolve(message);
}

helper.verifyHttpRequest = function(param, response) {
    var message = "\nverifyHttpRequest"
    if (response == undefined) message += " - Response undefined."

    if (localDebug) console.log(message)

    return Promise.resolve({ result: true, message: message });
}

helper.verifyHttpRequestFailed = function(param, response) {
    var message = "\nverifyHttpRequestFailed"
    if (response == undefined) message += " - Response undefined."

    if (localDebug) console.log(message)

    return Promise.resolve({ result: false, message: message });
}

helper.postHttpRequest = function(param, response) {
    var message = "\npostHttpRequest"
    if (response == undefined) message += " - Response undefined."

    if (response != undefined) {
        message += "\n" + JSON.stringify(response, null, 4)
    }

    if (localDebug) console.log(message)

    return Promise.resolve(message);
}

helper.setDefaultParam({
    // suppress the successful message, will not suppress error message is any
    suppressMessage: false,
    // display verbose debug message
    debug: false,
    // show execution time
    showElapseTime: false,
    // skip a test
    skipTest: false, 

    batchPrefix: "<<<<<< Start >>>>>>",
    batchSuffix: "<<<<<<  End  >>>>>>",

    // display the session data
    debugSession : false,

    // additional dynamic parameters
    sessionData : null
});

Promise.resolve()
    .then(function() { return helper.startTestTimer() })

    .then(function() { return helper.performTest(params) })

    .then(helper.displayTestResult).then(message => console.log("\n" + message))
    .then(helper.displayElapseTime).then(message => console.log("\n" + message + "\n"))
    .catch(function(error) { 
        console.log(error);
    })
;