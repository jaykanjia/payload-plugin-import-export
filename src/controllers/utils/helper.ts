/**
 * Recursively flattens a nested object.
 * @param obj The object to flatten.
 * @param prefix Internal use for recursion.
 * @returns A flattened object.
 */
export function flattenObject(obj: any, prefix = ''): any {
  let result: any = {}

  for (const key in obj) {
    const value = obj[key]
    const prefixedKey = prefix ? `${prefix}.${key}` : key

    if (Array.isArray(value)) {
      if (value.length && typeof value[0] === 'object') {
        value.forEach((item, index) => {
          const nested = flattenObject(item, `${prefixedKey}[${index}]`)
          result = { ...result, ...nested }
        })
      } else {
        result[prefixedKey] = value.join(', ')
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value, prefixedKey))
    } else {
      result[prefixedKey] = value
    }
  }

  return result
}

type FilterValue = boolean | FilterObject
interface FilterObject {
  [key: string]: FilterValue
}

type DataObject = {
  [key: string]: any
}

function filterItem(obj: DataObject, filter: FilterObject): DataObject {
  const result: DataObject = {}

  for (const key in filter) {
    const filterVal = filter[key]
    const objVal = obj[key]

    if (Array.isArray(objVal) && typeof filterVal === 'object' && filterVal !== null) {
      // If it's an array of objects and we have a filter object, map each item
      result[key] = objVal.map((item: DataObject) => filterItem(item, filterVal as FilterObject))
    } else if (
      typeof objVal === 'object' &&
      objVal !== null &&
      typeof filterVal === 'object' &&
      filterVal !== null
    ) {
      // Nested object
      result[key] = filterItem(objVal, filterVal as FilterObject)
    } else if (filterVal === true) {
      // Simple field
      result[key] = objVal
    }
  }

  return result
}

export function applyFilter(dataArray: DataObject[], filter: FilterObject): DataObject[] {
  return dataArray.map((item) => filterItem(item, filter))
}
