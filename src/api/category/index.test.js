import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Category } from '.'

const app = () => express(routes)

let userSession, adminSession, category

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  category = await Category.create({})
})

test('POST /categories 201 (admin)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: adminSession, name: 'test', subcategories: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
  expect(body.subcategories).toEqual('test')
})

test('POST /categories 401 (user)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('POST /categories 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /categories 200 (user)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: userSession })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /categories 401', async () => {
  const { status } = await request(app())
    .get('/')
  expect(status).toBe(401)
})

test('GET /categories/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .get(`/${category.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(category.id)
})

test('GET /categories/:id 401', async () => {
  const { status } = await request(app())
    .get(`/${category.id}`)
  expect(status).toBe(401)
})

test('GET /categories/:id 404 (user)', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
    .query({ access_token: userSession })
  expect(status).toBe(404)
})

test('PUT /categories/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${category.id}`)
    .send({ access_token: adminSession, name: 'test', subcategories: 'test' })
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(category.id)
  expect(body.name).toEqual('test')
  expect(body.subcategories).toEqual('test')
})

test('PUT /categories/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`/${category.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /categories/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${category.id}`)
  expect(status).toBe(401)
})

test('PUT /categories/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test', subcategories: 'test' })
  expect(status).toBe(404)
})

test('DELETE /categories/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`/${category.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /categories/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${category.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /categories/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${category.id}`)
  expect(status).toBe(401)
})

test('DELETE /categories/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
