import React from 'react'
import { mount } from 'enzyme'
import { generateIntlContext, mountWithContext } from '../testUtils'
import FormattedTime from '../../../src/components/time'

describe('<FormattedTime>', () => {
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
    expect(typeof FormattedTime.displayName).toBe('string')
  })

  it('throws when <IntlProvider> is missing from ancestry', () => {
    expect(() => mount(<FormattedTime />)).toThrow(
      '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    )
  })

  it('requires a finite `value` prop', () => {
    const withIntlContext = mountWithContext(intl, <FormattedTime value={0} />)
    expect(consoleError).not.toHaveBeenCalled()

    withIntlContext.setProps({
      ...withIntlContext.props(),
      value: undefined,
    })
    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError.mock.calls[0][0]).toContain(
      '[React Intl] Error formatting time.\nRangeError'
    )
  })

  it('renders a formatted time in a <span>', () => {
    const date = new Date()

    const rendered = mountWithContext(intl, <FormattedTime value={date} />, 2)

    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe(intl.formatTime(date))
  })

  it('should not re-render when props are the same', () => {
    const date = Date.now()

    const spy = jest.fn(() => null)
    const withIntlContext = mountWithContext(
      intl,
      <FormattedTime value={date}>{spy}</FormattedTime>
    )

    withIntlContext.setProps({
      ...withIntlContext.props(),
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should re-render when props change', () => {
    const date = Date.now()

    const spy = jest.fn(() => null)
    const withIntlContext = mountWithContext(
      intl,
      <FormattedTime value={date}>{spy}</FormattedTime>
    )

    withIntlContext.setProps({
      ...withIntlContext.props(),
      value: date + 1,
    })

    expect(spy).toHaveBeenCalledTimes(2)
  })

  xit('should re-render when context changes', () => {
    const date = Date.now()

    const spy = jest.fn(() => null)
    const withIntlContext = mountWithContext(
      intl,
      <FormattedTime value={date}>{spy}</FormattedTime>
    )

    const otherIntl = generateIntlContext({ locale: 'en-US' })
    withIntlContext.instance().mockContext(otherIntl)

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('accepts valid Intl.DateTimeFormat options as props', () => {
    const date = Date.now()
    const options = { hour: '2-digit' }

    const rendered = mountWithContext(
      intl,
      <FormattedTime value={date} {...options} />
    )

    expect(rendered.text()).toBe(intl.formatTime(date, options))
  })

  it('fallsback and warns on invalid Intl.DateTimeFormat options', () => {
    const date = new Date()

    const rendered = mountWithContext(
      intl,
      <FormattedTime value={date} hour="invalid" />
    )

    expect(rendered.text()).toBe(String(date))
    expect(consoleError).toHaveBeenCalled()
  })

  it('accepts `format` prop', () => {
    intl = generateIntlContext(
      {
        locale: 'en',
        formats: {
          time: {
            'hour-only': {
              hour: '2-digit',
              hour12: false,
            },
          },
        },
      },
      {}
    )

    const date = Date.now()
    const format = 'hour-only'

    const rendered = mountWithContext(
      intl,
      <FormattedTime value={date} format={format} />
    )

    expect(rendered.text()).toBe(intl.formatTime(date, { format }))
  })

  it('supports function-as-child pattern', () => {
    const date = Date.now()

    const spy = jest.fn(() => <b>Jest</b>)
    const rendered = mountWithContext(
      intl,
      <FormattedTime value={date}>{spy}</FormattedTime>
    )

    expect(rendered.find('b').length).toEqual(1)
    expect(rendered.text()).toBe('Jest')

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(intl.formatTime(date))
  })
})
