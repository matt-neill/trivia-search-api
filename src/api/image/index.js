import { Router } from 'express';
import { middleware as query } from 'querymen';
import { middleware as body } from 'bodymen';
import path from 'path';
import multer from 'multer';
import { token } from '../../services/passport';

import {
  create, index, show, destroy,
} from './controller';
import { schema } from './model';
export Image, { schema } from './model';

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, path.resolve('./uploads')),
  // filename: (req, file, callback) => {
  //   const name = `${file.originalname}${path.extname(file.originalname)}`;
  //   return callback(null, name);
  // },
});
const uploadFile = multer({ storage });

const router = new Router();
const {
  public_id, version, signature, width, height, format, resource_type, url, secure_url, name,
} = schema.tree;

/**
 * @api {post} /images Create image
 * @apiName CreateImage
 * @apiGroup Image
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam public_id Image's public_id.
 * @apiParam version Image's version.
 * @apiParam signature Image's signature.
 * @apiParam width Image's width.
 * @apiParam height Image's height.
 * @apiParam format Image's format.
 * @apiParam resource_type Image's resource_type.
 * @apiParam url Image's url.
 * @apiParam secure_url Image's secure_url.
 * @apiSuccess {Object} image Image's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Image not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  uploadFile.single('file'),
  create);

/**
 * @api {get} /images Retrieve images
 * @apiName RetrieveImages
 * @apiGroup Image
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Object[]} images List of images.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index);

/**
 * @api {get} /images/:id Retrieve image
 * @apiName RetrieveImage
 * @apiGroup Image
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Object} image Image's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Image not found.
 * @apiError 401 user access only.
 */
router.get('/:id',
  token({ required: true }),
  show);

/**
 * @api {delete} /images/:id Delete image
 * @apiName DeleteImage
 * @apiGroup Image
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Image not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  token({ required: true }),
  destroy);

export default router;
