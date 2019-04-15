/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import useIntl from './useIntl';
import {intlShape, dateTimeFormatPropTypes} from '../types';

function FormattedTime(props) {
  const {formatTime, textComponent: Text} = useIntl();
  const {value, children} = props;

  return useMemo(() => {
    let formattedTime = formatTime(value, props);

    if (typeof children === 'function') {
      return children(formattedTime);
    }

    return <Text>{formattedTime}</Text>;
  }, [
    value,
    children,
    props.localeMatcher,
    props.formatMatcher,
    props.timeZone,
    props.hour12,
    props.weekday,
    props.era,
    props.year,
    props.month,
    props.day,
    props.hour,
    props.minute,
    props.second,
    props.timeZoneName,
  ]);
}

FormattedTime.displayName = 'FormattedTime';

FormattedTime.propTypes = {
  ...dateTimeFormatPropTypes,
  intl: intlShape,
  value: PropTypes.any.isRequired,
  format: PropTypes.string,
  children: PropTypes.func,
};

export default FormattedTime;
