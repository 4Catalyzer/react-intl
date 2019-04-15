import React from 'react'
import { mount } from 'enzyme'
import { generateIntlContext, mountWithContext } from '../testUtils'
import FormattedRelative from '../../../src/components/relative'

const spySetState = () => {
  return jest.spyOn(
    require('../../../src/components/relative').BaseFormattedRelative.prototype,
    'setState'
  )
}

describe('<FormattedRelative>', () => {
  const sleep = delay => new Promise(resolve => setTimeout(resolve, delay))

  let consoleError
  let intl
  let setState

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    intl = generateIntlContext({
      locale: 'en',
    })
    setState = null
  })

  afterEach(() => {
    consoleError.mockRestore()
    setState && setState.mockRestore()
  })

  it('has a `displayName`', () => {
    expect(typeof FormattedRelative.displayName).toBe('string')
  })

  it('throws when <IntlProvider> is missing from ancestry', () => {
    expect(() => mount(<FormattedRelative />)).toThrow(
      '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    )
  })

  it('requires a finite `value` prop', () => {
    setState = spySetState()

    expect(setState).toHaveBeenCalledTimes(0)
    const date = Date.now()

    const withIntlContext = mountWithContext(
      intl,
      <FormattedRelative value={date} />
    )
    expect(consoleError).not.toHaveBeenCalled()

    withIntlContext.setProps({
      ...withIntlContext.props(),
      value: NaN,
    })

    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalledWith(
      '[React Intl] Error formatting relative time.\nRangeError: The date value provided to IntlRelativeFormat#format() is not in valid range.'
    )

    // Should avoid update scheduling tight-loop.
    return sleep(10).then(() => {
      expect(setState).toHaveBeenCalledTimes(
        1,
        '`setState()` called unexpectedly'
      )

      withIntlContext.unmount()
    })
  })

  it('renders a formatted relative time in a <span>', () => {
    const date = new Date()

    const rendered = mountWithContext(intl, <FormattedRelative value={date} />)

    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe(intl.formatRelative(date))
  })

  it('should not re-render when props are the same', () => {
    const spy = jest.fn(() => null)
    const withIntlContext = mountWithContext(
      intl,
      <FormattedRelative value={Date.now()}>{spy}</FormattedRelative>
    )

    withIntlContext.setProps({
      ...withIntlContext.props(),
    })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should re-render when props change', () => {
    const spy = jest.fn(() => null)
    const withIntlContext = mountWithContext(
      intl,
      <FormattedRelative value={Date.now()}>{spy}</FormattedRelative>
    )

    withIntlContext.setProps({
      ...withIntlContext.props(),
      value: withIntlContext.prop('value') + 1,
    })

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('accepts valid IntlRelativeFormat options as props', () => {
    const date = intl.now() - 60 * 1000
    const options = { units: 'second' }

    const rendered = mountWithContext(
      intl,
      <FormattedRelative value={date} {...options} />
    )

    expect(rendered.text()).toBe(intl.formatRelative(date, options))
  })

  it('fallsback and warns on invalid IntlRelativeFormat options', () => {
    const date = new Date()

    const rendered = mountWithContext(
      intl,
      <FormattedRelative value={date} units="invalid" />
    )

    expect(rendered.text()).toBe(String(date))
    expect(consoleError).toHaveBeenCalled()
  })

  it('accepts `format` prop', () => {
    intl = generateIntlContext(
      {
        locale: 'en',
        formats: {
          relative: {
            seconds: {
              units: 'second',
            },
          },
        },
      },
      {}
    )

    const date = intl.now() - 60 * 1000
    const format = 'seconds'

    const rendered = mountWithContext(
      intl,
      <FormattedRelative value={date} format={format} />
    )

    expect(rendered.text()).toBe(intl.formatRelative(date, { format }))
  })

  it('accepts `initialNow` prop', () => {
    const date = 0
    const now = 1000

    expect(now).not.toEqual(intl.now())

    const rendered = mountWithContext(
      intl,
      <FormattedRelative value={date} initialNow={now} />
    )

    expect(rendered.text()).toBe(intl.formatRelative(date, { now }))
  })

  it('supports function-as-child pattern', () => {
    const date = new Date()

    const spy = jest.fn(() => <b>Jest</b>)
    const rendered = mountWithContext(
      intl,
      <FormattedRelative value={date}>{spy}</FormattedRelative>
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(intl.formatRelative(date))

    expect(rendered.find('b').length).toEqual(1)
    expect(rendered.text()).toBe('Jest')
  })

  it('updates automatically', done => {
    const date = new Date()
    const now = intl.now()

    const withIntlContext = mountWithContext(
      intl,
      <FormattedRelative value={date} updateInterval={1} />
    )
    const text = withIntlContext.text()

    // Update `now()` to act like the <IntlProvider> is mounted.
    intl.now = () => now + 1000

    setTimeout(() => {
      const textAfterUpdate = withIntlContext.text()

      expect(textAfterUpdate).not.toBe(text)
      expect(textAfterUpdate).toBe(
        intl.formatRelative(date, { now: intl.now() })
      )
      done()
    }, 1500)
  })

  it('updates when the `value` prop changes', () => {
    const now = intl.now()

    const withIntlContext = mountWithContext(
      intl,
      <FormattedRelative value={now} updateInterval={1} />
    )
    const textBefore = withIntlContext.text()

    // Update `now()` to act like the <IntlProvider> is mounted.
    const nextNow = now + 10000
    intl.now = () => nextNow

    withIntlContext.setProps({
      ...withIntlContext.props(),
      value: nextNow,
    })

    expect(withIntlContext.text()).toBe(textBefore)
  })

  it('updates at maximum of `updateInterval` with a string `value`', done => {
    // `toString()` rounds the date to the nearest second, this makes sure
    // `date` and `now` are exactly 1000ms apart so the scheduler will wait
    // 1000ms before the next interesting moment.
    const now = 2000
    const date = new Date(now - 1000).toString()

    jest.spyOn(intl, 'now').mockImplementation(() => now)

    mountWithContext(
      intl,
      <FormattedRelative value={date} updateInterval={1} />
    )

    setTimeout(() => {
      // Make sure setTimeout wasn't called with `NaN`, which is like `0`.
      expect(intl.now).toHaveBeenCalledTimes(1)

      done()
    }, 10)
  })

  it('does not update when `updateInterval` prop is falsy', done => {
    const date = new Date()
    const now = intl.now()

    const withIntlContext = mountWithContext(
      intl,
      <FormattedRelative value={date} updateInterval={0} />
    )
    const textBefore = withIntlContext.text()

    // Update `now()` to act like the <IntlProvider> is mounted.
    intl.now = () => now + 1000

    setTimeout(() => {
      const textAfter = withIntlContext.text()

      expect(textAfter).toBe(textBefore)
      expect(textAfter).not.toBe(intl.formatRelative(date, { now: intl.now() }))

      done()
    }, 10)
  })
})
