import expect, { createSpy, spyOn } from 'expect'
import React from 'react'
import { generateIntlContext, mountWithContext } from '../testUtils'
import FormattedHTMLMessage, {
  BaseFormattedHTMLMessage,
} from '../../../src/components/html-message'
import { BaseFormattedMessage } from '../../../src/components/message'

describe('<FormattedHTMLMessage>', () => {
  let consoleError
  let intl

  beforeEach(() => {
    consoleError = spyOn(console, 'error')
    intl = generateIntlContext({
      locale: 'en',
      defaultLocale: 'en-US',
    })
  })

  afterEach(() => {
    consoleError.restore()
  })

  it('has a `displayName`', () => {
    expect(FormattedHTMLMessage.displayName).toBeA('string')
  })

  it('extends FormattedMessage', () => {
    expect(BaseFormattedHTMLMessage.prototype).toBeA(BaseFormattedMessage)
  })

  it('renders a formatted HTML message in a <span>', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, <b>World</b>!',
    }

    const rendered = mountWithContext(
      intl,
      <FormattedHTMLMessage {...descriptor} />
    )

    expect(rendered.find('span').length).toEqual(1)
    expect(rendered.prop('dangerouslySetInnerHTML')).toEqual({
      __html: intl.formatHTMLMessage(descriptor),
    })
  })

  it('accepts `values` prop', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, <b>{name}</b>!',
    }
    const values = { name: 'Eric' }

    const rendered = mountWithContext(
      intl,
      <FormattedHTMLMessage {...descriptor} values={values} />
    )

    expect(rendered.prop('dangerouslySetInnerHTML').__html).toBe(
      intl.formatHTMLMessage(descriptor, values)
    )
  })

  it('should HTML-escape `values`', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, <b>{name}</b>!',
    }
    const values = { name: '<i>Eric</i>' }

    const rendered = mountWithContext(
      intl,
      <FormattedHTMLMessage {...descriptor} values={values} />
    )

    expect(rendered.prop('dangerouslySetInnerHTML').__html).toBe(
      'Hello, <b>&lt;i&gt;Eric&lt;/i&gt;</b>!'
    )
  })

  it('accepts `tagName` prop', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, <b>World</b>!',
    }
    const tagName = 'p'

    const rendered = mountWithContext(
      intl,
      <FormattedHTMLMessage {...descriptor} tagName={tagName} />
    )

    expect(rendered.type()).toEqual(tagName)
  })

  it('supports function-as-child pattern', () => {
    const descriptor = {
      id: 'hello',
      defaultMessage: 'Hello, <b>World</b>!',
    }

    const spy = createSpy().andReturn(<p>Jest</p>)
    const rendered = mountWithContext(
      intl,
      <FormattedHTMLMessage {...descriptor}>{spy}</FormattedHTMLMessage>
    )

    expect(spy.calls.length).toBe(1)
    expect(spy.calls[0].arguments).toEqual([intl.formatHTMLMessage(descriptor)])

    expect(rendered.find('p').length).toEqual(1)
    expect(rendered.text()).toBe('Jest')
  })

  it.only('does not support rich-text message formatting', () => {
    const rendered = mountWithContext(
      intl,
      <FormattedHTMLMessage
        id="hello"
        defaultMessage="Hello, <b>{name}</b>!"
        values={{
          name: <i>Eric</i>,
        }}
      />
    )
    expect(rendered.children().prop('dangerouslySetInnerHTML').__html).toBe(
      'Hello, <b>[object Object]</b>!'
    )
  })
})
