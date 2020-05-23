'use strict'

class PropertyUndefinedError extends Error {
  constructor (propertyName, dataObject, dataMap) {
    // const indentation = "    ";
    // super(`Invalid/Missing Property "${propertyName}" for object \n${indentation}${JSON.stringify(dataObject, null, 4).replace(/\n/g, "\n" + indentation)}`)
    super('Property not found.')

    this.name = this.constructor.name
    this.propertyName = propertyName
    this.dataObject = dataObject
    this.dataMap = dataMap
  }

  // Method
  details () {
    return `Property (${this.propertyName}) not found in data object => \n${JSON.stringify(this.dataObject, null, 4)}\nmap object\n${JSON.stringify(this.dataMap, null, 4)}`
  }
}

class DataPathUndefinedError extends PropertyUndefinedError {
  constructor (dataPath, dataObject, dataMap) {
    super(dataPath, dataObject, dataMap)

    this.dataPath = dataPath
  }

  // Method
  details () {
    return `dataPath (${this.dataPath}) not found in data object => \n${JSON.stringify(this.dataObject, null, 4)}\nmap object\n${JSON.stringify(this.dataMap, null, 4)}`
  }
}

module.exports = { PropertyUndefinedError, DataPathUndefinedError }
