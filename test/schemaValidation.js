' use strict'

const promise = require('bluebird')

// https://www.npmjs.com/package/isvalid
// npm i isvalid --save
const isvalid = require('isvalid')

// https://regex101.com/r/nG7kA7/1
// /^((?:(https?):\/\/)(?:((\w+):(\w+))@)?((?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9]))|(?:(?:(?:[\w-]+\.){1,2}[\w]{2,3})))(?::(\d+))?((?:\/[\w-]+)*)(?:\/|(\/[\w]+\.[\w]{3,4})|(\?(?:([\w]+=[\w]+)&)*([\w]+=[\w]+))?|\?(?:(wsdl|wadl))))$/
// /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
/*
https://www.example.com
http://www.example.com
www.example.com
example.com
http://blog.example.com
http://www.example.com/product
http://www.example.com/products?id=1&page=2
http://www.example.com#up
http://255.255.255.255
255.255.255.255
http://invalid.com/perl.cgi?key= | http://web-site.com/cgi-bin/perl.cgi?key1=value1&key2
http://www.site.com:8008
https://userid:password@www.example.com:8080/
https://@www.example.com:8080/
https://user@www.example.com:8080/
http://ip-172-31-18-179.ap-southeast-1.compute.internal:9991/api10567live/
https://www.example.com:8080/api/v1/rest/level0/ex
https://www.example.com:8080/api/v1/rest/level0/ex-ex
https://ww-w.example.com:8080/api/v1/rest/level0/ex-ex
https://ww-w.exa-mple.comx:8080/api/v1/rest/level0/ex-ex
*/

var paramSchema0 = {
  type: Object,
  schema: {
    invokeUrl: {
      type: String,
      required: true,
      match: /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
      len: '-2048'
    },
    id: {
      type: String,
      required: false,
      len: '10'
    },
    description: {
      type: String,
      required: false
    },
    httpMethod: {
      type: String,
      required: false,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']
    },

    message: {
      type: String,
      required: false
    }
  }
}

var testArray = [
  { },
  { invokeUrl: true },
  // , { invokeUrl: "true" }
  // , { invokeUrl: "http://www.example.com" }
  // , { invokeUrl: "www.example.com" }
  // , { invokeUrl: "example.com" }
  // , { invokeUrl: "http://www.site.com:8008?param1=value&param2=value" }
  // , { invokeUrl: "sftp://invalid.com/perl.cgi?key=" }
  { invokeUrl: 'https://www.example.com', httpMethod: 'GET', id: '0123456789' }
]

var paramSchema1 = {
  type: Object,
  schema: {
    invokeUrl: {
      type: String,
      required: [true, "Property 'invokeUrl' is required."],
      match: [/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/, "Invalid URL 'invokeUrl'."],
      len: '-2018',
      errors: {
        type: "Property 'invokeUrl' is not of type 'String'."
      }
    },
    message: {
      type: String,
      required: false
    }
  }
}

promise.mapSeries(testArray, (testData) => {
  return isvalid(testData, paramSchema0)
    .then((data) => {
      // Data was validated and valid data is available.
      console.log(data)
    }).catch((err) => {
      // A validation error occurred.
      // if (err.message = param_schema.message)
      //     console.log("Passed...")
      // else
      //     console.log(err.stack)

      // console.log(JSON.stringify(err, null, 4))
      console.log(`Property ${err.validator} validation. Property '${err.keyPath.join(' ')}' - ${err.message}`)
    })
})
