import React from 'react'
import { mount } from 'enzyme'
import { mountWithContext, SpyComponent } from '../testUtils'
import { intlConfigPropTypes, intlFormatPropTypes } from '../../../src/types'
import IntlProvider from '../../../src/components/provider'
import useIntl from '../../../src/components/useIntl'

const skipWhen = (shouldSkip, callback) => {
  if (shouldSkip) {
    callback(it.skip)
  } else {
    callback(it)
  }
}

const getIntlContext = props => {
  let intl
  const Child = () => {
    intl = useIntl()
    return null
  }
  mount(
    <IntlProvider {...props}>
      <Child />
    </IntlProvider>
  ).unmount()
  return intl
}

describe('<IntlProvider>', () => {
  let immutableIntl = false
  try {
    global.Intl = global.Intl
  } catch (e) {
    immutableIntl = true
  }

  const now = Date.now()

  const INTL = global.Intl

  const INTL_CONFIG_PROP_NAMES = Object.keys(intlConfigPropTypes)
  const INTL_FORMAT_PROP_NAMES = Object.keys(intlFormatPropTypes)

  const INTL_SHAPE_PROP_NAMES = [
    ...INTL_CONFIG_PROP_NAMES,
    ...INTL_FORMAT_PROP_NAMES,
    'now',
  ]

  const Child = () => null

  let consoleError
  let dateNow

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => now)
  })

  afterEach(() => {
    if (!immutableIntl) {
      global.Intl = INTL
    }

    consoleError.mockRestore()
    dateNow.mockRestore()
  })

  it('has a `displayName`', () => {
    expect(typeof IntlProvider.displayName).toBe('string')
  })

  // If global.Intl is immutable, then skip this test.
  skipWhen(immutableIntl, it => {
    it('throws when `Intl` is missing from runtime', () => {
      global.Intl = undefined

      expect(() => mount(<IntlProvider />)).toThrow(
        '[React Intl] The `Intl` APIs must be available in the runtime, and do not appear to be built-in. An `Intl` polyfill should be loaded.'
      )
    })
  })

  it('warns when no `locale` prop is provided', () => {
    mount(
      <IntlProvider>
        <Child />
      </IntlProvider>
    )
    expect(consoleError).toHaveBeenCalledTimes(1)

    expect(consoleError.mock.calls[0][0]).toContain(
      '[React Intl] Missing locale data for locale: "undefined". Using default locale: "en" as fallback.'
    )
  })

  it('warns when `locale` prop provided has no locale data', () => {
    const el = (
      <IntlProvider locale="missing">
        <Child />
      </IntlProvider>
    )

    const { locale } = el.props

    mount(el)
    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError.mock.calls[0][0]).toContain(
      `[React Intl] Missing locale data for locale: "${locale}". Using default locale: "en" as fallback.`
    )
  })

  it('renders its `children`', () => {
    const el = (
      <IntlProvider locale="en">
        <Child />
      </IntlProvider>
    )

    const rendered = mount(el)
    expect(rendered.children().length).toBe(1)
    expect(rendered.children().contains(<Child />)).toBe(true)
  })

  it('provides `context.intl` with `intlShape` props', () => {
    const el = (
      <IntlProvider locale="en">
        <Child />
      </IntlProvider>
    )

    const intl = getIntlContext(el)

    INTL_SHAPE_PROP_NAMES.forEach(propName => {
      expect(intl[propName]).not.toBe(
        undefined,
        `Missing context.intl prop: ${propName}`
      )
    })
  })

  it('provides `context.intl` with values from intl config props', () => {
    const props = {
      locale: 'fr-FR',
      timeZone: 'UTC',
      formats: {},
      messages: {},
      textComponent: 'span',

      defaultLocale: 'en-US',
      defaultFormats: {},

      onError: consoleError,
    }

    const intl = getIntlContext(props)

    INTL_CONFIG_PROP_NAMES.forEach(propName => {
      expect(intl[propName]).toBe(props[propName])
    })
  })

  it('provides `context.intl` with timeZone from intl config props when it is specified', () => {
    const props = {
      timeZone: 'Europe/Paris',
    }
    let intl
    const Child = () => {
      intl = useIntl()
      return null
    }

    mount(
      <IntlProvider {...props}>
        <Child />
      </IntlProvider>
    )
    expect(intl.timeZone).toBe('Europe/Paris')
  })

  it('provides `context.intl` with values from `defaultProps` for missing or undefined props', () => {
    const props = {
      locale: 'en-US',
      defaultLocale: undefined,
    }

    let intl
    const Child = () => {
      intl = useIntl()
      return null
    }

    mount(
      <IntlProvider {...props}>
        <Child />
      </IntlProvider>
    )

    expect(intl.defaultLocale).not.toBe(undefined)
    expect(intl.defaultLocale).toBe('en')
    expect(intl.messages).not.toBe(undefined)
    expect(typeof intl.messages).toBe('object')
  })

  it('provides `context.intl` with format methods bound to intl config props', () => {
    let intl
    const Child = () => {
      intl = useIntl()
      return null
    }

    mount(
      <IntlProvider
        locale="en"
        formats={{
          date: {
            'year-only': {
              year: 'numeric',
            },
          },
        }}
      >
        <Child />
      </IntlProvider>
    )

    INTL_FORMAT_PROP_NAMES.forEach(propName => {
      expect(intl[propName]).not.toBeNull()
      expect(typeof intl[propName]).toBe('function')
    })

    const date = new Date()
    const df = new Intl.DateTimeFormat('en', { year: 'numeric' })

    expect(intl.formatDate(date, { format: 'year-only' })).toBe(df.format(date))
  })

  it('inherits from an <IntlProvider> ancestor', () => {
    const props = {
      locale: 'en',
      timeZone: 'UTC',
      formats: {
        date: {
          'year-only': {
            year: 'numeric',
          },
        },
      },
      messages: {
        hello: 'Hello, World!',
      },
      textComponent: 'span',

      defaultLocale: 'fr',
      defaultFormats: {
        date: {
          'year-only': {
            year: 'numeric',
          },
        },
      },

      onError: consoleError,
    }

    let intl
    const Child = () => {
      intl = useIntl()
      return null
    }

    mount(
      <IntlProvider {...props}>
        <div>
          <IntlProvider>
            <Child />
          </IntlProvider>
        </div>
      </IntlProvider>
    )

    expect(consoleError).not.toHaveBeenCalled()

    INTL_CONFIG_PROP_NAMES.forEach(propName => {
      expect(intl[propName]).toEqual(props[propName])
    })
  })

  it('shadows inherited intl config props from an <IntlProvider> ancestor', () => {
    const props = {
      locale: 'en',
      timeZone: 'Australia/Adelaide',
      formats: {
        date: {
          'year-only': {
            year: 'numeric',
          },
        },
      },
      messages: {
        hello: 'Hello, World!',
      },

      defaultLocale: 'fr',
      defaultFormats: {
        date: {
          'year-only': {
            year: 'numeric',
          },
        },
      },
    }

    let intl
    const Child = () => {
      intl = useIntl()
      return null
    }

    mount(
      <IntlProvider {...props}>
        <div>
          <IntlProvider
            locale="fr"
            timeZone="Atlantic/Azores"
            formats={{}}
            messages={{}}
            defaultLocale="en"
            defaultFormats={{}}
            textComponent="span"
          >
            <Child />
          </IntlProvider>
        </div>
      </IntlProvider>
    )

    expect(consoleError).not.toHaveBeenCalled()

    INTL_CONFIG_PROP_NAMES.forEach(propName => {
      expect(intl[propName]).not.toBe(props[propName])
    })
  })

  it('should re-render when props change', () => {
    function Wrapper(props) {
      return (
        <IntlProvider {...props}>
          <SpyComponent />
        </IntlProvider>
      )
    }
    const intlProvider = mount(<Wrapper locale="en" />)

    intlProvider.setProps({
      locale: 'en-US',
    })

    const spy = intlProvider.find(SpyComponent).instance()
    expect(spy.getRenderCount()).toBe(2)
  })

  it('accepts `initialNow` prop', () => {
    const initialNow = 1234

    // doing this to get the actual "now" at render time
    const Child = () => {
      const intl = useIntl()
      return <div>{intl.now()}</div>
    }

    const now = +mount(
      <IntlProvider locale="en" initialNow={initialNow}>
        <Child />
      </IntlProvider>
    )
      .find(Child)
      .text()

    expect(now).toBe(initialNow)
  })

  it('defaults `initialNow` to `Date.now()`', () => {
    const dateNow = Date.now()
    const Child = () => {
      const intl = useIntl()
      return <div>{intl.now()}</div>
    }

    const now = +mount(
      <IntlProvider locale="en">
        <Child />
      </IntlProvider>
    )
      .find(Child)
      .text() // see above
    expect(now).toBe(dateNow)
  })

  it('inherits `initialNow` from an <IntlProvider> ancestor', () => {
    const initialNow = 1234
    const intl = {
      now: () => initialNow,
    }

    const Child = () => {
      const intl = useIntl()
      return <div>{intl.now()}</div>
    }

    const now = +mountWithContext(
      intl,
      <IntlProvider locale="en">
        <Child />
      </IntlProvider>
    )
      .find(Child)
      .text() // see above
    expect(now).toBe(initialNow)
  })

  it('updates `now()` to return the current date when mounted', () => {
    const initialNow = 1234

    const intl = getIntlContext({ locale: 'en', initialNow })

    expect(intl.now()).toBe(now)
  })
})
