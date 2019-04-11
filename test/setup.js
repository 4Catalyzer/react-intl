import { configure } from 'enzyme';
import React from 'react';
import { isValidElementType } from 'react-is';

let reactMajorVersion = Number.parseInt(React.version.slice(0, 2));
if (reactMajorVersion === 0) {
  reactMajorVersion = React.version.slice(2, 4);
}
const Adapter = require(`enzyme-adapter-react-${reactMajorVersion}`);


global.expect.extend({
  toBeAnElementType(received) {
    if (isValidElementType(received)) {
      return {
        message: () =>
          `expected ${received} not to be a valid element Type`,
        pass: true,
      };
    }

    return {
      message: () =>
        `expected ${received} to be a valid element Type`,
      pass: false,
    };

  },
});

configure({ adapter: new Adapter() });


