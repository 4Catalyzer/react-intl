/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import useIntl from './useIntl'
import { dateTimeFormatPropTypes } from '../types'

function FormattedDate(props) {
  const { formatDate, textComponent: Text } = useIntl()

  const { value, children } = props

  return useMemo(() => {
    let formattedDate = formatDate(value, props)

    if (typeof children === 'function') {
      return children(formattedDate)
    }

    return <Text>{formattedDate}</Text>
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
  ])
}

FormattedDate.displayName = 'FormattedDate'

FormattedDate.propTypes = {
  ...dateTimeFormatPropTypes,
  value: PropTypes.any.isRequired,
  format: PropTypes.string,
  children: PropTypes.func,
}

export default FormattedDate
