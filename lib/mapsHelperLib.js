'use strict'

const _ = require('lodash')

const { PropertyUndefinedError, DataPathUndefinedError } = require('./errors')

const helperLib = {}
module.exports = helperLib

// escape regular expression character
// credit: https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
RegExp.escape = function (s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

const CONDITION_AND = 'and'
const CONDITION_OR = 'or'

helperLib.filterData = filterData
function filterDataV2 (item, dataFilter) {
  var leftOperand
  var rightOperand = undefined

  if (dataFilter !== undefined && dataFilter !== null) {
    if (dataFilter.startsWith !== undefined || dataFilter.regex !== undefined) {
      var replace = ''
      if (dataFilter.startsWith !== undefined) {
        replace = '^' + RegExp.escape(dataFilter.startsWith)
      } else {
        replace = dataFilter.regex
      }
      var regex = new RegExp(replace, 'gi')
      // console.log(replace + "===" + _.get(item, dataFilter.propertyName).match(regex))
      // console.log(replace + "===" + _.get(item, dataFilter.propertyName))
      // console.log('===' + replace + "===" + JSON.stringify(item, null, 4))
      if (_.get(item, dataFilter.propertyName).match(regex) != null) {
        return true
      }
    }

    if (dataFilter.conditions !== undefined) {
      if (typeof dataFilter.conditions !== 'string') {
        throw new Error('Invalid datatype for dataFilter.conditions, expecting string datatype.')
      }

      if (dataFilter.conditions.toLowerCase() !== CONDITION_AND && dataFilter.conditions.toLowerCase() !== CONDITION_OR) {
        throw new Error('Invalid data value for dataFilter.conditions, expecting "and" or "or".')
      }

      if (!(dataFilter.filters !== undefined && Array.isArray(dataFilter.filters))) {
        throw new Error('Invalid datatype for dataFilter.filters, expecting array datatype.')
      }

      // set to true for and condition and set to false for or condition
      var result = dataFilter.conditions.toLowerCase() === CONDITION_AND

      // dataFilter.filters.forEach(filter => {
      //     if (dataFilter.conditions.toLowerCase() === CONDITION_AND) {
      //         result = result && filterDataV2 (item, filter)
      //         // // short circuit return when hit first false
      //         // // can't short circuit forEach loop
      //         // if (!result) { return result }
      //     } else {
      //         result = result || filterDataV2 (item, filter)
      //         // // short circuit return when hit first true
      //         // // can't short circuit forEach loop
      //         // if (result) { return result }
      //     }
      // })

      for (var i = 0; i < dataFilter.filters.length; i++) {
        if (dataFilter.conditions.toLowerCase() === CONDITION_AND) {
          result = result && filterDataV2(item, dataFilter.filters[i])
          // short circuit return when hit first false
          // console.log("and:::" + dataFilter.filters[i].propertyName)
          if (!result) { return result }
        } else {
          result = result || filterDataV2(item, dataFilter.filters[i])
          // short circuit return when hit first true
          // console.log(" or:::" + dataFilter.filters[i].propertyName)
          if (result) { return result }
        }
      }

      return result
    }

    if (dataFilter.equal !== undefined) {
      // console.log()
      // console.log(JSON.stringify(_.get(item, "title"), null, 4))
      // console.log(JSON.stringify(dataFilter, null, 4))

      leftOperand = _.get(item, dataFilter.propertyName)
      // missing the required property
      if (leftOperand === undefined) {
        throw new PropertyUndefinedError(dataFilter.propertyName, item)
      }

      if (typeof dataFilter.equal === 'string') {
        rightOperand = dataFilter.equal
      } else {
        if (dataFilter.equal.propertyName !== undefined) {
          rightOperand = _.get(item, dataFilter.equal.propertyName)

          // missing the required property
          if (rightOperand === undefined) {
            throw new PropertyUndefinedError(dataFilter.equal.propertyName, item, dataFilter)
          }
        } else if (dataFilter.equal.dataValue !== undefined) {
          rightOperand = dataFilter.equal.dataValue
        } else if (rightOperand === undefined) {
          throw new PropertyUndefinedError(['dataFilter.equal.propertyName', 'dataFilter.equal.dataValue'], item, dataFilter)
        }
      }

      // console.log(`${leftOperand} == ${rightOperand} => ${leftOperand == rightOperand}`)
      return leftOperand === rightOperand
    }

    if (dataFilter.notEqual !== undefined) {
      // console.log()
      // console.log(JSON.stringify(_.get(item, "title"), null, 4))
      // console.log(JSON.stringify(dataFilter, null, 4))

      leftOperand = _.get(item, dataFilter.propertyName)
      // missing the required property
      if (leftOperand === undefined) {
        throw new PropertyUndefinedError(dataFilter.propertyName, item, dataFilter)
      }

      if (typeof dataFilter.notEqual === 'string') {
        rightOperand = dataFilter.notEqual
      } else {
        if (dataFilter.notEqual.propertyName !== undefined) {
          rightOperand = _.get(item, dataFilter.notEqual.propertyName)

          // missing the required property
          if (rightOperand === undefined) {
            throw new PropertyUndefinedError(dataFilter.notEqual.propertyName, item, dataFilter)
          }
        } else if (dataFilter.notEqual.dataValue !== undefined) {
          rightOperand = dataFilter.notEqual.dataValue
        } else if (rightOperand === undefined) {
          throw new PropertyUndefinedError(['dataFilter.notEqual.propertyName', 'dataFilter.notEqual.dataValue'], item, dataFilter)
        }
      }

      // console.log(`${leftOperand} != ${rightOperand} => ${leftOperand != rightOperand}`)
      return leftOperand !== rightOperand
    }

    if (dataFilter.greaterThan !== undefined) {
      // console.log()
      // console.log(JSON.stringify(_.get(item, "title"), null, 4))
      // console.log(JSON.stringify(dataFilter, null, 4))

      leftOperand = _.get(item, dataFilter.propertyName)
      // missing the required property
      if (leftOperand === undefined) {
        throw new PropertyUndefinedError(dataFilter.propertyName, item)
      }

      if (typeof dataFilter.greaterThan === 'number') {
        rightOperand = dataFilter.greaterThan
      } else {
        if (dataFilter.greaterThan.propertyName !== undefined) {
          rightOperand = _.get(item, dataFilter.greaterThan.propertyName)

          // missing the required property
          if (rightOperand === undefined) {
            throw new PropertyUndefinedError(dataFilter.greaterThan.propertyName, item)
          }
        } else if (dataFilter.greaterThan.dataValue !== undefined) {
          rightOperand = dataFilter.greaterThan.dataValue
        } else if (rightOperand === undefined) {
          throw new PropertyUndefinedError(['dataFilter.greaterThan.propertyName', 'dataFilter.greaterThan.dataValue'], item, dataFilter)
        }
      }

      // console.log(`${leftOperand} > ${rightOperand} => ${leftOperand > rightOperand}`)
      return leftOperand > rightOperand
    }

    return false
  } else {
    return true
  }
}

function filterData (item, dataFilter) {
  return filterDataV2(item, dataFilter) ? item : undefined

  //   if (dataFilter !== undefined && dataFilter !== null) {
  //     if (dataFilter.startsWith !== undefined || dataFilter.regex !== undefined) {
  //       var replace = ''
  //       if (dataFilter.startsWith !== undefined) {
  //         replace = '^' + RegExp.escape(dataFilter.startsWith)
  //       } else {
  //         replace = dataFilter.regex
  //       }
  //       var regex = new RegExp(replace, 'gi')
  //       // console.log(replace + "===" + _.get(item, dataFilter.propertyName).match(regex))
  //       // console.log(replace + "===" + _.get(item, dataFilter.propertyName))
  //       // console.log('===' + replace + "===" + JSON.stringify(item, null, 4))
  //       if (_.get(item, dataFilter.propertyName).match(regex) != null) {
  //         return item
  //       }
  //     }

  //     if (dataFilter.equal !== undefined) {
  //       // console.log()
  //       // console.log(JSON.stringify(_.get(item, "title"), null, 4))
  //       // console.log(JSON.stringify(dataFilter, null, 4))

  //       var leftOperand = _.get(item, dataFilter.propertyName)
  //       // missing the required property
  //       if (leftOperand === undefined) {
  //         throw new PropertyUndefinedError(dataFilter.propertyName, item)
  //       }

  //       var rightOperand
  //     if (typeof dataFilter.equal === 'string') {
  //         rightOperand = dataFilter.equal
  //     } else if (dataFilter.equal.propertyName !== undefined) {
  //         rightOperand = _.get(item, dataFilter.equal.propertyName)

  //         // missing the required property
  //         if (rightOperand === undefined) {
  //           throw new PropertyUndefinedError(dataFilter.equal.propertyName, item, dataFilter)
  //         }
  //       } else if (dataFilter.equal.dataValue !== undefined) {
  //         rightOperand = dataFilter.equal.dataValue
  //       } else if (rightOperand === undefined) {
  //         throw new PropertyUndefinedError(['dataFilter.equal.propertyName', 'dataFilter.equal.dataValue'], item, dataFilter)
  //       }

  //       // console.log(`${leftOperand} == ${rightOperand} => ${leftOperand == rightOperand}`)
  //       return leftOperand === rightOperand ? item : undefined
  //     }

  //     if (dataFilter.notEqual !== undefined) {
  //       // console.log()
  //       // console.log(JSON.stringify(_.get(item, "title"), null, 4))
  //       // console.log(JSON.stringify(dataFilter, null, 4))

  //       var leftOperand = _.get(item, dataFilter.propertyName)
  //       // missing the required property
  //       if (leftOperand === undefined) {
  //         throw new PropertyUndefinedError(dataFilter.propertyName, item, dataFilter)
  //       }

  //       var rightOperand
  //       if (dataFilter.notEqual.propertyName !== undefined) {
  //         rightOperand = _.get(item, dataFilter.notEqual.propertyName)

  //         // missing the required property
  //         if (rightOperand === undefined) {
  //           throw new PropertyUndefinedError(dataFilter.notEqual.propertyName, item, dataFilter)
  //         }
  //       } if (dataFilter.notEqual.dataValue !== undefined) {
  //         rightOperand = dataFilter.notEqual.dataValue
  //       } else if (rightOperand === undefined) {
  //         throw new PropertyUndefinedError(['dataFilter.notEqual.propertyName', 'dataFilter.notEqual.dataValue'], item, dataFilter)
  //       }

  //       // console.log(`${leftOperand} != ${rightOperand} => ${leftOperand != rightOperand}`)
  //       return leftOperand !== rightOperand ? item : undefined
  //     }

  //     if (dataFilter.greaterThan !== undefined) {
  //       // console.log()
  //       // console.log(JSON.stringify(_.get(item, "title"), null, 4))
  //       // console.log(JSON.stringify(dataFilter, null, 4))

  //       var leftOperand = _.get(item, dataFilter.propertyName)
  //       // missing the required property
  //       if (leftOperand === undefined) {
  //         throw new PropertyUndefinedError(dataFilter.propertyName, item)
  //       }

  //       var rightOperand
  //       if (dataFilter.greaterThan.propertyName !== undefined) {
  //         rightOperand = _.get(item, dataFilter.greaterThan.propertyName)

  //         // missing the required property
  //         if (rightOperand === undefined) {
  //           throw new PropertyUndefinedError(dataFilter.greaterThan.propertyName, item)
  //         }
  //       } if (dataFilter.greaterThan.dataValue !== undefined) {
  //         rightOperand = dataFilter.greaterThan.dataValue
  //       } else if (rightOperand === undefined) {
  //         throw new PropertyUndefinedError(['dataFilter.greaterThan.propertyName', 'dataFilter.greaterThan.dataValue'], item, dataFilter)
  //       }

//       // console.log(`${leftOperand} > ${rightOperand} => ${leftOperand > rightOperand}`)
//       return leftOperand > rightOperand ? item : undefined
//     }
//   } else {
//     return item
//   }
}

function applyNextHopReplaceMaps (replaceMaps, template, dataRow) {
  // replace property value with value from sessionData
  if (replaceMaps !== undefined) {
    replaceMaps.forEach(item => {
      if (typeof _.get(template, item.propertyName) === 'string') {
        var replace = '{{' + RegExp.escape(item.replaceValue) + '}}'
        var regex = new RegExp(replace, 'g')

        _.set(template, item.propertyName, _.get(template, item.propertyName).replace(regex, _.get(dataRow, item.replaceValue)))
      } else {
        _.set(template, item.propertyName, _.get(dataRow, item.replaceValue))
      }
    })
  }
}

// credit: https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
function compareValues (key, order = 'asc') {
  return function innerSort (a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      // return 0;
      throw new PropertyUndefinedError(key, [a, b], null)
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key]
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key]

    let comparison = 0
    if (varA > varB) {
      comparison = 1
    } else if (varA < varB) {
      comparison = -1
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    )
  }
}

