import React from 'react'
import { mount } from 'enzyme'
import { generateIntlContext, mountWithContext } from '../testUtils'
import FormattedPlural from '../../../src/components/plural'

describe('<FormattedPlural>', () => {
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
    expect(typeof FormattedPlural.displayName).toBe('string')
  })

  it('throws when <IntlProvider> is missing from ancestry', () => {
    expect(() => mount(<FormattedPlural />)).toThrow(
      '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    )
  })

  it('renders an empty <span> when no `other` prop is provided', () => {
    const rendered = mountWithContext(intl, <FormattedPlural />, 2)
    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe('')

    const renderedWithValue = mountWithContext(
      intl,
      <FormattedPlural value={1} />
    )
    expect(renderedWithValue.find('span').length).toEqual(1)
    expect(renderedWithValue.text()).toBe('')
  })

  it('renders `other` in a <span> when no `value` prop is provided', () => {
    const other = 'Jest'

    const rendered = mountWithContext(intl, <FormattedPlural other={other} />)
    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe(other)
  })

  it('renders a formatted plural in a <span>', () => {
    const num = 1
    const one = 'foo'
    const other = 'bar'

    const rendered = mountWithContext(
      intl,
      <FormattedPlural value={num} one={one} other={other} />
    )
    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe(num === 1 ? one : other)
  })

  it('should not re-render when props are the same', () => {
    const spy = jest.fn(() => null)
    const withInlContext = mountWithContext(
      intl,
      <FormattedPlural value={1} one="foo" other="bar">
        {spy}
      </FormattedPlural>
    )

    withInlContext.setProps({
      ...withInlContext.props(),
    })

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should re-render when props change', () => {
    const spy = jest.fn(() => null)
    const withInlContext = mountWithContext(
      intl,
      <FormattedPlural value={0} one="foo" other="bar">
        {spy}
      </FormattedPlural>
    )

    withInlContext.setProps({
      ...withInlContext.props(),
      value: withInlContext.prop('value') + 1,
    })

    expect(spy).toHaveBeenCalledTimes(2)
  })

  xit('should re-render when context changes', () => {
    const spy = jest.fn(() => null)
    const withInlContext = mount(
      <FormattedPlural value={0} one="foo" other="bar">
        {spy}
      </FormattedPlural>
    )

    const otherIntl = generateIntlContext({
      locale: 'en-US',
    })
    withInlContext.instance().mockContext(otherIntl)

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('accepts valid IntlPluralFormat options as props', () => {
    const num = 22
    const props = { two: 'nd' }
    const options = { style: 'ordinal' }

    const rendered = mountWithContext(
      intl,
      <FormattedPlural value={num} {...props} {...options} />
    )

    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.text()).toBe(props[intl.formatPlural(num, options)])
  })

  it('supports function-as-child pattern', () => {
    const props = { one: 'foo' }
    const num = 1

    const spy = jest.fn(() => <b>Jest</b>)
    const rendered = mountWithContext(
      intl,
      <FormattedPlural {...props} value={num}>
        {spy}
      </FormattedPlural>
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(props[intl.formatPlural(num)])

    expect(rendered.find('b').length).toEqual(1)
    expect(rendered.text()).toBe('Jest')
  })
})
