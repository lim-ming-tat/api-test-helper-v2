"use strict" 

const _ = require("lodash");

let { PropertyUndefinedError } = require('./errors');

let helperLib = {};
module.exports = helperLib

// escape regular expression character
// credit: https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function filterData(item, dataFilter) {
    if (dataFilter != undefined) {
        if (dataFilter.startsWith != undefined || dataFilter.regex != undefined) {
            var replace = ""
            if (dataFilter.startsWith != undefined) {
                replace = "^" + RegExp.escape(dataFilter.startsWith);
            } else if ( dataFilter.regex != undefined) {
                replace = dataFilter.regex;
            }
            var regex = new RegExp(replace, "gi");
            // console.log(replace + "===" + _.get(item, dataFilter.propertyName).match(regex))
            // console.log(replace + "===" + _.get(item, dataFilter.propertyName))
            // console.log(replace + "===" + JSON.stringify(item, null, 4))
            if (_.get(item, dataFilter.propertyName).match(regex) != null) {
                return item;
            }
        }

        if (dataFilter.equal != undefined) {
            //console.log()
            //console.log(JSON.stringify(_.get(item, "title"), null, 4))
            //console.log(JSON.stringify(dataFilter, null, 4))

            var leftOperand = _.get(item, dataFilter.propertyName)
            // missing the required property
            if (leftOperand == undefined) throw new PropertyUndefinedError(dataFilter.propertyName, item)

            var rightOperand = undefined
            if (dataFilter.equal.propertyName != undefined) {
                rightOperand = _.get(item, dataFilter.equal.propertyName)

                // missing the required property
                if (rightOperand == undefined) throw new PropertyUndefinedError(dataFilter.equal.propertyName, item)
            } if (dataFilter.equal.dataValue != undefined) {
                rightOperand = dataFilter.equal.dataValue

                // missing the required property
                if (rightOperand == undefined) throw new PropertyUndefinedError('dataFilter.equal.dataValue', dataFilter)
            } else {
                if (rightOperand == undefined) throw new PropertyUndefinedError([ 'dataFilter.equal.propertyName', 'dataFilter.equal.dataValue' ], dataFilter)
            }

            // console.log(`${leftOperand} == ${rightOperand} => ${leftOperand == rightOperand}`)
            return leftOperand == rightOperand ? item : undefined;
        }

        if (dataFilter.notEqual != undefined) {
            // console.log()
            // console.log(JSON.stringify(_.get(item, "title"), null, 4))
            // console.log(JSON.stringify(dataFilter, null, 4))

            var leftOperand = _.get(item, dataFilter.propertyName)
            // missing the required property
            if (leftOperand == undefined) throw new PropertyUndefinedError(dataFilter.propertyName, item)

            var rightOperand = undefined
            if (dataFilter.notEqual.propertyName != undefined) {
                rightOperand = _.get(item, dataFilter.notEqual.propertyName)

                // missing the required property
                if (rightOperand == undefined) throw new PropertyUndefinedError(dataFilter.notEqual.propertyName, item)
            } if (dataFilter.notEqual.dataValue != undefined) {
                rightOperand = dataFilter.notEqual.dataValue

                // missing the required property
                if (rightOperand == undefined) throw new PropertyUndefinedError('dataFilter.notEqual.dataValue', dataFilter)
            } else {
                if (rightOperand == undefined) throw new PropertyUndefinedError([ 'dataFilter.notEqual.propertyName', 'dataFilter.notEqual.dataValue' ], dataFilter)
            }

            // console.log(`${leftOperand} != ${rightOperand} => ${leftOperand != rightOperand}`)
            return leftOperand != rightOperand ? item : undefined;
        }

        if (dataFilter.greaterThan != undefined) {
            // console.log()
            // console.log(JSON.stringify(_.get(item, "title"), null, 4))
            // console.log(JSON.stringify(dataFilter, null, 4))

            var leftOperand = _.get(item, dataFilter.propertyName)
            // missing the required property
            if (leftOperand == undefined) throw new PropertyUndefinedError(dataFilter.propertyName, item)

            var rightOperand = undefined
            if (dataFilter.greaterThan.propertyName != undefined) {
                rightOperand = _.get(item, dataFilter.greaterThan.propertyName)

                // missing the required property
                if (rightOperand == undefined) throw new PropertyUndefinedError(dataFilter.greaterThan.propertyName, item)
            } if (dataFilter.greaterThan.dataValue != undefined) {
                rightOperand = dataFilter.greaterThan.dataValue

                // missing the required property
                if (rightOperand == undefined) throw new PropertyUndefinedError('dataFilter.greaterThan.dataValue', dataFilter)
            } else {
                if (rightOperand == undefined) throw new PropertyUndefinedError([ 'dataFilter.greaterThan.propertyName', 'dataFilter.greaterThan.dataValue' ], dataFilter)
            }

            // console.log(`${leftOperand} > ${rightOperand} => ${leftOperand > rightOperand}`)
            return leftOperand > rightOperand ? item : undefined;
        }
    } else {
        return item;
    }
}

