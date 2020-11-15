'use strict'

const _ = require('lodash')

const mapsHelperLib = require('../../lib/mapsHelperLib')
const { PropertyUndefinedError, DataPathUndefinedError } = require('../../lib/errors')

const params = require('../resources/saveMapsTestData.json')
const { expect } = require('chai')

const expectedResultCpf = {
  agencyName: 'CPF',
  businessKey: 'c153a3dc-e537-4541-b96f-c493c453b02a.awslab'
}

const expectedResultCpfP1 = {
  agencyName: 'CPF Project 1',
  businessKey: '64921f2a-32fb-40d6-aa5a-9b8eb214d5a1.awslab'
}

const expectedResultCpfP2 = {
  agencyName: 'CPF Project 2',
  businessKey: '54f9bc10-36a2-4d6d-8882-470cfde822bb.awslab'
}

const expectedResultHdb = {
  agencyName: 'HDB',
  businessKey: '489c0be5-995c-444c-97e9-78f3324d67e1.awslab'
}

const expectedResultHdbP1 = {
  agencyName: 'HDB Project 1',
  businessKey: 'a8a8da4e-1a81-4870-b51a-836237aebaa0.awslab'
}

describe('custom error object tests', function () {
  // throw new PropertyUndefinedError(dataFilter.notEqual.propertyName, item, dataFilter)
  it('PropertyUndefinedError', function () {
    var dataFilter = {
      propertyName: 'type',
      equal: 'api'
    }

    try {
      throw new PropertyUndefinedError('type', { data: 'value' }, dataFilter)
    } catch (propertyUndefinedError) {
      expect(propertyUndefinedError.details()).to.be.string
      expect(propertyUndefinedError).to.respondTo('details')
    }
  })

  // throw new DataPathUndefinedError(outputMap.dataPath, param, outputMap)
  it('DataPathUndefinedError', function () {
    var dataFilter = {
      propertyName: 'type',
      equal: 'api'
    }

    try {
      throw new DataPathUndefinedError('type', { data: 'value' }, dataFilter)
    } catch (dataPathUndefinedError) {
      expect(dataPathUndefinedError.details()).to.be.string
      expect(dataPathUndefinedError).to.respondTo('details')
    }
  })
})

describe('dataFilterV2 tests', function () {
  var dataV2 = {
    title: 'You have been invited to be an API Administrator by CPF Agency Admin',
    guid: 'group_member_req10083.gcc',
    wfState: 'com.soa.group.membership.state.approved',
    name: '[CPF-PVT] SLACreateNewCaseCRMS:Services',
    type: 'api',
    count: 10
  }

  it('dataFilterV2 - equal as string', function () {
    var dataFilter = {
      propertyName: 'type',
      equal: 'api'
    }

    var result = mapsHelperLib.filterData(dataV2, dataFilter)

    expect(result)
      .to.be.an('object')
      .that.has.keys('title', 'guid', 'wfState', 'name', 'type', 'count')
  })

  it('dataFilterV2 - notEqual as string', function () {
    var dataFilter = {
      propertyName: 'type',
      notEqual: 'api'
    }

    var result = mapsHelperLib.filterData(dataV2, dataFilter)

    expect(result)
      .to.be.undefined
  })

  it('dataFilterV2 - greaterThan as number', function () {
    var dataFilter = {
      propertyName: 'count',
      greaterThan: 5
    }

    var result = mapsHelperLib.filterData(dataV2, dataFilter)

    expect(result)
      .to.be.an('object')
      .that.has.keys('title', 'guid', 'wfState', 'name', 'type', 'count')
  })

  it('dataFilterV2 - invalid conditions datatype, must be string', function () {
    var dataFilter = {
      conditions: { },
      filters: []
    }

    expect(mapsHelperLib.filterData.bind(mapsHelperLib.filterData, dataV2, dataFilter))
      .to.throw('Invalid datatype for dataFilter.conditions, expecting string datatype.')
  })

  it('dataFilterV2 - invalid conditions value, must be "and" or "or"', function () {
    var dataFilter = {
      conditions: 'invalid',
      filters: []
    }

    expect(mapsHelperLib.filterData.bind(mapsHelperLib.filterData, dataV2, dataFilter))
      .to.throw('Invalid data value for dataFilter.conditions, expecting "and" or "or".')
  })

  it('dataFilterV2 - invalid filters datatype, must be array', function () {
    var dataFilter = {
      conditions: 'or',
      filters: { }
    }

    expect(mapsHelperLib.filterData.bind(mapsHelperLib.filterData, dataV2, dataFilter))
      .to.throw('Invalid datatype for dataFilter.filters, expecting array datatype.')
  })

  it('dataFilterV2 - conditions "and"', function () {
    var dataFilter = {
      conditions: 'and',
      filters: [
        {
          propertyName: 'type',
          equal: 'api'
        },
        {
          propertyName: 'wfState',
          equal: 'com.soa.group.membership.state.approved'
        }
      ]
    }

    var result = mapsHelperLib.filterData(dataV2, dataFilter)

    expect(result)
      .to.be.an('object')
      .that.has.keys('title', 'guid', 'wfState', 'name', 'type', 'count')
  })

  it('dataFilterV2 - conditions "and" with short circuit', function () {
    var dataFilter = {
      conditions: 'and',
      filters: [
        {
          propertyName: 'type',
          equal: 'apx'
        },
        {
          propertyName: 'wfState',
          equal: 'com.soa.group.membership.state.approved'
        }
      ]
    }

    expect(mapsHelperLib.filterData(dataV2, dataFilter))
      .to.be.undefined
  })

  it('dataFilterV2 - conditions "or"', function () {
    var dataFilter = {
      conditions: 'or',
      filters: [
        {
          propertyName: 'type',
          equal: 'apx'
        },
        {
          propertyName: 'wfState',
          equal: 'com.soa.group.membership.state.approved'
        }
      ]
    }

    var result = mapsHelperLib.filterData(dataV2, dataFilter)

    expect(result)
      .to.be.an('object')
      .that.has.keys('title', 'guid', 'wfState', 'name', 'type', 'count')
  })
})

