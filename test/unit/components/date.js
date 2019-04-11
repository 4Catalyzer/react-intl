import expect, { createSpy, spyOn } from 'expect'
import React from 'react'
import { mount } from 'enzyme'
import { mountWithContext, generateIntlContext } from '../testUtils'
import FormattedDate from '../../../src/components/date'

// const mockContext = makeMockContext(
//   require.resolve('../../../src/components/date')
// )

describe('<FormattedDate>', () => {
  let consoleError
  let intl

  beforeEach(() => {
    consoleError = spyOn(console, 'error')
    intl = generateIntlContext({
      locale: 'en',
    })
  })

  afterEach(() => {
    consoleError.restore()
  })

  it('has a `displayName`', () => {
    expect(FormattedDate.displayName).toBeA('string')
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

    expect(consoleError.calls.length).toBe(0)

    mountWithContext(intl, <FormattedDate />)

    expect(consoleError.calls.length).toBe(1) // propTypes
    expect(consoleError.calls[0].arguments[0]).toContain(
      '[React Intl] Error formatting date.\nRangeError'
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

    const spy = createSpy().andReturn(null)
    const withInlContext = mountWithContext(
      intl,
      <FormattedDate value={date}>{spy}</FormattedDate>
    )

    withInlContext.setProps({
      ...withInlContext.props(),
    })

    expect(spy.calls.length).toBe(1)
  })

  it('should re-render when props change', () => {
    const date = Date.now()

    const spy = createSpy().andReturn(null)
    const withInlContext = mountWithContext(
      intl,
      <FormattedDate value={date}>{spy}</FormattedDate>
    )

    withInlContext.setProps({
      ...withInlContext.props(),
      value: withInlContext.prop('value') + 1,
    })

    expect(spy.calls.length).toBe(2)
  })

  xit('should re-render when context changes', () => {
    const date = Date.now()

    const spy = createSpy().andReturn(null)
    const withInlContext = mount(
      <FormattedDate value={date}>{spy}</FormattedDate>
    )

    const otherIntl = generateIntlContext({
      locale: 'en-US',
    })
    withInlContext.instance().mockContext(otherIntl)

    expect(spy.calls.length).toBe(2)
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
    expect(consoleError.calls.length).toBeGreaterThan(0)
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

    const spy = createSpy().andReturn(<b>Jest</b>)
    const rendered = mountWithContext(
      intl,
      <FormattedDate value={date}>{spy}</FormattedDate>
    )

    expect(spy.calls.length).toBe(1)
    expect(spy.calls[0].arguments).toEqual([intl.formatDate(date)])

    expect(rendered.find('b').length).toEqual(1)
    expect(rendered.text()).toBe('Jest')
  })
})
