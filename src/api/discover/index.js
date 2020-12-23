import { Router } from 'express';
import { middleware as query } from 'querymen';
import { token } from '../../services/passport';
import {
  index,
  getCategories,
  resetToken,
  getBalancedQuestions,
  getJServiceQuestions,
  getJServiceCategories,
  getJServiceCategory,
} from './controller';

const router = new Router();

/**
 * @api {get} /discover Retrieve discovers
 * @apiName RetrieveDiscovers
 * @apiGroup Discover
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Object[]} discovers List of discovers.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query({
    category: {
      type: String,
      paths: ['category'],
    },
    difficulty: {
      type: String,
      paths: ['difficulty'],
    },
    type: {
      type: String,
      paths: ['type'],
    },
    limit: {
      default: 6,
    },
  }),
  index);

router.get('/balanced',
  token({ required: true }),
  query({
    category: {
      type: String,
      paths: ['category'],
    },
    difficulty: {
      type: String,
      paths: ['difficulty'],
    },
    type: {
      type: String,
      paths: ['type'],
    },
    limit: {
      default: 6,
    },
  }),
  getBalancedQuestions);

router.get('/jeopardy',
  token({ required: true }),
  query({
    count: {
      type: Number,
      default: 6,
    },
    categoryId: {
      type: Number,
    },
    // difficulty: {
    //   type: Number,
    // },
    // category: {
    //   type: Number,
    // },
    // min_date: {
    //   type: Date,
    // },
    // max_date: {
    //   type: Date,
    // },
    // offset: { // pagination
    //   type: Number,
    // },
  }),
  getJServiceQuestions);

  router.get('/jeopardy/search',
  token({ required: true }),
  query(),
  getJServiceCategories);

/**
 * @api {get} /discover/:id Retrieve discover
 * @apiName RetrieveDiscover
 * @apiGroup Discover
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Object} discover Discover's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Discover not found.
 * @apiError 401 user access only.
 */
router.get('/categories',
  token({ required: true }),
  getCategories);

router.post('/reset',
  token({ required: true }),
  resetToken);

export default router;