describe('dataFilter tests', function () {
  it('dataFilter - baseline, no data filter apply', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 11
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)

    // agencyName and businessKey must match
    const hdbIndex = 1
    expect(param.sessionData.agencyList[hdbIndex])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultHdb)

    const cpfIndex = 5
    expect(param.sessionData.agencyList[cpfIndex])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultCpf)
  })

  it('dataFilter - agencyName startWith cpf (case in-censitive search)', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'title',
      startsWith: 'cPf'
    }

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 4
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)

    // agencyName and businessKey must match
    const cpfIndex = 0
    expect(param.sessionData.agencyList[cpfIndex])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultCpf)
    const cpfP1Index = 1
    expect(param.sessionData.agencyList[cpfP1Index])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultCpfP1)
  })

  it('dataFilter - agencyName startWith cpf or hdb (case in-censitive search)', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'title',
      regex: 'cPf|hdb'
    }

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 8
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)

    const cpfIndex = 4
    expect(param.sessionData.agencyList[cpfIndex])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultCpf)
    const cpfP1Index = 5
    expect(param.sessionData.agencyList[cpfP1Index])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultCpfP1)
  })

  it('dataFilter - activeVersion == version', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'activeVersion',
      equal: {
        propertyName: 'version'
      }
    }

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 3
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)

    // agencyName and businessKey must match
    const cpfP1Index = 2
    expect(param.sessionData.agencyList[cpfP1Index])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultCpfP1)
  })

  it('dataFilter - activeVersion == 3', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'activeVersion',
      equal: {
        dataValue: 3
      }
    }

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 4
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)

    // agencyName and businessKey must match
    const hdbP1Index = 0
    expect(param.sessionData.agencyList[hdbP1Index])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultHdbP1)
  })

  it('dataFilter - activeVersion != version', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'activeVersion',
      notEqual: {
        propertyName: 'version'
      }
    }

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 8
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)

    // agencyName and businessKey must match
    const cpfP2Index = 4
    expect(param.sessionData.agencyList[cpfP2Index])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultCpfP2)
  })

  it('dataFilter - activeVersion != 3', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'activeVersion',
      notEqual: {
        dataValue: 3
      }
    }

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 7
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)

    // agencyName and businessKey must match
    const cpfIndex = 3
    expect(param.sessionData.agencyList[cpfIndex])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultCpf)
  })

  it('dataFilter - version > activeVersion', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'version',
      greaterThan: {
        propertyName: 'activeVersion'
      }
    }

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.not.throw()
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 8
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)

    // agencyName and businessKey must match
    const cpfP2Index = 4
    expect(param.sessionData.agencyList[cpfP2Index])
      .to.be.an('object')
      .that.has.all.keys('agencyName', 'businessKey')
      .to.include(expectedResultCpfP2)
  })

  it('dataFilter - version > 4', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'version',
      greaterThan: {
        dataValue: 4
      }
    }

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.not.throw()
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 3
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)
  })

  it('dataFilter - left operand (dataFilter.propertyName) "currentVersion" not exists on target object', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'currentVersion',
      equal: {
        dataValue: 5
      }
    }

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', 'currentVersion')
    // console.log(JSON.stringify(param.sessionData, null, 4))
  })

  it('dataFilter - right operand (dataFilter.equel.propertyName) "currentVersion" not exists on target object', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'activeVersion',
      equal: {
        propertyName: 'currentVersion'
      }
    }

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', 'currentVersion')
    // console.log(JSON.stringify(param.sessionData, null, 4))
  })

  it('dataFilter - right operand (dataFilter.equel.propertyName or dataFilter.equel.dataValue) missing or undefined', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {
      propertyName: 'activeVersion',
      equal: {
      }
    }

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
    // .with.property('propertyName', [ 'dataFilter.equal.propertyName', 'dataFilter.equal.dataValue' ])
    // console.log(JSON.stringify(param.sessionData, null, 4))
  })

  it('dataFilter - empty dataFilter (return none)', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = {}

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.not.throw()
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 0
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)
  })

  it('dataFilter - null dataFilter (return all)', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = null

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.not.throw()
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 11
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)
  })

  it('dataFilter - undefined dataFilter (return all)', function () {
    var param = _.cloneDeep(params.param_dataFilter.param)

    param.saveMaps[0].dataFilter = undefined

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.not.throw()
    // console.log(JSON.stringify(param.sessionData, null, 4))

    const agenciesFound = 11
    expect(param.sessionData.agencyList)
      .to.be.an('array')
      .to.have.lengthOf(agenciesFound)
  })
})

