'use strict';

const _ = require("lodash");

const mapsHelperLib = require('../../lib/mapsHelperLib');
let { PropertyUndefinedError } = require('../../lib/errors');

let params = require('../resources/saveMapsTestData.json')


let expectedResult_cpf = {
    "agencyName": "CPF",
    "businessKey": "c153a3dc-e537-4541-b96f-c493c453b02a.awslab"
}

let expectedResult_cpf_p1 = {
    "agencyName": "CPF Project 1",
    "businessKey": "64921f2a-32fb-40d6-aa5a-9b8eb214d5a1.awslab"
}

let expectedResult_cpf_p2 = {
    "agencyName": "CPF Project 2",
    "businessKey": "54f9bc10-36a2-4d6d-8882-470cfde822bb.awslab"
}

let expectedResult_hdb = {
    "agencyName": "HDB",
    "businessKey": "489c0be5-995c-444c-97e9-78f3324d67e1.awslab"
}

let expectedResult_hdb_p1 = {
    "agencyName": "HDB Project 1",
    "businessKey": "a8a8da4e-1a81-4870-b51a-836237aebaa0.awslab"
}

describe('dataFilter tests', function () {

    it('dataFilter - baseline, no data filter apply', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        mapsHelperLib.applySaveMaps(param)
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 11
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)

        // agencyName and businessKey must match
        let hdb_index = 1
        expect(param.sessionData.agencyList[hdb_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_hdb)

        let cpf_index = 5
        expect(param.sessionData.agencyList[cpf_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_cpf)
    });

    it('dataFilter - agencyName startWith cpf (case in-censitive search)', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName" : "title",
            "startsWith" : "cPf"
        }
        
        mapsHelperLib.applySaveMaps(param)
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 4
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)
        
        // agencyName and businessKey must match
        let cpf_index = 0
        expect(param.sessionData.agencyList[cpf_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_cpf)
        let cpf_p1_index = 1
        expect(param.sessionData.agencyList[cpf_p1_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_cpf_p1)
    });

    it('dataFilter - agencyName startWith cpf or hdb (case in-censitive search)', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName" : "title",
            "regex" : "cPf|hdb"
        }
        
        mapsHelperLib.applySaveMaps(param)
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 8
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)

        let cpf_index = 4
        expect(param.sessionData.agencyList[cpf_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_cpf)
        let cpf_p1_index = 5
        expect(param.sessionData.agencyList[cpf_p1_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_cpf_p1)
    });

    it('dataFilter - activeVersion == version', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName": "activeVersion",
            "equal": {
                "propertyName": "version"
            }
        }
        
        mapsHelperLib.applySaveMaps(param)
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 3
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)

        // agencyName and businessKey must match
        let cpf_p1_index = 2
        expect(param.sessionData.agencyList[cpf_p1_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_cpf_p1)
    });

    it('dataFilter - activeVersion == 3', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName": "activeVersion",
            "equal": {
                "dataValue": 3
            }
        }
        
        mapsHelperLib.applySaveMaps(param)
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 4
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)

        // agencyName and businessKey must match
        let hdb_p1_index = 0
        expect(param.sessionData.agencyList[hdb_p1_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_hdb_p1)
    });

    it('dataFilter - activeVersion != version', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName": "activeVersion",
            "notEqual": {
                "propertyName": "version"
            }
        }
        
        mapsHelperLib.applySaveMaps(param)
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 8
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)

        // agencyName and businessKey must match
        let cpf_p2_index = 4
        expect(param.sessionData.agencyList[cpf_p2_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_cpf_p2)
    });

    it('dataFilter - activeVersion != 3', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName": "activeVersion",
            "notEqual": {
                "dataValue": 3
            }
        }
        
        mapsHelperLib.applySaveMaps(param)
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 7
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)

        // agencyName and businessKey must match
        let cpf_index = 3
        expect(param.sessionData.agencyList[cpf_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_cpf)
    });

    it('dataFilter - version > activeVersion', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName": "version",
            "greaterThan": {
                "propertyName": "activeVersion"
            }
        }
        
        expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
            .to.not.throw()
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 8
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)

        // agencyName and businessKey must match
        let cpf_p2_index = 4
        expect(param.sessionData.agencyList[cpf_p2_index])
            .to.be.an('object')
            .that.has.all.keys('agencyName', 'businessKey')
            .to.include(expectedResult_cpf_p2)
    });

    it('dataFilter - version > 4', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName": "version",
            "greaterThan": {
                "dataValue": 4
            }
        }
        
        expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
            .to.not.throw()
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 3
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)
    });

    it('dataFilter - left operand (dataFilter.propertyName) "currentVersion" not exists on target object', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName": "currentVersion",
            "equal": {
                "dataValue": 5
            }
        }
        
        expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
            .to.throw(PropertyUndefinedError)
            .with.property('propertyName', 'currentVersion')
        // console.log(JSON.stringify(param.sessionData, null, 4))
    });

    it('dataFilter - right operand (dataFilter.equel.propertyName) "currentVersion" not exists on target object', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName": "activeVersion",
            "equal": {
                "propertyName": "currentVersion"
            }
        }
        
        expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
            .to.throw(PropertyUndefinedError)
            .with.property('propertyName', 'currentVersion')
        // console.log(JSON.stringify(param.sessionData, null, 4))
    });

    it('dataFilter - right operand (dataFilter.equel.propertyName or dataFilter.equel.dataValue) missing or undefined', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {
            "propertyName": "activeVersion",
            "equal": {
            }
        }
        
        expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
            .to.throw(PropertyUndefinedError)
            // .with.property('propertyName', [ 'dataFilter.equal.propertyName', 'dataFilter.equal.dataValue' ])
        // console.log(JSON.stringify(param.sessionData, null, 4))
    });

    it('dataFilter - empty dataFilter (return none)', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = {}
        
        expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
            .to.not.throw()
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 0
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)
    });

    it('dataFilter - null dataFilter (return all)', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = null
        
        expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
            .to.not.throw()
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 11
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)
    });

    it('dataFilter - undefined dataFilter (return all)', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        param.saveMaps[0]["dataFilter"] = undefined
        
        expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
            .to.not.throw()
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let agenciesFound = 11
        expect(param.sessionData.agencyList)
            .to.be.an('array')
            .to.have.lengthOf(agenciesFound)
    });
});

