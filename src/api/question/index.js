import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy, upload, createMultiple, parseMultiple } from './controller'
import { schema } from './model'
export Question, { schema } from './model'

import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, path.resolve('./uploads')),
  filename: (req, file, callback) => {
    const name = `TEST–${Date.now()}${path.extname(file.originalname)}`;
    return callback(null, name);
  }
});
const uploadFile = multer({ storage });

const roles = [
  'admin',
  'user'
];
const authenticationEnabled = true;

const router = new Router()
const { question, answer, options, media, notes, tags, category, custom_category, source } = schema.tree

/**
 * @api {post} /questions/upload Upload sheet of questions
 * @apiName UploadQuestions
 * @apiGroup Question
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam file `.docx` file to upload. // TODO: VALIDATION
 * @apiSuccess {Object} question Question's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Question not found.
 * @apiError 401 admin access only.
 */
router.post('/upload',
  token({ required: authenticationEnabled, roles }),
  uploadFile.single('file'),
  upload);



/**
 * @api {post} /questions/multiple Create multiple questions
 * @apiName CreateQuestions
 * @apiGroup Question
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam question Question's name.
 * @apiParam answer Question's answer.
 * @apiParam options Question's options.
 * @apiParam media Question's media.
 * @apiParam notes Question's notes.
 * @apiParam tags Question's tags.
 * @apiParam custom_category Question's custom_category.
 * @apiParam source Question's source.
 * @apiSuccess {Object} question Question's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Question not found.
 * @apiError 401 admin access only.
 */
router.post('/multiple',
  token({ required: authenticationEnabled, roles }),
  createMultiple)


/**
 * @api {post} /questions/parse Parse questions
 * @apiName ParseQuestions
 * @apiGroup Question
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam text.
 * @apiParam type.
 * @apiSuccess {Object} question Question's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 admin access only.
 */
router.post('/parse',
  token({ required: authenticationEnabled, roles }),
  parseMultiple)




/**
 * @api {post} /questions Create question
 * @apiName CreateQuestion
 * @apiGroup Question
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam question Question's name.
 * @apiParam answer Question's answer.
 * @apiParam options Question's options.
 * @apiParam media Question's media.
 * @apiParam notes Question's notes.
 * @apiParam tags Question's tags.
 * @apiParam custom_category Question's custom_category.
 * @apiParam source Question's source.
 * @apiSuccess {Object} question Question's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Question not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: authenticationEnabled, roles }),
  body({ question, answer, options, media, notes, tags, category, custom_category, source }),
  create)


/**
 * @api {get} /questions Retrieve questions
 * @apiName RetrieveQuestions
 * @apiGroup Question
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of questions.
 * @apiSuccess {Object[]} rows List of questions.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 admin access only.
 */
router.get('/',
  token({ required: authenticationEnabled, roles }),
  query({
    category_ne: {
      type: [String],
      paths: ['category'],
      operator: '$nin'
    }
  }),
  index)

/**
 * @api {get} /questions/:id Retrieve question
 * @apiName RetrieveQuestion
 * @apiGroup Question
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess {Object} question Question's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Question not found.
 * @apiError 401 admin access only.
 */
router.get('/:id',
  token({ required: authenticationEnabled, roles }),
  show)

/**
 * @api {put} /questions/:id Update question
 * @apiName UpdateQuestion
 * @apiGroup Question
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam question Question's name.
 * @apiParam answer Question's answer.
 * @apiParam options Question's options.
 * @apiParam media Question's media.
 * @apiParam notes Question's notes.
 * @apiParam tags Question's tags.
 * @apiParam custom_category Question's custom_category.
 * @apiParam source Question's source.
 * @apiSuccess {Object} question Question's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Question not found.
 * @apiError 401 admin access only.
 */
router.patch('/:id',
  token({ required: authenticationEnabled, roles }),
  body({ question, answer, options, media, notes, tags, category, custom_category, source }),
  update)

/**
 * @api {delete} /questions/:id Delete question
 * @apiName DeleteQuestion
 * @apiGroup Question
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Question not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: authenticationEnabled, roles }),
  destroy)

export default router