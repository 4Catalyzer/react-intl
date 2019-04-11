import React, {useContext} from 'react';
import {invariantIntlContext} from '../utils';


const IntlContext = React.createContext(null);

export const Provider = IntlContext.Provider

export default function useIntl({ enforceContext = true } = {}) {
  const intl = useContext(IntlContext)

  if (enforceContext) {
    invariantIntlContext({ intl });
  }

  return intl
}