// when saveMap.propertyName == undefined
describe('saveMaps Tests - undefined sessionData variable initialize to correct data type', function () {
    it('saveMaps - access param object and map to object', function () {
        var param = _.cloneDeep(params.param3)

        expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
            .to.not.throw()
        // console.log(JSON.stringify(param.sessionData, null, 4))

        let usersFound = 1
        expect(param.sessionData.users)
            .to.be.an('array')
            .to.have.lengthOf(usersFound)

        // agencyName and businessKey must match
        expect(param.sessionData.users[0])
            .to.be.an('object')
            .that.has.all.keys('userName', 'userFdn')
            .to.include({
                "userName": "adminawslab",
                "userFdn": "7d146b36-bf94-402a-a2bc-31a708a21089.awslab"
            })
    });

    it('saveMaps - variable Initialization', function () {
        var param = _.cloneDeep(params.param2)
        
        mapsHelperLib.applySaveMaps(param)
        // console.log(JSON.stringify(param.sessionData, null, 4))

        expect(param.sessionData.initArray)
            .to.be.an('array')
            .that.is.empty

        expect(param.sessionData.initObject)
            .to.be.an('object')
            .that.is.empty

        expect(param.sessionData.initNumber)
            .to.be.an('number')
            .to.equal(0)

        expect(param.sessionData.initString1)
            .to.be.an('string')
            .that.is.empty

        expect(param.sessionData.initString2)
            .to.be.an('string')
            .that.is.empty
    });
});

describe('saveMaps Tests - save as object from an array', function () {
    var param = _.cloneDeep(params.param1)

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))
    
    it('saveMaps - save as object in correct format', function () {
        expect(param.sessionData.deploymentZones[0])
            .to.be.an('object')
            .to.include({
                "deploymentZoneID": "8a761839-cca2-4269-aef4-cf9fd328777d.awslab",
                "name": "AWS CPF LAB Gateway",
                "containerCount": 2,
                "containerAssigned": 2
            })
    });

    it('saveMaps - return 3 records', function () {
        let usersFound = 3
        expect(param.sessionData.deploymentZones)
            .to.be.an('array')
            .to.have.lengthOf(3)
    });
});



describe('outputMaps tests', function () {
    it('saveMaps - access param object and map to object', function () {
        var param = _.cloneDeep(params.param_dataFilter.param)

        var output = mapsHelperLib.applyOutputMaps(param)
    });
});
