import { Image } from '.'
import { User } from '../user'

let user, image

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  image = await Image.create({ createdBy: user, public_id: 'test', version: 'test', signature: 'test', width: 'test', height: 'test', format: 'test', resource_type: 'test', url: 'test', secure_url: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = image.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(image.id)
    expect(typeof view.createdBy).toBe('object')
    expect(view.createdBy.id).toBe(user.id)
    expect(view.public_id).toBe(image.public_id)
    expect(view.version).toBe(image.version)
    expect(view.signature).toBe(image.signature)
    expect(view.width).toBe(image.width)
    expect(view.height).toBe(image.height)
    expect(view.format).toBe(image.format)
    expect(view.resource_type).toBe(image.resource_type)
    expect(view.url).toBe(image.url)
    expect(view.secure_url).toBe(image.secure_url)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = image.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(image.id)
    expect(typeof view.createdBy).toBe('object')
    expect(view.createdBy.id).toBe(user.id)
    expect(view.public_id).toBe(image.public_id)
    expect(view.version).toBe(image.version)
    expect(view.signature).toBe(image.signature)
    expect(view.width).toBe(image.width)
    expect(view.height).toBe(image.height)
    expect(view.format).toBe(image.format)
    expect(view.resource_type).toBe(image.resource_type)
    expect(view.url).toBe(image.url)
    expect(view.secure_url).toBe(image.secure_url)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
