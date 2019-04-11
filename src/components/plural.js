/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import useIntl from './useIntl'
import { intlShape, pluralFormatPropTypes } from '../types'

function FormattedPlural(props) {
  const { formatPlural, textComponent: Text } = useIntl()
  const { value, other, children } = props

  return useMemo(() => {
    let pluralCategory = formatPlural(value, props)
    let formattedPlural = props[pluralCategory] || other

    if (typeof children === 'function') {
      return children(formattedPlural)
    }

    return <Text>{formattedPlural}</Text>
  }, [value, other, children, props.style])
}

FormattedPlural.displayName = 'FormattedPlural'

FormattedPlural.propTypes = {
  ...pluralFormatPropTypes,
  intl: intlShape,
  value: PropTypes.any.isRequired,

  other: PropTypes.node.isRequired,
  zero: PropTypes.node,
  one: PropTypes.node,
  two: PropTypes.node,
  few: PropTypes.node,
  many: PropTypes.node,

  children: PropTypes.func,
}

FormattedPlural.defaultProps = {
  style: 'cardinal',
}

export default FormattedPlural
