"use strict" 

const helper = require('./../index').apiHelper;

let params = require('./nextHop.json');

helper.setDefaultParam({
    // suppress the successful message, will not suppress error message is any
    suppressMessage: false,
    // display verbose debug message
    debug: false,
    // show execution time
    showElapseTime: false,
    // skip a test
    skipTest: false
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