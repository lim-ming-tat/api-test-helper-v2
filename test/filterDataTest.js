'use strict'

const mapsHelperLib = require('../lib/mapsHelperLib')

var item =
{
  title: 'You have been invited to be an API Administrator by CPF Agency Admin',
  guid: 'group_member_req10083.gcc',
  wfState: 'com.soa.group.membership.state.approved',
  name: '[CPF-PVT] SLACreateNewCaseCRMS:Services',
  type: 'api'
}

var dataFilter1 =
{
  propertyName: 'type',
  equal: {
    dataValue: 'api'
  }
}

var dataFilter2 =
{
  propertyName: 'type',
  equal: 'api'
}

var dataFilter3 =
{
  propertyName: 'type',
  equal: 'apx'
}

var dataFilter4 =
{
  conditions: 'and',
  Xconditions: {},
  Xfilters: '',
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

// console.log(typeof dataFilter4.filters)
// console.log(Array.isArray(dataFilter4.filters))

var result

result = mapsHelperLib.filterData(item, dataFilter1)
console.log(`Test 1 :::\n${JSON.stringify(result, null, 4)}`)

result = mapsHelperLib.filterData(item, dataFilter2)
console.log(`Test 2 :::\n${JSON.stringify(result, null, 4)}`)

result = mapsHelperLib.filterData(item, dataFilter3)
console.log(`Test 3 :::\n${JSON.stringify(result, null, 4)}`)

result = mapsHelperLib.filterData(item, dataFilter4)
console.log(`Test 4 :::\n${JSON.stringify(result, null, 4)}`)
