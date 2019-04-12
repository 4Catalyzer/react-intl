import React from 'react'
import { mount } from 'enzyme'
import { mountWithContext, generateIntlContext } from '../testUtils'
import FormattedDate from '../../../src/components/date'

describe('<FormattedDate>', () => {
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
    expect(typeof FormattedDate.displayName).toBe('string')
  })

  it('throws when <IntlProvider> is missing from ancestry', () => {
    expect(() => mount(<FormattedDate />)).toThrow(
      '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    )
  })

  it('requires a finite `value` prop', () => {
    const value = Date.now()

    mountWithContext(intl, <FormattedDate value={value} />)

    expect(isFinite(value)).toBe(true)

    expect(consoleError).not.toHaveBeenCalled()

    mountWithContext(intl, <FormattedDate />)

    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalledWith(
      '[React Intl] Error formatting date.\nRangeError: Invalid time value'
    )
  })

  it('renders a formatted date in a <span>', () => {
    const date = Date.now()

    const rendered = mountWithContext(intl, <FormattedDate value={date} />)

    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe(intl.formatDate(date))
  })

  it('should not re-render when props are the same', () => {
    const date = Date.now()

    const spy = jest.fn(() => null)
    const withInlContext = mountWithContext(
      intl,
      <FormattedDate value={date}>{spy}</FormattedDate>
    )

    withInlContext.setProps({
      ...withInlContext.props(),
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should re-render when props change', () => {
    const date = Date.now()

    const spy = jest.fn(() => null)
    const withInlContext = mountWithContext(
      intl,
      <FormattedDate value={date}>{spy}</FormattedDate>
    )

    withInlContext.setProps({
      ...withInlContext.props(),
      value: withInlContext.prop('value') + 1,
    })

    expect(spy).toHaveBeenCalledTimes(2)
  })

  xit('should re-render when context changes', () => {
    const date = Date.now()

    const spy = jest.fn(() => null)
    const withInlContext = mount(
      <FormattedDate value={date}>{spy}</FormattedDate>
    )

    const otherIntl = generateIntlContext({
      locale: 'en-US',
    })
    withInlContext.instance().mockContext(otherIntl)

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('accepts valid Intl.DateTimeFormat options as props', () => {
    const date = new Date()
    const options = { year: 'numeric' }

    const rendered = mountWithContext(
      intl,
      <FormattedDate value={date} {...options} />
    )

    expect(rendered.text()).toBe(intl.formatDate(date, options))
  })

  it('fallsback and warns on invalid Intl.DateTimeFormat options', () => {
    const date = new Date()
    const rendered = mountWithContext(
      intl,
      <FormattedDate value={date} year="invalid" />
    )

    expect(rendered.text()).toBe(String(date))
    expect(consoleError).toHaveBeenCalled()
  })

  it('accepts `format` prop', () => {
    intl = generateIntlContext({
      locale: 'en',
      formats: {
        date: {
          'year-only': { year: 'numeric' },
        },
      },
    })

    const date = new Date()
    const format = 'year-only'

    const rendered = mountWithContext(
      intl,
      <FormattedDate value={date} format={format} />
    )

    expect(rendered.text()).toBe(intl.formatDate(date, { format }))
  })

  it('supports function-as-child pattern', () => {
    const date = Date.now()

    const spy = jest.fn(() => <b>Jest</b>)
    const rendered = mountWithContext(
      intl,
      <FormattedDate value={date}>{spy}</FormattedDate>
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(intl.formatDate(date))

    expect(rendered.find('b').length).toEqual(1)
    expect(rendered.text()).toBe('Jest')
  })
})
