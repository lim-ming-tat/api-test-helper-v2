'use strict'

class PropertyUndefinedError extends Error {
    constructor (propertyName, dataObject) {
        // const indentation = "    ";
        // super(`Invalid/Missing Property "${propertyName}" for object \n${indentation}${JSON.stringify(dataObject, null, 4).replace(/\n/g, "\n" + indentation)}`)
        super(`Property not found.`)
    
        this.name = this.constructor.name
        this.propertyName = propertyName
        // this[propertyName] = propertyName
        this.dataObject = dataObject
    }    
}

class RequiredPropertyMissingError extends Error {
    constructor (properties, dataObject) {
        super(`Required property not found.`)
    
        this.name = this.constructor.name

        this.propertyName = properties
        this.dataObject = dataObject
    }    
}

module.exports = { PropertyUndefinedError }