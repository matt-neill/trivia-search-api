import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Image } from '.'

const app = () => express(routes)

let userSession, anotherSession, image

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const anotherUser = await User.create({ email: 'b@b.com', password: '123456' })
  userSession = signSync(user.id)
  anotherSession = signSync(anotherUser.id)
  image = await Image.create({ createdBy: user })
})

test('POST /images 201 (user)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: userSession, public_id: 'test', version: 'test', signature: 'test', width: 'test', height: 'test', format: 'test', resource_type: 'test', url: 'test', secure_url: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.public_id).toEqual('test')
  expect(body.version).toEqual('test')
  expect(body.signature).toEqual('test')
  expect(body.width).toEqual('test')
  expect(body.height).toEqual('test')
  expect(body.format).toEqual('test')
  expect(body.resource_type).toEqual('test')
  expect(body.url).toEqual('test')
  expect(body.secure_url).toEqual('test')
  expect(typeof body.createdBy).toEqual('object')
})

test('POST /images 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /images 200 (user)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: userSession })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(typeof body[0].createdBy).toEqual('object')
})

test('GET /images 401', async () => {
  const { status } = await request(app())
    .get('/')
  expect(status).toBe(401)
})

test('GET /images/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .get(`/${image.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(image.id)
  expect(typeof body.createdBy).toEqual('object')
})

test('GET /images/:id 401', async () => {
  const { status } = await request(app())
    .get(`/${image.id}`)
  expect(status).toBe(401)
})

test('GET /images/:id 404 (user)', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
    .query({ access_token: userSession })
  expect(status).toBe(404)
})

test('PUT /images/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${image.id}`)
    .send({ access_token: userSession, public_id: 'test', version: 'test', signature: 'test', width: 'test', height: 'test', format: 'test', resource_type: 'test', url: 'test', secure_url: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(image.id)
  expect(body.public_id).toEqual('test')
  expect(body.version).toEqual('test')
  expect(body.signature).toEqual('test')
  expect(body.width).toEqual('test')
  expect(body.height).toEqual('test')
  expect(body.format).toEqual('test')
  expect(body.resource_type).toEqual('test')
  expect(body.url).toEqual('test')
  expect(body.secure_url).toEqual('test')
  expect(typeof body.createdBy).toEqual('object')
})

test('PUT /images/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${image.id}`)
    .send({ access_token: anotherSession, public_id: 'test', version: 'test', signature: 'test', width: 'test', height: 'test', format: 'test', resource_type: 'test', url: 'test', secure_url: 'test' })
  expect(status).toBe(401)
})

test('PUT /images/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${image.id}`)
  expect(status).toBe(401)
})

test('PUT /images/:id 404 (user)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, public_id: 'test', version: 'test', signature: 'test', width: 'test', height: 'test', format: 'test', resource_type: 'test', url: 'test', secure_url: 'test' })
  expect(status).toBe(404)
})

test('DELETE /images/:id 204 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${image.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(204)
})

test('DELETE /images/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .delete(`/${image.id}`)
    .send({ access_token: anotherSession })
  expect(status).toBe(401)
})

test('DELETE /images/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${image.id}`)
  expect(status).toBe(401)
})

test('DELETE /images/:id 404 (user)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  expect(status).toBe(404)
})
