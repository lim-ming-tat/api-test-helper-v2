"use strict" 

//const helper = require('api-test-helper-v2').apiHelper;
const helper = require('./../index').apiHelper;

let params = require('./data.json');

var defaultParam = {
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
};

helper.setDefaultParam(defaultParam);

Promise.resolve()
    .then(function() { return helper.startTestTimer() })
    
    .then(function() { return helper.performTest(params) })

    .then(helper.displayTestResult).then(message => console.log("\n" + message))
    .then(helper.displayElapseTime).then(message => console.log("\n" + message + "\n"))
    .catch(function(error) { 
        console.log(error.stack);
    })
;