// // when saveMap.propertyName == undefined
// describe('saveMaps Tests - undefined sessionData variable initialize to correct data type', function () {
//     it('saveMaps - access param object and map to object', function () {
//         var param = _.cloneDeep(params.param3)

//         expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
//             .to.not.throw()
//         // console.log(JSON.stringify(param.sessionData, null, 4))

//         let usersFound = 1
//         expect(param.sessionData.users)
//             .to.be.an('array')
//             .to.have.lengthOf(usersFound)

//         // agencyName and businessKey must match
//         expect(param.sessionData.users[0])
//             .to.be.an('object')
//             .that.has.all.keys('userName', 'userFdn')
//             .to.include({
//                 "userName": "adminawslab",
//                 "userFdn": "7d146b36-bf94-402a-a2bc-31a708a21089.awslab"
//             })
//     });

//     it('saveMaps - variable Initialization', function () {
//         var param = _.cloneDeep(params.param2)

//         mapsHelperLib.applySaveMaps(param)
//         // console.log(JSON.stringify(param.sessionData, null, 4))

//         expect(param.sessionData.initArray)
//             .to.be.an('array')
//             .that.is.empty

//         expect(param.sessionData.initObject)
//             .to.be.an('object')
//             .that.is.empty

//         expect(param.sessionData.initNumber)
//             .to.be.an('number')
//             .to.equal(0)

//         expect(param.sessionData.initString1)
//             .to.be.a('string')
//             .that.is.empty

//         expect(param.sessionData.initString2)
//             .to.be.a('string')
//             .that.is.empty
//     });
// });

// describe('saveMaps Tests - save as object from an array', function () {
//     var param = _.cloneDeep(params.param1)

//     mapsHelperLib.applySaveMaps(param)
//     // console.log(JSON.stringify(param.sessionData, null, 4))

//     it('saveMaps - save as object in correct format', function () {
//         expect(param.sessionData.deploymentZones[0])
//             .to.be.an('object')
//             .to.include({
//                 "deploymentZoneID": "8a761839-cca2-4269-aef4-cf9fd328777d.awslab",
//                 "name": "AWS CPF LAB Gateway",
//                 "containerCount": 2,
//                 "containerAssigned": 2
//             })
//     });

//     it('saveMaps - return 3 records', function () {
//         let usersFound = 3
//         expect(param.sessionData.deploymentZones)
//             .to.be.an('array')
//             .to.have.lengthOf(3)
//     });
// });

