import { Router } from 'express';
import { middleware as body } from 'bodymen';
import { token } from '../../services/passport';
import { create, show, destroy } from './controller';
import { schema } from './model';

export Widget, { schema } from './model';

const router = new Router();
const {
  questionId, roundName, question, headingFont, questionFont, questionNumber, media,
} = schema.tree;

/**
 * @api {post} /widget Create widget
 * @apiName CreateWidget
 * @apiGroup Widget
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam questionId Widget's questionId.
 * @apiParam roundName Widget's roundName.
 * @apiParam question Widget's question.
 * @apiParam headingFont Widget's headingFont.
 * @apiParam questionFont Widget's questionFont.
 * @apiSuccess {Object} widget Widget's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Widget not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({
    questionId, roundName, question, headingFont, questionFont, questionNumber, media,
  }),
  create);

/**
 * @api {get} /widget/:userId Retrieve widget for given user
 * @apiName RetrieveWidget
 * @apiGroup Widget
 * @apiSuccess {Object} widget Widget's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Widget not found.
 */
router.get('/:userId',
  show);

/**
 * @api {delete} /widget/:id Delete widget
 * @apiName DeleteWidget
 * @apiGroup Widget
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Widget not found.
 */
router.delete('/:id',
  token({ required: true }),
  destroy);

export default router;
