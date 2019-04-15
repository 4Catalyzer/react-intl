import expect from 'expect'
import * as ReactIntl from '../../src/react-intl'

describe('react-intl', () => {
  describe('exports', () => {
    it('exports `addLocaleData`', () => {
      expect(typeof ReactIntl.addLocaleData).toBe('function')
    })

    it('exports `defineMessages`', () => {
      expect(typeof ReactIntl.defineMessages).toBe('function')
    })

    it('exports `injectIntl`', () => {
      expect(typeof ReactIntl.injectIntl).toBe('function')
    })

    describe('React Components', () => {
      it('exports `IntlProvider`', () => {
        expect(ReactIntl.IntlProvider).toBeAnElementType()
      })

      it('exports `FormattedDate`', () => {
        expect(ReactIntl.FormattedDate).toBeAnElementType()
      })

      it('exports `FormattedTime`', () => {
        expect(ReactIntl.FormattedTime).toBeAnElementType()
      })

      it('exports `FormattedRelative`', () => {
        expect(ReactIntl.FormattedRelative).toBeAnElementType()
      })

      it('exports `FormattedNumber`', () => {
        expect(ReactIntl.FormattedNumber).toBeAnElementType()
      })

      it('exports `FormattedPlural`', () => {
        expect(ReactIntl.FormattedPlural).toBeAnElementType()
      })

      it('exports `FormattedMessage`', () => {
        expect(ReactIntl.FormattedMessage).toBeAnElementType()
      })

      it('exports `FormattedHTMLMessage`', () => {
        expect(ReactIntl.FormattedHTMLMessage).toBeAnElementType()
      })
    })

    describe('PropTypes Definitions', () => {
      it('exports `intlShape`', () => {
        expect(typeof ReactIntl.intlShape).toBe('function')
      })
    })
  })
})
