import { Router } from 'express';
import { middleware as query } from 'querymen';
import { middleware as body } from 'bodymen';
import { token } from '../../services/passport';
import {
  create, index, show, update, destroy, showBySlug,
} from './controller';
import { schema } from './model';

export Category, { schema } from './model';

const router = new Router();
const {
  name, media, sortOrder, isCustomCategory, opentriviadb_categories, active, color,
} = schema.tree;

/**
 * @api {post} /categories Create category
 * @apiName CreateCategory
 * @apiGroup Category
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Category's name.
 * @apiParam subcategories Category's subcategories.
 * @apiSuccess {Object} category Category's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Category not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: true, roles: ['admin'] }),
  body({
    name, media, sortOrder, isCustomCategory, opentriviadb_categories, active, color,
  }),
  create);

/**
 * @api {get} /categories Retrieve categories
 * @apiName RetrieveCategories
 * @apiGroup Category
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Object[]} categories List of categories.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query({
    hideCustom: {
      type: Boolean,
      paths: ['isCustomCategory'],
      operator: '$nin',
    },
  }),
  index);

/**
 * @api {get} /categories/:id Retrieve category
 * @apiName RetrieveCategory
 * @apiGroup Category
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Object} category Category's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Category not found.
 * @apiError 401 user access only.
 */

router.get('/slug/:id',
  token({ required: true }),
  showBySlug);

router.get('/:id',
  token({ required: true }),
  show);

/**
 * @api {put} /categories/:id Update category
 * @apiName UpdateCategory
 * @apiGroup Category
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam name Category's name.
 * @apiParam subcategories Category's subcategories.
 * @apiSuccess {Object} category Category's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Category not found.
 * @apiError 401 admin access only.
 */
router.put('/:id',
  token({ required: true, roles: ['admin'] }),
  body({
    name, media, sortOrder, isCustomCategory, opentriviadb_categories, active, color,
  }),
  update);

/**
 * @api {delete} /categories/:id Delete category
 * @apiName DeleteCategory
 * @apiGroup Category
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Category not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy);

export default router;
