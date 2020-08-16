import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Question } from '.'

const app = () => express(apiRoot, routes)

let userSession, adminSession, question

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  question = await Question.create({})
})

test('POST /questions 201 (admin)', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: adminSession, name: 'test', answer: 'test', options: 'test', media: 'test', notes: 'test', tags: 'test', specialCategory: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
  expect(body.answer).toEqual('test')
  expect(body.options).toEqual('test')
  expect(body.media).toEqual('test')
  expect(body.notes).toEqual('test')
  expect(body.tags).toEqual('test')
  expect(body.specialCategory).toEqual('test')
})

test('POST /questions 401 (user)', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('POST /questions 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /questions 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
    .query({ access_token: adminSession })
  expect(status).toBe(200)
  expect(Array.isArray(body.rows)).toBe(true)
  expect(Number.isNaN(body.count)).toBe(false)
})

test('GET /questions 401 (user)', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('GET /questions 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /questions/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${question.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(question.id)
})

test('GET /questions/:id 401 (user)', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/${question.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('GET /questions/:id 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/${question.id}`)
  expect(status).toBe(401)
})

test('GET /questions/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})

test('PUT /questions/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${question.id}`)
    .send({ access_token: adminSession, name: 'test', answer: 'test', options: 'test', media: 'test', notes: 'test', tags: 'test', specialCategory: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(question.id)
  expect(body.name).toEqual('test')
  expect(body.answer).toEqual('test')
  expect(body.options).toEqual('test')
  expect(body.media).toEqual('test')
  expect(body.notes).toEqual('test')
  expect(body.tags).toEqual('test')
  expect(body.specialCategory).toEqual('test')
})

test('PUT /questions/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${question.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /questions/:id 401', async () => {
  const { status } = await request(app())
    .put(`${apiRoot}/${question.id}`)
  expect(status).toBe(401)
})

test('PUT /questions/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test', answer: 'test', options: 'test', media: 'test', notes: 'test', tags: 'test', specialCategory: 'test' })
  expect(status).toBe(404)
})

test('DELETE /questions/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${question.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /questions/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${question.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /questions/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${question.id}`)
  expect(status).toBe(401)
})

test('DELETE /questions/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
