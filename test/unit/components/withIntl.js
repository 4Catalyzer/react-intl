import React from 'react';
import {mount} from 'enzyme';
import {intlShape} from '../../../src/types';
import withIntl from '../../../src/components/withIntl';
import {generateIntlContext, mountWithContext} from '../testUtils';

describe('withIntl()', () => {
  let Wrapped;
  let intl;
  let rendered;

  beforeEach(() => {
    intl = generateIntlContext({locale: 'en'});
    Wrapped = () => <div />;
    Wrapped.displayName = 'Wrapped';
    Wrapped.propTypes = {
      intl: intlShape.isRequired,
    };
    Wrapped.someNonReactStatic = {
      foo: true,
    };
    rendered = null;
  });

  afterEach(() => {
    rendered && rendered.unmount();
  });

  it('allows introspection access to the wrapped component', () => {
    expect(withIntl(Wrapped).WrappedComponent).toBe(Wrapped);
  });

  it('hoists non-react statics', () => {
    expect(withIntl(Wrapped).someNonReactStatic.foo).toBe(true);
  });

  describe('displayName', () => {
    it('is descriptive by default', () => {
      expect(withIntl(() => null).displayName).toBe('withIntl(Component)');
    });

    it("includes `WrappedComponent`'s `displayName`", () => {
      Wrapped.displayName = 'Foo';
      expect(withIntl(Wrapped).displayName).toBe('withIntl(Foo)');
    });
  });

  it('throws when <IntlProvider> is missing from ancestry', () => {
    const Injected = withIntl(Wrapped);

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {}); // surpress console error from JSDom

    expect(() => (rendered = mount(<Injected />))).toThrow(
      '[React Intl] Could not find required `intl` object. <IntlProvider> needs to exist in the component ancestry.'
    );
    consoleError.mockRestore();
  });

  it('renders <WrappedComponent> with `intl` prop', () => {
    const Injected = withIntl(Wrapped);

    rendered = mountWithContext(intl, <Injected />);
    const wrappedComponent = rendered.find(Wrapped);

    expect(wrappedComponent.prop('intl')).toBe(intl);
  });

  it('propagates all props to <WrappedComponent>', () => {
    const Injected = withIntl(Wrapped);
    const props = {
      foo: 'bar',
    };

    rendered = mountWithContext(intl, <Injected {...props} />);
    const wrappedComponent = rendered.find(Wrapped);

    Object.keys(props).forEach(key => {
      expect(wrappedComponent.prop(key)).toBe(props[key]);
    });
  });

  describe('options', () => {
    describe('intlPropName', () => {
      it("sets <WrappedComponent>'s `props[intlPropName]` to `context.intl`", () => {
        const propName = 'myIntl';
        Wrapped.propTypes = {
          [propName]: intlShape.isRequired,
        };
        const Injected = withIntl(Wrapped, {
          intlPropName: propName,
        });

        rendered = mountWithContext(intl, <Injected />);
        const wrapped = rendered.find(Wrapped);

        expect(wrapped.prop(propName)).toBe(intl);
      });
    });
  });
});
