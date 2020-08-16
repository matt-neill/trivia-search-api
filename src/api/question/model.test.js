import { Question } from '.'

let question

beforeEach(async () => {
  question = await Question.create({ name: 'test', answer: 'test', options: 'test', media: 'test', notes: 'test', tags: 'test', specialCategory: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = question.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(question.id)
    expect(view.name).toBe(question.name)
    expect(view.answer).toBe(question.answer)
    expect(view.options).toBe(question.options)
    expect(view.media).toBe(question.media)
    expect(view.notes).toBe(question.notes)
    expect(view.tags).toBe(question.tags)
    expect(view.specialCategory).toBe(question.specialCategory)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = question.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(question.id)
    expect(view.name).toBe(question.name)
    expect(view.answer).toBe(question.answer)
    expect(view.options).toBe(question.options)
    expect(view.media).toBe(question.media)
    expect(view.notes).toBe(question.notes)
    expect(view.tags).toBe(question.tags)
    expect(view.specialCategory).toBe(question.specialCategory)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