function applyNextHopReplaceMaps(replaceMaps, template, dataRow) {
    // replace property value with value from sessionData
    if (replaceMaps != undefined) {
        replaceMaps.forEach(item => {
            if (typeof _.get(template, item.propertyName) == "string") {
                var replace = "{{" + item.replaceValue + "}}";
                var regex = new RegExp(replace, "g");

                _.set(template, item.propertyName, _.get(template, item.propertyName).replace(regex, _.get(dataRow, item.replaceValue)));
            } else {
                _.set(template, item.propertyName, _.get(dataRow, item.replaceValue));
            }
        });
    }
}

// credit: https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
        }

        const varA = (typeof a[key] === 'string') ?
            a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string') ?
            b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order === 'desc') ? (comparison * -1) : comparison
        );
    };
}


helperLib.applySaveMaps = (param) => {
// try {

    if (param.saveMaps != undefined && Array.isArray(param.saveMaps)) {
        param.saveMaps.forEach(saveMap => {
            if (!(saveMap.skip != undefined && saveMap.skip)) {
                // console.log(JSON.stringify(saveMap, null, 4))
                // process collection of records
                if (saveMap.dataPath != undefined) {
                    var sourceData = _.get(param.sessionData, saveMap.sessionName)
                    if (sourceData == undefined) {
                        //param.sessionData[saveMap.sessionName] = []
                        _.set(param.sessionData, saveMap.sessionName, [])
                        sourceData = _.get(param.sessionData, saveMap.sessionName)
                    }

                    var dataRows = null
                    if (saveMap.dataPath == ".") {
                        dataRows = param
                    } else {
                        dataRows = _.get(param, saveMap.dataPath)
                    }
        
                    if (!Array.isArray(dataRows)) {
                        dataRows = [ dataRows ]
                    }

                    // console.log(JSON.stringify(dataRows, null, 4))
                    dataRows.filter(item => {
                        // console.log(JSON.stringify(item, null, 4))
                        return filterData(item, saveMap.dataFilter)
                    })
                    .forEach(item => {
                        var dataObject = {}

                        if (saveMap.properties != undefined) {
                            // filter by property
                            saveMap.properties.forEach(propertyMap => {
                                dataObject[propertyMap.objectPropertyName] = _.get(item, propertyMap.propertyName)
                            })
                        } else {
                            dataObject = item
                        }
                        //console.log(dataObject)

                        sourceData.push(dataObject)
                    })
                } else {
                    // get the sessionData variable
                    var sourceData = _.get(param.sessionData, saveMap.sessionName)

                    // sessionData not declare or request for variable initialization
                    if (saveMap.propertyName == undefined || sourceData == undefined) {
                        if (saveMap.dataType != undefined && saveMap.dataType == "array") {
                            _.set(param.sessionData, saveMap.sessionName, [])
                        } else if (saveMap.dataType != undefined && saveMap.dataType == "object") {
                            _.set(param.sessionData, saveMap.sessionName, {})
                        } else if (saveMap.dataType != undefined && saveMap.dataType == "number") {
                            _.set(param.sessionData, saveMap.sessionName, 0)
                        } else {
                            _.set(param.sessionData, saveMap.sessionName, "")
                        }

                        // get the initialize sessionData variable
                        sourceData = _.get(param.sessionData, saveMap.sessionName)
                    }

                    if (saveMap.propertyName != undefined) {
                        if (saveMap.dataType != undefined && saveMap.dataType == "array") {
                            sourceData.push(_.cloneDeep(_.get(param, saveMap.propertyName)))
                        } else if (saveMap.dataType != undefined && saveMap.dataType == "object") {
                            _.set(sourceData, saveMap.objectPropertyName, _.get(param, saveMap.propertyName));
                        } else {
                            //console.log(JSON.stringify(saveMap, null, 4))
                            //console.log(JSON.stringify(param.sessionData, null, 4))
                            _.set(param.sessionData, saveMap.sessionName, _.get(param, saveMap.propertyName));
                            //console.log(JSON.stringify(param.sessionData, null, 4))
                        }
                    } else if (saveMap.dataValue != undefined) {
                        //sourceData = saveMap.dataValue
                        _.set(param.sessionData, saveMap.sessionName, saveMap.dataValue);
                        // console.log(_.get(param.sessionData, saveMap.sessionName))
                    }
                }
            }
        });
    }

// } catch (error) { 
//     console.log(error.stack);
// }

}

