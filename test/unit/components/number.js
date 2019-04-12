import React from 'react'
import { mount } from 'enzyme'
import { generateIntlContext, mountWithContext } from '../testUtils'
import FormattedNumber from '../../../src/components/number'

describe('<FormattedNumber>', () => {
  let consoleError
  let intl

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    intl = generateIntlContext({
      locale: 'en',
    })
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  it('has a `displayName`', () => {
    expect(typeof FormattedNumber.displayName).toBe('string')
  })

  it('throws when <IntlProvider> is missing from ancestry', () => {
    expect(() => mount(<FormattedNumber />)).toThrow(
      '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    )
  })

  it('renders "NaN" in a <span> when no `value` prop is provided', () => {
    const rendered = mountWithContext(intl, <FormattedNumber />, 2)

    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe('NaN')
  })

  it('renders a formatted number in a <span>', () => {
    const num = 1000

    const rendered = mountWithContext(intl, <FormattedNumber value={num} />, 2)

    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe(intl.formatNumber(num))
  })

  it('should not re-render when props are the same', () => {
    const num = 1000

    const spy = jest.fn(() => null)
    const withIntlContext = mountWithContext(
      intl,
      <FormattedNumber value={num}>{spy}</FormattedNumber>
    )

    withIntlContext.setProps({
      ...withIntlContext.props(),
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should re-render when props change', () => {
    const num = 1000

    const spy = jest.fn(() => null)
    const withIntlContext = mountWithContext(
      intl,
      <FormattedNumber value={num}>{spy}</FormattedNumber>
    )

    withIntlContext.setProps({
      ...withIntlContext.props(),
      value: num + 1,
    })

    expect(spy).toHaveBeenCalledTimes(2)
  })

  xit('should re-render when context changes', () => {
    const num = 1000

    const spy = jest.fn(() => null)
    const withIntlContext = mountWithContext(
      intl,
      <FormattedNumber value={num}>{spy}</FormattedNumber>
    )

    const otherIntl = generateIntlContext({ locale: 'en-US' })
    withIntlContext.instance().mockContext(otherIntl)

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('accepts valid Intl.NumberFormat options as props', () => {
    const num = 0.5
    const options = { style: 'percent' }

    const rendered = mountWithContext(
      intl,
      <FormattedNumber value={num} {...options} />
    )

    expect(rendered.text()).toBe(intl.formatNumber(num, options))
  })

  it('fallsback and warns on invalid Intl.NumberFormat options', () => {
    const rendered = mountWithContext(
      intl,
      <FormattedNumber value={0} style="invalid" />
    )

    expect(rendered.text()).toBe('0')
    expect(consoleError).toHaveBeenCalled()
  })

  it('accepts `format` prop', () => {
    intl = generateIntlContext(
      {
        locale: 'en',
        formats: {
          number: {
            percent: {
              style: 'percent',
              minimumFractionDigits: 2,
            },
          },
        },
      },
      {}
    )

    const num = 0.505
    const format = 'percent'

    const rendered = mountWithContext(
      intl,
      <FormattedNumber value={num} format={format} />
    )

    expect(rendered.text()).toBe(intl.formatNumber(num, { format }))
  })

  it('supports function-as-child pattern', () => {
    const num = new Date()

    const spy = jest.fn(() => <span>Jest</span>)
    const rendered = mountWithContext(
      intl,
      <FormattedNumber value={num}>{spy}</FormattedNumber>
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(intl.formatNumber(num))

    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe('Jest')
  })
})