helperLib.applySaveMaps = (param) => {
  try {
    if (param.saveMaps !== undefined && Array.isArray(param.saveMaps)) {
      param.saveMaps.forEach(saveMap => {
        if (!(saveMap.skip !== undefined && saveMap.skip)) {
          // console.log(JSON.stringify(saveMap, null, 4))
          // process collection of records
          if (saveMap.dataPath !== undefined) {
            var sourceData = _.get(param.sessionData, saveMap.sessionName)
            if (sourceData === undefined) {
              // param.sessionData[saveMap.sessionName] = []
              _.set(param.sessionData, saveMap.sessionName, [])
              sourceData = _.get(param.sessionData, saveMap.sessionName)
            }

            var dataRows = null
            if (saveMap.dataPath === '.') {
              dataRows = param
            } else {
              dataRows = _.get(param, saveMap.dataPath)
            }

            if (!Array.isArray(dataRows)) {
              dataRows = [dataRows]
            }

            // console.log(JSON.stringify(dataRows, null, 4))
            dataRows.filter(item => {
              // console.log(JSON.stringify(item, null, 4))
              return filterData(item, saveMap.dataFilter)
            })
              .forEach(item => {
                var dataObject = {}

                if (saveMap.properties !== undefined) {
                  // filter by property
                  saveMap.properties.forEach(propertyMap => {
                    dataObject[propertyMap.objectPropertyName] = _.get(item, propertyMap.propertyName)
                  })
                } else {
                  dataObject = _.cloneDeep(item)
                }
                // console.log(dataObject)

                sourceData.push(dataObject)
              })
          } else {
            // get the sessionData variable
            var sourceData = _.get(param.sessionData, saveMap.sessionName)

            // sessionData not declare or request for variable initialization
            if (saveMap.propertyName === undefined || sourceData === undefined) {
              if (saveMap.dataType !== undefined && saveMap.dataType === 'array') {
                _.set(param.sessionData, saveMap.sessionName, [])
              } else if (saveMap.dataType !== undefined && saveMap.dataType === 'object') {
                _.set(param.sessionData, saveMap.sessionName, {})
              } else if (saveMap.dataType !== undefined && saveMap.dataType === 'number') {
                _.set(param.sessionData, saveMap.sessionName, 0)
              } else if (saveMap.dataType !== undefined && saveMap.dataType === 'undefined') {
                // remove property from json
                _.set(param.sessionData, saveMap.sessionName, undefined)
              } else {
                _.set(param.sessionData, saveMap.sessionName, '')
              }

              // get the initialize sessionData variable
              sourceData = _.get(param.sessionData, saveMap.sessionName)
            }

            if (saveMap.propertyName !== undefined) {
              if (saveMap.dataType !== undefined && saveMap.dataType === 'array') {
                sourceData.push(_.cloneDeep(_.get(param, saveMap.propertyName)))
              } else if (saveMap.dataType !== undefined && saveMap.dataType === 'object') {
                if (saveMap.objectPropertyName === undefined) {
                  throw new PropertyUndefinedError('objectPropertyName', saveMap, saveMap)
                }
                _.set(sourceData, saveMap.objectPropertyName, _.get(param, saveMap.propertyName))
              } else {
                // console.log(JSON.stringify(saveMap, null, 4))
                // console.log(JSON.stringify(param.sessionData, null, 4))
                _.set(param.sessionData, saveMap.sessionName, _.get(param, saveMap.propertyName))
                // console.log(JSON.stringify(param.sessionData, null, 4))
              }
            } else if (saveMap.dataValue !== undefined) {
              // sourceData = saveMap.dataValue
              _.set(param.sessionData, saveMap.sessionName, saveMap.dataValue)
              // console.log(_.get(param.sessionData, saveMap.sessionName))
            }
          }
        }
      })
    }
  } catch (error) {
    // console.log(error.stack);
    // console.log(error.details());

    throw error
  }
}

