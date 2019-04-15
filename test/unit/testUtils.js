import React from 'react';
import {mount} from 'enzyme';
import IntlProvider from '../../src/components/provider';
import useIntl, {Provider} from '../../src/components/useIntl';

function Wrapper({intl, element, ...props}) {
  return <Provider value={intl}>{React.cloneElement(element, props)}</Provider>;
}

export function mountWithContext(intl, element, options) {
  return mount(<Wrapper intl={intl} element={element} />, options);
}

export class SpyComponent extends React.Component {
  constructor(props) {
    super(props);

    this._renders = 0;
  }

  getRenderCount() {
    return this._renders;
  }

  render() {
    this._renders++;

    return null;
  }
}

export const generateIntlContext = intl => {
  let context;
  const Child = () => {
    context = useIntl();
    return null;
  };
  mount(
    <IntlProvider {...intl}>
      <Child />
    </IntlProvider>
  ).unmount();
  return context;
};
