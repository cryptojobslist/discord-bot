import { salaryRangeV2 } from './job'

describe('salaryRangeV2', () => {
  test('formats single value in k', () => {
    expect(salaryRangeV2({ minValue: 100000 } as any)).toEqual('$ 100k')
  })

  test('formats min-max range in k', () => {
    expect(salaryRangeV2({ minValue: 80000, maxValue: 120000 } as any)).toEqual('$ 80-120k')
  })

  test('formats same min and max as single value', () => {
    expect(salaryRangeV2({ minValue: 100000, maxValue: 100000 } as any)).toEqual('$ 100k')
  })

  test('uses currency symbol for non-USD', () => {
    expect(salaryRangeV2({ minValue: 50000, currency: 'EUR' } as any)).toEqual('EUR 50k')
  })

  test('uses $ for USD currency', () => {
    expect(salaryRangeV2({ minValue: 50000, currency: 'USD' } as any)).toEqual('$ 50k')
  })

  test('returns empty string when no salary data', () => {
    expect(salaryRangeV2(undefined)).toEqual('')
  })

  test('returns salaryRange string when no min/max values', () => {
    expect(salaryRangeV2(undefined, '$80k - $120k')).toEqual('$80k - $120k')
  })

  test('returns empty for zero values', () => {
    expect(salaryRangeV2({ minValue: 0, maxValue: 0 } as any)).toEqual('')
  })

  test('handles small values without k suffix', () => {
    expect(salaryRangeV2({ minValue: 500 } as any)).toEqual('$ 500')
  })
})
