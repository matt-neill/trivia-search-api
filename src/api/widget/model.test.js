import { Widget } from '.'
import { User } from '../user'

let user, widget

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  widget = await Widget.create({ createdBy: user, questionId: 'test', roundName: 'test', question: 'test', headingFont: 'test', questionFont: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = widget.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(widget.id)
    expect(typeof view.createdBy).toBe('object')
    expect(view.createdBy.id).toBe(user.id)
    expect(view.questionId).toBe(widget.questionId)
    expect(view.roundName).toBe(widget.roundName)
    expect(view.question).toBe(widget.question)
    expect(view.headingFont).toBe(widget.headingFont)
    expect(view.questionFont).toBe(widget.questionFont)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = widget.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(widget.id)
    expect(typeof view.createdBy).toBe('object')
    expect(view.createdBy.id).toBe(user.id)
    expect(view.questionId).toBe(widget.questionId)
    expect(view.roundName).toBe(widget.roundName)
    expect(view.question).toBe(widget.question)
    expect(view.headingFont).toBe(widget.headingFont)
    expect(view.questionFont).toBe(widget.questionFont)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
