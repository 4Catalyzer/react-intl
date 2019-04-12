/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import React from 'react';
import useIntl from './useIntl';
import {arePropsEqual} from './message';

function FormattedHTMLMessage(props) {
  const {formatHTMLMessage, textComponent: Text} = useIntl();
  const {
    id,
    description,
    defaultMessage,
    values: rawValues,
    tagName: Component = Text,
    children,
  } = props;

  let descriptor = {id, description, defaultMessage};
  let formattedHTMLMessage = formatHTMLMessage(descriptor, rawValues);

  if (typeof children === 'function') {
    return children(formattedHTMLMessage);
  }

  // Since the message presumably has HTML in it, we need to set
  // `innerHTML` in order for it to be rendered and not escaped by React.
  // To be safe, all string prop values were escaped when formatting the
  // message. It is assumed that the message is not UGC, and came from the
  // developer making it more like a template.
  //
  // Note: There's a perf impact of using this component since there's no
  // way for React to do its virtual DOM diffing.
  const html = {__html: formattedHTMLMessage};
  return <Component dangerouslySetInnerHTML={html} />;
}

FormattedHTMLMessage.displayName = 'FormattedHTMLMessage';

export default React.memo(FormattedHTMLMessage, arePropsEqual);
