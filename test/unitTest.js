'use strict'

const helper = require('./../index').apiHelper
const joseVerify = require('./joseVerify')

const paramsSample = require('./sample.json')
const paramsSecurity = require('./sample.security.json')

// register verification function with helper library
// this supports verification function for each call
// default implementation
helper.myVerifyJws = joseVerify.verifyJws
helper.myVerifyJwe = joseVerify.verifyJwe
helper.myVerifyJweJws = joseVerify.verifyJweJws

helper.setDefaultParam({
  // suppress the successful message, will not suppress error message is any
  suppressMessage: false,
  // display verbose debug message
  debug: false,
  // show execution time
  showElapseTime: false,
  // skip a test
  skipTest: false
})

Promise.resolve()
  .then(function () { return helper.startTestTimer() })

  .then(function () { return helper.performTest(paramsSample) })
  .then(function () { return helper.performTest(paramsSecurity) })

  .then(helper.displayTestResult).then(message => console.log('\n' + message))
  .then(helper.displayElapseTime).then(message => console.log('\n' + message + '\n'))
  .then( function () { return console.log('\n' + "Expecting Result to be 30/32" + '\n') } )
  .catch(function (error) {
    console.log(error)
  })
