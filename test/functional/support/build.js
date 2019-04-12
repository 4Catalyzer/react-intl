import expect from 'expect'
import * as ReactIntl from '../../../src/'

export default function(buildPath) {
  describe('build', () => {
    it('evaluates', () => {
      expect(require(buildPath)).toBeDefined()
    })

    it('has all React Intl exports', () => {
      const ReactIntlBuild = require(buildPath)

      Object.keys(ReactIntl).forEach(name => {
        if (typeof ReactIntlBuild[name] !== typeof ReactIntl[name])
          console.log(
            name,
            typeof ReactIntl[name],
            '\n\n\n\n\n',
            ReactIntlBuild[name],
            '\n\n\n\n\n',
            ReactIntl[name]
          )
        expect(typeof ReactIntlBuild[name]).toBe(typeof ReactIntl[name])
      })
    })
  })
}
