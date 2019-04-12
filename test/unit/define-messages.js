import expect from 'expect'
import defineMessages from '../../src/define-messages'

describe('defineMessages()', () => {
  it('exports a default function', () => {
    expect(typeof defineMessages).toBe('function')
  })

  it('retuns the passed-in Message Descriptors', () => {
    const descriptors = {
      foo: {
        id: 'foo',
        description: 'For translator',
        defaultMessage: 'Hello, World!',
      },
    }

    expect(defineMessages(descriptors)).toBe(descriptors)
  })
})