helperLib.applyOutputMaps = (param) => {
  try {
    var index = 0
    var count = 0
    var skip = false
    var message = ''

    if (param.outputMaps !== undefined && Array.isArray(param.outputMaps)) {
      // message += "\n" + JSON.stringify(param.outputMaps, null, 4)
      // message += "\n" + JSON.stringify(param.responseBody, null, 4)

      param.outputMaps.forEach(outputMap => {
        // console.log(`${JSON.stringify(outputMap, null, 4)}`)
        // reset counter
        index = 0
        skip = false

        if (!(outputMap.skip !== undefined && outputMap.skip)) {
          // var dataRows = _.get(param.responseBody, "channel.item")
          var dataRows = null
          if (outputMap.dataPath === '.') {
            dataRows = param
          } else {
            dataRows = _.get(param, outputMap.dataPath)
          }
          if (dataRows === undefined) {
            throw new DataPathUndefinedError(outputMap.dataPath, param, outputMap)
          }

          if (!Array.isArray(dataRows)) {
            dataRows = [dataRows]
          }

          // if (outputMap.sortOrder != undefined) {
          //     // by default, sort by outputMap.propertyName
          //     var sortBy = outputMap.propertyName
          //     // default assending order
          //     var orderBy = "asc"

          //     if (outputMap.sortOrder.sortBy != undefined) sortBy = outputMap.sortOrder.sortBy
          //     if ((outputMap.sortOrder.orderBy == "asc" || outputMap.sortOrder.orderBy == "desc")) orderBy = outputMap.sortOrder.orderBy

          //     dataRows = dataRows.sort(compareValues(sortBy, orderBy))
          // }
          dataRows = sortData(outputMap, dataRows)

          dataRows.filter(item => {
            return filterData(item, outputMap.dataFilter)
          })
            .forEach(item => {
              ++index
              ++count
              // source data
              // console.log(JSON.stringify(item.EntityReference, null, 4));

              // set the message id for debugging
              // console.log(">>" + ++index + ". " + item.title);
              // message += "\n>> ====" + ++index + ". " + _.get(item, "title")

              var propertyValue
              if (outputMap.propertyName === '.') {
                propertyValue = item
              } else if (outputMap.propertyName !== undefined) {
                propertyValue = _.get(item, outputMap.propertyName)
              }

              // error, no output property has been defined
              if (propertyValue === undefined) {
                throw new PropertyUndefinedError(outputMap.propertyName, item, outputMap)
              }

              // format as json data for non-string data type
              if (typeof propertyValue !== 'string') {
                propertyValue = JSON.stringify(propertyValue, null, 4)
              }

              if (outputMap.outputFormat === undefined) {
                // message += "\n>> " + index + ". " + _.get(item, outputMap.propertyName)
                message += `\n>> ${count}. ${propertyValue}`
              } else {
                var newValue = outputMap.outputFormat.replace(/{{propertyName}}/g, propertyValue)
                if (newValue.search(/{{index}}/g) > -1) {
                  newValue = newValue.replace(/{{index}}/g, count)
                }

                message += newValue
              }
            })
        } else {
          skip = true
        }

        // if (index == 0 && !skip) message += `\n>> no record found.`
        if (index === 0 && !skip && outputMap.notFoundMessage !== undefined) {
          message += outputMap.notFoundMessage
        }
      })
    }

    // helper.displaySessionData().then(message => console.log("\n" + message));

    return message
  } catch (error) {
    // console.log(error.stack);
    // console.log(error.details());

    throw error
  }
}

