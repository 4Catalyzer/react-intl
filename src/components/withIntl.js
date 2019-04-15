import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import useIntl from './useIntl';

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function withIntl(WrappedComponent, options = {}) {
  const {intlPropName = 'intl', enforceContext = true} = options;

  const withIntl = React.forwardRef((props, ref) => {
    const intl = useIntl({enforceContext});
    return <WrappedComponent {...{...props, [intlPropName]: intl}} ref={ref} />;
  });

  withIntl.WrappedComponent = WrappedComponent;

  withIntl.displayName = `withIntl(${getDisplayName(WrappedComponent)})`;

  return hoistNonReactStatics(withIntl, WrappedComponent);
}