describe('saveMaps Tests', function () {
  var param1 = {
    name: 'Mandarin Oriental',

    responseBody: {
      markers: [
        {
          name: 'Rixos The Palm Dubai',
          location: [25.1212, 55.1535]
        },
        {
          name: 'Shangri-La Hotel',
          location: [25.2084, 55.2719]
        },
        {
          name: 'Grand Hyatt',
          location: [25.2285, 55.3273]
        }
      ]
    },

    sessionData: {},

    saveMaps: []
  }

  it('saveMaps - save markers object in hotels array', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.hotels)
      .to.be.an('array')
      .to.have.lengthOf(3)

    expect(param.sessionData.hotels[0])
      .to.be.an('object')
      .to.deep.include(
        {
          name: 'Rixos The Palm Dubai',
          location: [
            25.1212,
            55.1535
          ]
        })
  })

  it('saveMaps - save markers into new object by specifying properties to transfer', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers',
        properties: [
          {
            propertyName: 'name',
            objectPropertyName: 'name'
          },
          {
            propertyName: 'location',
            objectPropertyName: 'position'
          }
        ]
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.hotels)
      .to.be.an('array')
      .to.have.lengthOf(3)

    expect(param.sessionData.hotels[0])
      .to.be.an('object')
      .to.deep.include(
        {
          name: 'Rixos The Palm Dubai',
          position: [
            25.1212,
            55.1535
          ]
        })
  })

  it('saveMaps - initialize variable - array', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'initArray',
        dataType: 'array'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.initArray)
      .to.be.an('array')
      .that.is.empty
  })

  it('saveMaps - initialize variable - object', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'initObject',
        dataType: 'object'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.initObject)
      .to.be.an('object')
      .that.is.empty
  })

  it('saveMaps - initialize variable - number', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'initNumber',
        dataType: 'number'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.initNumber)
      .to.be.an('number')
      .to.equal(0)
  })

  it('saveMaps - remove existing property by setting the value to undefined', function () {
    var param = {
      sessionData: {
        removeProperty: 'Some Value'
      },

      saveMaps: []
    }

    param.saveMaps.push(
      {
        sessionName: 'removeProperty',
        dataType: 'undefined'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param, null, 4))

    expect(param.sessionData.removeProperty)
      .to.be.undefined
  })

  it('saveMaps - initialize variable - string with invalid dataType', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'initString1',
        dataType: 'randomStringOrNothing'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.initString1)
      .to.be.a('string')
      .that.is.empty
  })

  it('saveMaps - initialize variable - string without dataType', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'initString2'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.initString2)
      .to.be.a('string')
      .that.is.empty
  })

  it('saveMaps - save selected object from source to sessionData as array', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'selectedObject',
        dataType: 'array',
        propertyName: 'responseBody.markers[0]'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.selectedObject)
      .to.be.an('array')
      .to.be.lengthOf(1)
      .that.deep.include(
        {
          name: 'Rixos The Palm Dubai',
          location: [
            25.1212,
            55.1535
          ]
        }
      )
  })

  it('saveMaps - error when save selected object from source to sessionData as object without property name', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'selectedObject',
        dataType: 'object',
        propertyName: 'responseBody.markers[0]'
      }
    )

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', 'objectPropertyName')
  })

  it('saveMaps - save selected object from source to sessionData as object with property name', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'selectedObject',
        dataType: 'object',
        objectPropertyName: 'firstMarker',
        propertyName: 'responseBody.markers[0]'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.selectedObject)
      .to.be.an('object')
      .that.deep.include(
        {
          firstMarker: {
            name: 'Rixos The Palm Dubai',
            location: [
              25.1212,
              55.1535
            ]
          }
        }
      )
  })

  it('saveMaps - save selected object from source to sessionData', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'selectedObject',
        propertyName: 'responseBody.markers[0]'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData)
      .to.be.an('object')
      .that.deep.include(
        {
          selectedObject: {
            name: 'Rixos The Palm Dubai',
            location: [
              25.1212,
              55.1535
            ]
          }
        }
      )
  })

  it('saveMaps - dataPath with . (root object)', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'selectedObject',
        dataValue: 'Constant Value'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.selectedObject)
      .to.be.a('string')
      .to.be.equal('Constant Value')
  })

  it('saveMaps - acess the param object', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'selectedObject',
        dataPath: '.',
        propertyName: 'name'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.selectedObject)
      .to.be.an('array')
  })

  it('saveMaps - without saveMaps and skip saveMap', function () {
    var param = _.cloneDeep(param1)

    // skip saveMaps
    param.saveMaps = undefined
    mapsHelperLib.applySaveMaps(param)

    // skip one saveMap
    param.saveMaps = []
    param.saveMaps.push(
      {
        skip: true,
        sessionName: 'initString',
        propertyName: 'name'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.initString)
      .to.be.an('undefined')
  })

  it('saveMaps - increase coverage - sessionData already declare as string', function () {
    var param = _.cloneDeep(param1)

    // sessionData.initString is not null
    param.sessionData.initString = ''

    param.saveMaps.push(
      {
        sessionName: 'initString',
        propertyName: 'name'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.initString)
      .to.be.a('string')
      .that.is.equal('Mandarin Oriental')
  })

  it('saveMaps - increase coverage - sessionData already declare as array', function () {
    var param = _.cloneDeep(param1)

    // set default empty array
    param.sessionData.arrayList = []

    param.saveMaps.push(
      {
        sessionName: 'arrayList',
        dataPath: 'responseBody.markers',
        propertyName: '.'
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.arrayList)
      .to.be.an('array')
      .that.is.lengthOf(3)
  })
})

describe('outputMaps tests', function () {
  var param1 = {
    stringValue: 'Helloworld!!!',
    numberValue: 1234567890,

    arrayValue: [
      { data: 'value1' },
      { data: 'value2' }
    ],

    sessionData: {
      stringValue: 'sessionData.Helloworld!!!'
    },

    outputMaps: []
  }

  var param2 = {
    responseBody: {
      markers: [
        {
          name: 'Rixos The Palm Dubai',
          location: [25.1212, 55.1535]
        },
        {
          name: 'Shangri-La Hotel',
          location: [25.2084, 55.2719]
        },
        {
          name: 'Grand Hyatt',
          location: [25.2285, 55.3273]
        }
      ]
    },

    outputMaps: []
  }

  it('outputMap - display a string value from param object in default output format', function () {
    var param = _.cloneDeep(param1)

    param.outputMaps.push(
      {
        dataPath: 'sessionData',
        propertyName: 'stringValue'
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('\n>> 1. sessionData.Helloworld!!!')
  })

  it('outputMap - display a string value from param object in custom output format', function () {
    var param = _.cloneDeep(param1)

    param.outputMaps.push(
      {
        dataPath: '.',
        propertyName: 'stringValue',
        outputFormat: '{{propertyName}}'
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('Helloworld!!!')
  })

  it('outputMap - display a string value from param object in custom output format with index', function () {
    var param = _.cloneDeep(param1)

    param.outputMaps.push(
      {
        dataPath: '.',
        propertyName: 'stringValue',
        outputFormat: '{{index}}. {{propertyName}}'
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('1. Helloworld!!!')
  })

  it('outputMap - display object(sessionData) as json for object data type', function () {
    var param = _.cloneDeep(param1)

    param.outputMaps.push(
      {
        dataPath: 'sessionData',
        propertyName: '.',
        outputFormat: '{{propertyName}}'
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('{\n    "stringValue": "sessionData.Helloworld!!!"\n}')
  })

  it('outputMap - display array(arrayValue) as json for array data type', function () {
    var param = _.cloneDeep(param1)

    param.outputMaps.push(
      {
        dataPath: 'arrayValue',
        propertyName: '.',
        outputFormat: '{{propertyName}}'
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('{\n    "data": "value1"\n}{\n    "data": "value2"\n}')
  })

  it('outputMap - display number(numberValue) as json for number data type', function () {
    var param = _.cloneDeep(param1)

    param.outputMaps.push(
      {
        dataPath: 'numberValue',
        propertyName: '.',
        outputFormat: '{{propertyName}}'
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('1234567890')
  })

  it('outputMap - skip output map', function () {
    var param = _.cloneDeep(param1)

    param.outputMaps.push(
      {
        skip: true,
        dataPath: 'sessionData',
        propertyName: '.',
        outputFormat: '{{propertyName}}'
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('')
  })

  it('outputMap - invalid dataPath', function () {
    var param = _.cloneDeep(param1)

    param.outputMaps.push(
      {
        dataPath: 'invalid',
        propertyName: 'stringValue',
        outputFormat: '{{propertyName}}'
      }
    )

    expect(mapsHelperLib.applyOutputMaps.bind(mapsHelperLib.applyOutputMaps, param))
      .to.throw(DataPathUndefinedError)
      .with.property('dataPath', 'invalid')
  })

  it('outputMap - invalid propertyName', function () {
    var param = _.cloneDeep(param1)

    param.outputMaps.push(
      {
        dataPath: '.',
        propertyName: 'invalid',
        outputFormat: '{{propertyName}}'
      }
    )

    expect(mapsHelperLib.applyOutputMaps.bind(mapsHelperLib.applyOutputMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', 'invalid')
  })

  it('outputMap - increase coverage undefined propertyName', function () {
    var param = _.cloneDeep(param1)

    // no outputMaps defined
    param.outputMaps = undefined
    expect(mapsHelperLib.applyOutputMaps(param))
      .to.be.a('string')
      .that.is.empty

    // undefined propertyName
    param.outputMaps = []
    param.outputMaps.push(
      {
        dataPath: '.',
        propertyName: undefined,
        outputFormat: '{{propertyName}}'
      }
    )

    expect(mapsHelperLib.applyOutputMaps.bind(mapsHelperLib.applyOutputMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', undefined)
  })

  it('outputMap - display array of objects', function () {
    var param = _.cloneDeep(param2)

    param.outputMaps.push(
      {
        dataPath: 'responseBody.markers',
        propertyName: '.'
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('\n>> 1. {\n    "name": "Rixos The Palm Dubai",\n    "location": [\n        25.1212,\n        55.1535\n    ]\n}\n>> 2. {\n    "name": "Shangri-La Hotel",\n    "location": [\n        25.2084,\n        55.2719\n    ]\n}\n>> 3. {\n    "name": "Grand Hyatt",\n    "location": [\n        25.2285,\n        55.3273\n    ]\n}')
  })

  it('sortBy - invalid sortBy property name', function () {
    var param = _.cloneDeep(param2)

    param.outputMaps.push(
      {
        dataPath: 'responseBody.markers',
        propertyName: '.',
        sortOrder: {
          sortBy: 'invalidSortBy'
        }
      }
    )

    // var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)
    expect(mapsHelperLib.applyOutputMaps.bind(mapsHelperLib.applyOutputMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', 'invalidSortBy')

    // expect(output)
    //     .to.be.a('string')
    //     .that.equal('\n>> 1. {\n    "name": "Grand Hyatt",\n    "location": [\n        25.2285,\n        55.3273\n    ]\n}\n>> 2. {\n    "name": "Rixos The Palm Dubai",\n    "position": [\n        25.1212,\n        55.1535\n    ]\n}\n>> 3. {\n    "name": "Shangri-La Hotel",\n    "location": [\n        25.2084,\n        55.2719\n    ]\n}')
  })

  it('sortBy - display object by sorted name asc', function () {
    var param = _.cloneDeep(param2)

    param.outputMaps.push(
      {
        dataPath: 'responseBody.markers',
        propertyName: '.',
        sortOrder: {
          sortBy: 'name'
        }
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('\n>> 1. {\n    "name": "Grand Hyatt",\n    "location": [\n        25.2285,\n        55.3273\n    ]\n}\n>> 2. {\n    "name": "Rixos The Palm Dubai",\n    "location": [\n        25.1212,\n        55.1535\n    ]\n}\n>> 3. {\n    "name": "Shangri-La Hotel",\n    "location": [\n        25.2084,\n        55.2719\n    ]\n}')
  })

  it('sortBy - display object by sorted name desc', function () {
    var param = _.cloneDeep(param2)

    param.outputMaps.push(
      {
        dataPath: 'responseBody.markers',
        propertyName: '.',
        sortOrder: {
          sortBy: 'name',
          orderBy: 'desc'
        }
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('\n>> 1. {\n    "name": "Shangri-La Hotel",\n    "location": [\n        25.2084,\n        55.2719\n    ]\n}\n>> 2. {\n    "name": "Rixos The Palm Dubai",\n    "location": [\n        25.1212,\n        55.1535\n    ]\n}\n>> 3. {\n    "name": "Grand Hyatt",\n    "location": [\n        25.2285,\n        55.3273\n    ]\n}')
  })

  it('outputMap - display array of name', function () {
    var param = _.cloneDeep(param2)

    param.outputMaps.push(
      {
        dataPath: 'responseBody.markers',
        propertyName: 'name'
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('\n>> 1. Rixos The Palm Dubai\n>> 2. Shangri-La Hotel\n>> 3. Grand Hyatt')
  })

  it('sortBy - display array by sorted name asc', function () {
    var param = _.cloneDeep(param2)

    param.outputMaps.push(
      {
        dataPath: 'responseBody.markers',
        propertyName: 'name',
        sortOrder: {

        }
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('\n>> 1. Grand Hyatt\n>> 2. Rixos The Palm Dubai\n>> 3. Shangri-La Hotel')
  })

  it('sortBy - display array by sorted name desc', function () {
    var param = _.cloneDeep(param2)

    param.outputMaps.push(
      {
        dataPath: 'responseBody.markers',
        propertyName: 'name',
        sortOrder: {
          orderBy: 'desc'
        }
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('\n>> 1. Shangri-La Hotel\n>> 2. Rixos The Palm Dubai\n>> 3. Grand Hyatt')
  })

  it('outputMap - disply not found message', function () {
    var param = _.cloneDeep(param2)

    param.outputMaps.push(
      {
        dataPath: 'responseBody.markers',
        propertyName: 'name',
        notFoundMessage: 'Record not found',
        dataFilter: {
          startWith: 'desc'
        }
      }
    )

    var output = mapsHelperLib.applyOutputMaps(param)
    // console.log(output)

    expect(output)
      .to.be.a('string')
      .that.equal('Record not found')
  })
})

describe('nextHopMap Tests', function () {
  var param1 = {
    name: 'Mandarin Oriental',

    responseBody: {
      markers: [
        {
          name: 'Rixos The Palm Dubai',
          location: [25.1212, 55.1535]
        },
        {
          name: 'Shangri-La Hotel',
          location: [25.2084, 55.2719]
        },
        {
          name: 'Grand Hyatt',
          location: [25.2285, 55.3273]
        }
      ]
    },
    noResults: [],

    nextHopParams: [],

    paramTemplate: {
      id: '',
      description: 'Hotel - {{name}}',
      position: null
    },

    nextHopMaps: []
  }

  it('nextHopMap - invalid paramTemplateName', function () {
    var param = _.cloneDeep(param1)

    param.nextHopMaps.push(
      {
        paramTemplateName: 'invalidParamTemplate',
        dataPath: 'responseBody.markers',
        notFoundMessage: '\n>> No markers found.',
        replaceMaps: [
          {
            propertyName: 'description',
            replaceValue: 'name'
          }
        ]
      }
    )

    // var output = mapsHelperLib.applyNextHopMaps(param)
    expect(mapsHelperLib.applyNextHopMaps.bind(mapsHelperLib.applyNextHopMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', 'invalidParamTemplate')
  })

  // not required, assume there are not record found in response...
  // it('nextHopMap - invalid dataPath', function () {
  //     var param = _.cloneDeep(param1)

  //     param.nextHopMaps.push(
  //         {
  //             "paramTemplateName" : "paramTemplate",
  //             "dataPath" : "responseBody.invalid",
  //             "notFoundMessage" : "\n>> No markers found.",
  //             "replaceMaps" : [
  //                 {
  //                     "propertyName" : "description",
  //                     "replaceValue" : "name"
  //                 }
  //             ]
  //         }
  //     )

  //     // var output = mapsHelperLib.applyNextHopMaps(param)
  //     expect(mapsHelperLib.applyNextHopMaps.bind(mapsHelperLib.applyNextHopMaps, param))
  //         .to.throw(DataPathUndefinedError)
  //         .with.property('propertyName', 'responseBody.invalid')
  // });

  it('nextHopMap - return nextHopParams as array based on input recordset', function () {
    var param = _.cloneDeep(param1)

    param.nextHopMaps.push(
      {
        paramTemplateName: 'paramTemplate',
        dataPath: 'responseBody.markers',
        notFoundMessage: '\n>> No markers found.',
        replaceMaps: [
          {
            propertyName: 'description',
            replaceValue: 'name'
          },
          {
            propertyName: 'position',
            replaceValue: 'location'
          }
        ]
      }
    )

    expect(mapsHelperLib.applyNextHopMaps(param))
      .to.be.a('string')
      .that.is.empty

    // console.log(JSON.stringify(param.nextHopParams, null, 4))
    expect(param.nextHopParams)
      .to.be.an('array')
      .to.have.lengthOf(3)
  })

  it('nextHopMap - increase coverage for various condition', function () {
    var param = _.cloneDeep(param1)

    // clear nextHopMaps, test nextHopMaps == undefined
    param.nextHopMaps = undefined

    // no nextHopMaps provided
    expect(mapsHelperLib.applyNextHopMaps(param))
      .to.be.a('string')
      .that.is.empty

    // test propage param.id to nextHopParam
    param.id = '2'

    // test undefined nextHop params
    param.nextHopParams = undefined

    param.nextHopMaps = []
    param.nextHopMaps.push(
      {
        paramTemplateName: 'paramTemplate',
        dataPath: 'responseBody.markers'
      }
    )

    expect(mapsHelperLib.applyNextHopMaps(param))
      .to.be.a('string')
      .that.is.empty

    // console.log(JSON.stringify(param.nextHopParams, null, 4))
    expect(param.nextHopParams)
      .to.be.an('array')
      .to.have.lengthOf(3)
  })

  it('nextHopMap - return nextHopParams empty array with notFoundMessage message', function () {
    var param = _.cloneDeep(param1)

    param.nextHopMaps.push(
      {
        paramTemplateName: 'paramTemplate',
        dataPath: 'noResults',
        notFoundMessage: 'No results found.',
        replaceMaps: [
          {
            propertyName: 'description',
            replaceValue: 'name'
          }
        ]
      }
    )

    // var output = mapsHelperLib.applyNextHopMaps(param)
    expect(mapsHelperLib.applyNextHopMaps(param))
      .to.be.a('string')
      .that.is.equal('No results found.')

    // console.log(JSON.stringify(param.nextHopParams, null, 4))
    expect(param.nextHopParams)
      .to.be.an('array')
      .to.have.lengthOf(0)
  })

  it('nextHopMap - return nextHopParams empty array without message', function () {
    var param = _.cloneDeep(param1)

    param.nextHopMaps.push(
      {
        paramTemplateName: 'paramTemplate',
        dataPath: 'noResults',
        replaceMaps: [
          {
            propertyName: 'description',
            replaceValue: 'name'
          }
        ]
      }
    )

    // var output = mapsHelperLib.applyNextHopMaps(param)
    expect(mapsHelperLib.applyNextHopMaps(param))
      .to.be.a('string')
      .that.is.empty

    // console.log(JSON.stringify(param.nextHopParams, null, 4))
    expect(param.nextHopParams)
      .to.be.an('array')
      .to.have.lengthOf(0)
  })

  it('nextHopMap - process object (non-array)', function () {
    var param = _.cloneDeep(param1)

    param.nextHopMaps.push(
      {
        paramTemplateName: 'paramTemplate',
        dataPath: '.',
        replaceMaps: [
          {
            propertyName: 'description',
            replaceValue: 'name'
          }
        ]
      }
    )

    expect(mapsHelperLib.applyNextHopMaps(param))
      .to.be.a('string')
      .that.is.empty

    // console.log(JSON.stringify(param.nextHopParams, null, 4))
    expect(param.nextHopParams)
      .to.be.an('array')
      .to.have.lengthOf(1)
  })
})

describe('filterData Error Tests', function () {
  var param1 = {
    name: 'Mandarin Oriental',

    responseBody: {
      markers: [
        {
          name: 'Rixos The Palm Dubai',
          location: [25.1212, 55.1535]
        },
        {
          name: 'Shangri-La Hotel',
          location: [25.2084, 55.2719]
        },
        {
          name: 'Grand Hyatt',
          location: [25.2285, 55.3273]
        }
      ]
    },

    sessionData: {},

    saveMaps: []
  }

  it('filterData - no record return when no filter condition provided', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers',
        dataFilter: { }
      }
    )

    mapsHelperLib.applySaveMaps(param)
    // console.log(JSON.stringify(param.sessionData, null, 4))

    expect(param.sessionData.hotels)
      .to.be.an('array')
      .to.have.lengthOf(0)
  })

  it('filterData - equal error - propertName and dataValue is missing', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers',
        dataFilter: {
          equal: {
          }
        }
      }
    )

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', undefined)
  })

  it('filterData - not equal error - left operand propertName is missing', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers',
        dataFilter: {
          notEqual: { }
        }
      }
    )

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', undefined)
  })

  it('filterData - not equal error - right operand invalid propertName', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers',
        dataFilter: {
          propertyName: 'name',
          notEqual: {
            propertyName: 'invalid'
          }
        }
      }
    )

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', 'invalid')
  })

  it('filterData - not equal error - right operand invalid missing propertName and undefined dataValue', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers',
        dataFilter: {
          propertyName: 'name',
          notEqual: {
            dataValue: undefined
          }
        }
      }
    )

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName')
      .that.is.lengthOf(2)
  })

  it('filterData - greaterThan error - left operand propertName is missing', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers',
        dataFilter: {
          greaterThan: { }
        }
      }
    )

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', undefined)
  })

  it('filterData - greaterThan error - right operand invalid propertName', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers',
        dataFilter: {
          propertyName: 'name',
          greaterThan: {
            propertyName: 'invalid'
          }
        }
      }
    )

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName', 'invalid')
  })

  it('filterData - greaterThan error - right operand invalid missing propertName and undefined dataValue', function () {
    var param = _.cloneDeep(param1)

    param.saveMaps.push(
      {
        sessionName: 'hotels',
        dataPath: 'responseBody.markers',
        dataFilter: {
          propertyName: 'name',
          greaterThan: {
            dataValue: undefined
          }
        }
      }
    )

    expect(mapsHelperLib.applySaveMaps.bind(mapsHelperLib.applySaveMaps, param))
      .to.throw(PropertyUndefinedError)
      .with.property('propertyName')
      .that.is.lengthOf(2)
  })
})