helperLib.applyNextHopMaps = (param) => {
  try {
    var index = 0
    var count = 0
    var message = ''

    // process nextHopMaps
    // if (param.nextHopMaps != undefined && Array.isArray(param.nextHopMaps) && param.nextHopMaps.length > 0) {
    if (param.nextHopMaps !== undefined && Array.isArray(param.nextHopMaps)) {
      // message += "\n" + JSON.stringify(param.nextHopMaps, null, 4)
      param.nextHopMaps.forEach(nextHopMap => {
        // reset counter
        index = 0

        // invalid paramTemplateName
        if (_.get(param, nextHopMap.paramTemplateName) === undefined) {
          throw new PropertyUndefinedError(nextHopMap.paramTemplateName, param, nextHopMap)
        }
        // get the json param template for nextHop
        var templateSting = JSON.stringify(_.get(param, nextHopMap.paramTemplateName))

        var dataRows = null
        if (nextHopMap.dataPath === '.') {
          dataRows = param
        } else {
          dataRows = _.get(param, nextHopMap.dataPath)
        }
        // message += "\n" + JSON.stringify(dataRows, null, 4)
        // not required, mean for no record return
        // if (dataRows == undefined) {
        //     throw new DataPathUndefinedError(nextHopMap.dataPath, param, nextHopMap)
        // }

        // if (dataRows == undefined) {
        //     dataRows = [ ]
        // } else if (!Array.isArray(dataRows)) {
        //     dataRows = [ dataRows ]
        // }
        if (!Array.isArray(dataRows)) {
          dataRows = [dataRows]
        }

        // default to empty array when nextHopParams is undefined
        if (param.nextHopParams === undefined) {
          param.nextHopParams = []
        }

        // if (nextHopMap.sortOrder != undefined) {
        //     var sortBy = nextHopMap.propertyName
        //     var orderBy = "asc"

        //     if (nextHopMap.sortOrder.sortBy != undefined) sortBy = nextHopMap.sortOrder.sortBy
        //     if ((nextHopMap.sortOrder.orderBy == "asc" || nextHopMap.sortOrder.orderBy == "desc")) orderBy = nextHopMap.sortOrder.orderBy

        //     dataRows = dataRows.sort(compareValues(sortBy, orderBy))
        // }
        dataRows = sortData(nextHopMap, dataRows)

        dataRows.filter(item => {
          return filterData(item, nextHopMap.dataFilter)
          /*
                // select the required item from return data
                if (nextHopMap.dataFilter != undefined) {
                    if (nextHopMap.dataFilter.startsWith != undefined) {
                        return _.get(items, nextHopMap.dataFilter.dataPath).startsWith(nextHopMap.dataFilter.startsWith);
                    }

                    if (nextHopMap.dataFilter.notEqual != undefined) {
                        return _.get(items, nextHopMap.dataFilter.dataPath) != _.get(items, nextHopMap.dataFilter.notEqual.dataPath) ? items : undefined;
                    }

                    if (nextHopMap.dataFilter.equal != undefined) {
                        return _.get(items, nextHopMap.dataFilter.dataPath) == _.get(items, nextHopMap.dataFilter.equal.dataPath) ? items : undefined;
                    }
                    if (nextHopMap.dataFilter.greaterThan != undefined) {
                        //console.log(JSON.stringify(nextHopMap.dataFilter, null, 4))
                        //console.log(JSON.stringify(_.get(items, nextHopMap.dataFilter.dataPath), null, 4))
                        //console.log(JSON.stringify(_.get(items, nextHopMap.dataFilter.dataPath) > nextHopMap.dataFilter.greaterThan.dataValue, null, 4))
                        if (nextHopMap.dataFilter.greaterThan.dataPath != undefined) {
                            return _.get(items, nextHopMap.dataFilter.dataPath) > _.get(items, nextHopMap.dataFilter.greaterThan.dataPath) ? items : undefined;
                        } if (nextHopMap.dataFilter.greaterThan.dataValue != undefined) {
                            return _.get(items, nextHopMap.dataFilter.dataPath) > nextHopMap.dataFilter.greaterThan.dataValue ? items : undefined;
                        }
                    }
                } else {
                    return items;
                }
                */
        })
          .forEach(item => {
            ++index
            ++count // action perform
            // create param from template
            var template = JSON.parse(templateSting)

            // set the message id for debugging
            template.id = `${param.id === undefined ? '1' : param.id}.${count}`

            // replace the template property with item property
            // template.invokeUrl = template.invokeUrl.replace(/{{Key}}/g, item.Key);
            applyNextHopReplaceMaps(nextHopMap.replaceMaps, template, item)

            // add the parameters for subsequence execution...
            param.nextHopParams.push(template)
          })

        if (index === 0 && nextHopMap.notFoundMessage !== undefined) {
          message += nextHopMap.notFoundMessage
        }
      })
    }

    return message
  } catch (error) {
    // console.log(error.stack);
    // console.log(error.details());

    throw error
  }
}

function sortData (outputMap, dataRows) {
  if (outputMap.sortOrder !== undefined) {
    // by default, sort by outputMap.propertyName
    var sortBy = outputMap.propertyName
    // default assending order
    var orderBy = 'asc'

    if (outputMap.sortOrder.sortBy !== undefined) sortBy = outputMap.sortOrder.sortBy
    if ((outputMap.sortOrder.orderBy === 'asc' || outputMap.sortOrder.orderBy === 'desc')) orderBy = outputMap.sortOrder.orderBy

    dataRows = dataRows.sort(compareValues(sortBy, orderBy))
  }

  return dataRows
}
