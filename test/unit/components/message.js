import React from 'react'
import { mount } from 'enzyme'
import { generateIntlContext, mountWithContext } from '../testUtils'
import FormattedMessage, {
  BaseFormattedMessage,
} from '../../../src/components/message'

describe('<FormattedMessage>', () => {
  let consoleError
  let intl

  beforeEach(() => {
    intl = generateIntlContext({
      locale: 'en',
      defaultLocale: 'en',
    })

    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  it('has a `displayName`', () => {
    expect(typeof BaseFormattedMessage.displayName).toBe('string')
  })

  it('throws when <IntlProvider> is missing from ancestry and there is no defaultMessage', () => {
    expect(() => mount(<FormattedMessage />, 2)).toThrow(
      '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    )
  })

  it('should work if <IntlProvider> is missing from ancestry but there is defaultMessage', () => {
    const rendered = mount(
      <FormattedMessage id="hello" defaultMessage="Hello" />
    )

    expect(rendered.find('span')).toHaveLength(1)
    expect(rendered.text()).toBe('Hello')

    expect(consoleError).toHaveBeenCalledTimes(1)
  })

  it('renders a formatted message in a <span>', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, World!',
    }

    const rendered = mountWithContext(
      intl,
      <FormattedMessage {...descriptor} />
    )
    expect(rendered.find('span')).toHaveLength(1)
    expect(rendered.text()).toBe(intl.formatMessage(descriptor))
  })

  it('should not cause a unique "key" prop warning', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, {name}!',
    }

    mountWithContext(
      intl,
      <FormattedMessage {...descriptor} values={{ name: <b>Jest</b> }} />
    )

    expect(consoleError).not.toHaveBeenCalled()
  })

  it('should not cause a prop warning when description is a string', () => {
    const descriptor = {
      id: 'hello',
      description: 'Greeting',
      defaultMessage: 'Hello, {name}!',
    }

    mountWithContext(
      intl,
      <FormattedMessage {...descriptor} values={{ name: <b>Jest</b> }} />
    )

    expect(consoleError).not.toHaveBeenCalled()
  })

  it('should not cause a prop warning when description is an object', () => {
    const descriptor = {
      id: 'hello',
      description: {
        text: 'Greeting',
        ticket: 'GTP-1234',
      },
      defaultMessage: 'Hello, {name}!',
    }

    mountWithContext(
      intl,
      <FormattedMessage {...descriptor} values={{ name: <b>Jest</b> }} />
    )

    expect(consoleError).not.toHaveBeenCalled()
  })

  it('accepts `values` prop', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, {name}!',
    }
    const values = { name: 'Jest' }

    const rendered = mountWithContext(
      intl,
      <FormattedMessage {...descriptor} values={values} />
    )

    expect(rendered.find('span')).toHaveLength(1)
    expect(rendered.text()).toBe(intl.formatMessage(descriptor, values))
  })

  it('accepts string as `tagName` prop', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, World!',
    }
    const tagName = 'p'

    const rendered = mountWithContext(
      intl,
      <FormattedMessage {...descriptor} tagName={tagName} />
    )

    expect(rendered.find(tagName)).toHaveLength(1)
  })

  it('accepts an react element as `tagName` prop', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, World!',
    }

    const H1 = ({ children }) => <h1>{children}</h1>
    const rendered = mountWithContext(
      intl,
      <FormattedMessage {...descriptor} tagName={H1} />
    )

    expect(rendered.find(H1)).toHaveLength(1)
    expect(rendered.text()).toBe(intl.formatMessage(descriptor))
  })

  it('supports function-as-child pattern', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, World!',
    }

    const spy = jest.fn(() => <p>Jest</p>)

    const rendered = mountWithContext(
      intl,
      <FormattedMessage {...descriptor}>{spy}</FormattedMessage>
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(intl.formatMessage(descriptor))

    expect(rendered.find('p')).toHaveLength(1)
    expect(rendered.text()).toBe('Jest')
  })

  it('supports rich-text message formatting', () => {
    const rendered = mountWithContext(
      intl,
      <FormattedMessage
        id="hello"
        defaultMessage="Hello, {name}!"
        values={{
          name: <b>Jest</b>,
        }}
      />
    )

    const nameNode = rendered
      .find('span')
      .children()
      .first()

    expect(nameNode.type()).toBe('b')
    expect(nameNode.text()).toBe('Jest')
  })

  it('supports rich-text message formatting in function-as-child pattern', () => {
    const rendered = mountWithContext(
      intl,
      <FormattedMessage
        id="hello"
        defaultMessage="Hello, {name}!"
        values={{
          name: <b>Jest</b>,
        }}
      >
        {(...formattedMessage) => <strong>{formattedMessage}</strong>}
      </FormattedMessage>
    )
    const nameNode = rendered
      .find('strong')
      .children()
      .first()

    expect(nameNode.type()).toBe('b')
    expect(nameNode.text()).toBe('Jest')
  })

  it('should not re-render when props  are the same', () => {
    const props = {
      id: 'hello',
      defaultMessage: 'Hello, World!',
    }

    const spy = jest.fn(() => null)
    const rendered = mount(
      <FormattedMessage {...props}>{spy}</FormattedMessage>
    )

    rendered.setProps(props)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should re-render when props change', () => {
    const props = {
      id: 'hello',
      defaultMessage: 'Hello, World!',
    }

    const spy = jest.fn(() => null)
    const rendered = mount(
      <FormattedMessage {...props}>{spy}</FormattedMessage>
    )
    rendered.setProps({
      ...props,
      defaultMessage: 'Hello, Galaxy!',
    })

    expect(spy).toHaveBeenCalledTimes(2)
  })

  xit('should re-render when context changes', () => {
    const changedIntl = generateIntlContext({
      locale: 'en-US',
      defaultLocale: 'en-US',
    })

    const props = {
      id: 'hello',
      defaultMessage: 'Hello, World!',
    }

    const spy = jest.fn(() => null)
    const withIntlContext = mount(
      <FormattedMessage {...props}>{spy}</FormattedMessage>
    )
    withIntlContext.instance().mockContext(changedIntl)

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('should re-render when `values` are different', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, {name}!',
    }
    const values = {
      name: 'Jest',
    }

    const spy = jest.fn(() => null)
    const withIntlContext = mount(
      <FormattedMessage {...descriptor} values={values}>
        {spy}
      </FormattedMessage>
    )

    withIntlContext.setProps({
      ...descriptor,
      values: {
        ...values, // create new object instance with same values to test shallow equality check
      },
    })
    expect(spy).toHaveBeenCalledTimes(1) // expect only 1 render as the value object instance changed but not its values

    withIntlContext.setProps({
      ...descriptor,
      values: {
        name: 'Enzyme',
      },
    })
    expect(spy).toHaveBeenCalledTimes(2) // expect a rerender after having changed the name
  })
})
