/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, {useMemo, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';

import useIntl, {Provider} from './useIntl';
import IntlMessageFormat from 'intl-messageformat';
import IntlRelativeFormat from 'intl-relativeformat';
import IntlPluralFormat from '../plural';
import memoizeIntlConstructor from 'intl-format-cache';
import invariant from 'invariant';
import {createError, defaultErrorHandler, filterProps} from '../utils';
import {intlConfigPropTypes, intlFormatPropTypes} from '../types';
import * as format from '../format';
import {hasLocaleData} from '../locale-data-registry';

const intlConfigPropNames = Object.keys(intlConfigPropTypes);
const intlFormatPropNames = Object.keys(intlFormatPropTypes);

// These are not a static property on the `IntlProvider` class so the intl
// config values can be inherited from an <IntlProvider> ancestor.
const defaultProps = {
  formats: {},
  messages: {},
  timeZone: null,
  textComponent: 'span',

  defaultLocale: 'en',
  defaultFormats: {},

  onError: defaultErrorHandler,
};

function getConfig(filteredProps) {
  let config = {...filteredProps};

  // Apply default props. This must be applied last after the props have
  // been resolved and inherited from any <IntlProvider> in the ancestry.
  // This matches how React resolves `defaultProps`.
  for (let propName in defaultProps) {
    if (config[propName] === undefined) {
      config[propName] = defaultProps[propName];
    }
  }

  if (!hasLocaleData(config.locale)) {
    const {locale, defaultLocale, defaultFormats, onError} = config;

    onError(
      createError(
        `Missing locale data for locale: "${locale}". ` +
          `Using default locale: "${defaultLocale}" as fallback.`
      )
    );

    // Since there's no registered locale data for `locale`, this will
    // fallback to the `defaultLocale` to make sure things can render.
    // The `messages` are overridden to the `defaultProps` empty object
    // to maintain referential equality across re-renders. It's assumed
    // each <FormattedMessage> contains a `defaultMessage` prop.
    config = {
      ...config,
      locale: defaultLocale,
      formats: defaultFormats,
      messages: defaultProps.messages,
    };
  }

  return config;
}

function getBoundFormatFns(config, state) {
  const formatterState = {...state.formatters, now: state.now};

  return intlFormatPropNames.reduce((boundFormatFns, name) => {
    boundFormatFns[name] = format[name].bind(null, config, formatterState);
    return boundFormatFns;
  }, {});
}

IntlProvider.displayName = 'IntlProvider';

IntlProvider.propTypes = {
  ...intlConfigPropTypes,
  children: PropTypes.element.isRequired,
  initialNow: PropTypes.any,
};

function useDidMount() {
  const didMount = useRef(false);
  useEffect(() => {
    didMount.current = true;
  }, []);
  return () => didMount.current;
}

function useProviderState(props, intl) {
  const isMounted = useDidMount();

  return useState(() => {
    let initialNow;
    if (isFinite(props.initialNow)) {
      initialNow = Number(props.initialNow);
    } else {
      // When an `initialNow` isn't provided via `props`, look to see an
      // <IntlProvider> exists in the ancestry and call its `now()`
      // function to propagate its value for "now".
      initialNow = intl ? intl.now() : Date.now();
    }

    // Creating `Intl*` formatters is expensive. If there's a parent
    // `<IntlProvider>`, then its formatters will be used. Otherwise, this
    // memoize the `Intl*` constructors and cache them for the lifecycle of
    // this IntlProvider instance.
    const {
      formatters = {
        getDateTimeFormat: memoizeIntlConstructor(Intl.DateTimeFormat),
        getNumberFormat: memoizeIntlConstructor(Intl.NumberFormat),
        getMessageFormat: memoizeIntlConstructor(IntlMessageFormat),
        getRelativeFormat: memoizeIntlConstructor(IntlRelativeFormat),
        getPluralFormat: memoizeIntlConstructor(IntlPluralFormat),
      },
    } = intl || {};

    return {
      formatters,

      // Wrapper to provide stable "now" time for initial render.
      now: () => {
        return isMounted() ? Date.now() : initialNow;
      },
    };
  });
}

export default function IntlProvider(props) {
  invariant(
    typeof Intl !== 'undefined',
    '[React Intl] The `Intl` APIs must be available in the runtime, ' +
      'and do not appear to be built-in. An `Intl` polyfill should be loaded.\n' +
      'See: http://formatjs.io/guides/runtime-environments/'
  );

  const intl = useIntl({enforceContext: false});

  const [state] = useProviderState(props, intl);

  // Build a whitelisted config object from `props`, defaults, and
  // `props.intl`, if an <IntlProvider> exists in the ancestry.
  const filteredProps = useMemo(
    () => filterProps(props, intlConfigPropNames, intl || {}),
    [
      props.locale,
      props.timeZone,
      props.formats,
      props.messages,
      props.textComponent,
      props.defaultLocale,
      props.defaultFormats,
      props.onError,
    ]
  );

  const context = useMemo(() => {
    const config = getConfig(filteredProps);
    const boundFormatFns = getBoundFormatFns(config, state);

    return {
      ...state,
      ...config,
      ...boundFormatFns,
    };
  }, [state, filterProps]);

  return <Provider value={context}>{props.children}</Provider>;
}
