import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Widget } from '.'

const app = () => express(routes)

let userSession, widget

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  userSession = signSync(user.id)
  widget = await Widget.create({ createdBy: user })
})

test('POST /widget 201 (user)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: userSession, questionId: 'test', roundName: 'test', question: 'test', headingFont: 'test', questionFont: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.questionId).toEqual('test')
  expect(body.roundName).toEqual('test')
  expect(body.question).toEqual('test')
  expect(body.headingFont).toEqual('test')
  expect(body.questionFont).toEqual('test')
  expect(typeof body.createdBy).toEqual('object')
})

test('POST /widget 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /widget/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${widget.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(widget.id)
})

test('GET /widget/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(404)
})

test('DELETE /widget/:id 204', async () => {
  const { status } = await request(app())
    .delete(`/${widget.id}`)
  expect(status).toBe(204)
})

test('DELETE /widget/:id 404', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
  expect(status).toBe(404)
})