helperLib.applyOutputMaps = (param) => {
try {

    var index = 0;
    var count = 0;
    var skip = false
    var message = "";

    if (param.outputMaps != undefined && Array.isArray(param.outputMaps) && param.outputMaps.length > 0) {
        //message += "\n" + JSON.stringify(param.outputMaps, null, 4)
        //message += "\n" + JSON.stringify(param.responseBody, null, 4)

        param.outputMaps.forEach(outputMap => {
            // console.log(`${JSON.stringify(outputMap, null, 4)}`)
            //reset counter
            index = 0;
            skip = false
            
            if (!(outputMap.skip != undefined && outputMap.skip)) {
                //var dataRows = _.get(param.responseBody, "channel.item")
                var dataRows = null
                if (outputMap.dataPath == ".") {
                    dataRows = param
                } else {
                    dataRows = _.get(param, outputMap.dataPath)
                }
                //message += "\n" + JSON.stringify(dataRows, null, 4)

                if (!Array.isArray(dataRows)) {
                    dataRows = [ dataRows ]
                }

                // if (outputMapa.hasOwnProperty("sortOrder")) {

                // }
                if (outputMap.sortOrder != undefined) {
                    // by default, sort by outputMap.propertyName
                    var sortBy = outputMap.propertyName
                    // default assending order
                    var orderBy = "asc"

                    if (outputMap.sortOrder.sortBy != undefined) sortBy = outputMap.sortOrder.sortBy
                    if ((outputMap.sortOrder.orderBy == "asc" || outputMap.sortOrder.orderBy == "desc")) orderBy = outputMap.sortOrder.orderBy

                    dataRows = dataRows.sort(compareValues(sortBy, orderBy))
                }

                dataRows.filter(item => {
                    return filterData(item, outputMap.dataFilter)
                })
                .forEach(item => {
                    ++index
                    ++count
                    // source data
                    //console.log(JSON.stringify(item.EntityReference, null, 4));
            
                    // set the message id for debugging
                    //console.log(">>" + ++index + ". " + item.title);
                    //message += "\n>> ====" + ++index + ". " + _.get(item, "title")
                    
                    var propertyValue
                    if (outputMap.propertyName == ".")  { 
                        propertyValue = item
                    } else if (outputMap.propertyName != undefined) {
                        propertyValue = _.get(item, outputMap.propertyName)
                    } 

                    // error, no output propery has been defined
                    if (propertyValue == undefined) throw new PropertyUndefinedError("propertyName", outputMap)

                    // format json data
                    if (outputMap.contentType == "json")  propertyValue = JSON.stringify(propertyValue, null, 4)

                    if (outputMap.outputFormat == undefined) {
                        //message += "\n>> " + index + ". " + _.get(item, outputMap.propertyName)
                        message += `\n>> ${count}. ${propertyValue}`
                    } else {
                        var newValue = outputMap.outputFormat.replace(/{{propertyName}}/g, propertyValue)
                        if (newValue.search(/{{index}}/g) > -1) {
                            newValue = newValue.replace(/{{index}}/g, count)
                        } 

                        message += newValue
                    }
                });
            } else {
                skip = true
            }

            if (index == 0 && !skip) message += `\n>> no record found.`
        });
    }

    //helper.displaySessionData().then(message => console.log("\n" + message));

    return message

} catch (error) { 
    console.log(error.stack);
    console.log(JSON.stringify(error.dataObject, null, 4));
}

};

helperLib.applyNextHopMaps = (param) => {
try {

    var index = 0;
    var count = 0;
    var message = ""

    //process nextHopMaps
    if (param.nextHopMaps != undefined && Array.isArray(param.nextHopMaps) && param.nextHopMaps.length > 0) {
        //message += "\n" + JSON.stringify(param.nextHopMaps, null, 4)

        param.nextHopMaps
        .forEach(nextHopMap => {
            //reset counter
            index = 0;

            var dataRows = null
            if (nextHopMap.dataPath == ".") {
                dataRows = param
            } else {
                dataRows = _.get(param, nextHopMap.dataPath)
            }
            //message += "\n" + JSON.stringify(dataRows, null, 4)

            if (dataRows == undefined) {
                dataRows = [ ]
            } else if (!Array.isArray(dataRows)) {
                dataRows = [ dataRows ]
            }

            // get the json param template for nextHop
            var templateSting = JSON.stringify(_.get(param, nextHopMap.paramTemplateName))
            
            if (nextHopMap.sortOrder != undefined) {
                var sortBy = nextHopMap.propertyName
                var orderBy = "asc"

                if (nextHopMap.sortOrder.sortBy != undefined) sortBy = nextHopMap.sortOrder.sortBy
                if ((nextHopMap.sortOrder.orderBy == "asc" || nextHopMap.sortOrder.orderBy == "desc")) orderBy = nextHopMap.sortOrder.orderBy
                
                dataRows = dataRows.sort(compareValues(sortBy, orderBy))
            }

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
                ++index;
                ++count; //action perform
                // create param from template
                var template = JSON.parse(templateSting);

                // set the message id for debugging
                template.id = `${param.id}.${count}`;

                // replace the template property with item property
                //template.invokeUrl = template.invokeUrl.replace(/{{Key}}/g, item.Key);
                applyNextHopReplaceMaps(nextHopMap.replaceMaps, template, item)

                // add the parameters for subsequence execution...
                param.nextHopParams.push(template);
            })
        
            if (index == 0 && nextHopMap.notFoundMessage != undefined) {
                message += nextHopMap.notFoundMessage
            }
        })
    }

    return message

} catch (error) { 
    console.log(error.stack);
}

};