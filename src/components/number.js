/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import useIntl from './useIntl'
import { intlShape, numberFormatPropTypes } from '../types'

function FormattedNumber(props) {
  const { formatNumber, textComponent: Text } = useIntl()
  const { value, children } = props

  return useMemo(() => {
    let formattedNumber = formatNumber(value, props)

    if (typeof children === 'function') {
      return children(formattedNumber)
    }

    return <Text>{formattedNumber}</Text>
  }, [
    value,
    children,
    props.localeMatcher,
    props.style,
    props.currency,
    props.currencyDisplay,
    props.useGrouping,
    props.minimumIntegerDigits,
    props.minimumFractionDigits,
    props.maximumFractionDigits,
    props.minimumSignificantDigits,
    props.maximumSignificantDigits,
  ])
}

FormattedNumber.displayName = 'FormattedNumber'

FormattedNumber.propTypes = {
  ...numberFormatPropTypes,
  intl: intlShape,
  value: PropTypes.any.isRequired,
  format: PropTypes.string,
  children: PropTypes.func,
}

export default FormattedNumber
