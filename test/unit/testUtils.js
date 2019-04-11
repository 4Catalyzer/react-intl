import React from 'react'
import { mount, shallow } from 'enzyme'
import { Provider } from '../../src/components/useIntl'

function Wrapper({ intl, element, ...props }) {
  return <Provider value={intl}>{React.cloneElement(element, props)}</Provider>
}

export function mountWithContext(intl, element, options) {
  return mount(<Wrapper intl={intl} element={element} />, options)
}

export const makeMockContext = (modulePath, exportName = 'default') => (
  intl = null
) => {
  jest.resetModules()
  jest.doMock('../../src/components/useIntl', () => ({
    __esModule: true,
    default: () => {
      return intl
    },
    Provider: ({ children, value }) =>
      React.cloneElement(React.Children.only(children), { intl: value }),
  }))

  let myModule
  jest.isolateModules(() => {
    myModule = require(modulePath)[exportName]
  })

  return myModule
}

export const shallowDeep = (componentInstance, depth, options) => {
  let rendered = shallow(componentInstance, options)

  for (let i = 1; i < depth; i++) {
    rendered = rendered.dive()
  }

  return rendered
}

export class SpyComponent extends React.Component {
  constructor(props) {
    super(props)

    this._renders = 0
  }

  getRenderCount() {
    return this._renders
  }

  render() {
    this._renders++

    return null
  }
}

const mockProviderContext = makeMockContext('../../src/components/provider')
export const generateIntlContext = intl => {
  const IntlProvider = mockProviderContext()

  return shallowDeep(
    <IntlProvider {...intl}>
      <div />
    </IntlProvider>,
    2
  )
    .first()
    .prop('value')
}
