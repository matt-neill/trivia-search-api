import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { success, notFound, authorOrAdmin } from '../../services/response';
import { Image } from '.';

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const create = ({ user, file }, res, next) => {
  cloudinary.uploader.upload(file.path, (err, image) => {
    if (image) {
      fs.unlinkSync(file.path);
      Image.create({ ...image, createdBy: user })
        .then((imageDoc) => imageDoc.view())
        .then(success(res, 201))
        .catch(next);
    }
  });
};

export const index = ({ querymen: { query, select, cursor } }, res, next) => Image.find(query, select, cursor)
  .populate('createdBy')
  .then((images) => images.map((image) => image.view()))
  .then(success(res))
  .catch(next);

export const show = ({ params }, res, next) => Image.findById(params.id)
  .populate('createdBy')
  .then(notFound(res))
  .then((image) => (image ? image.view() : null))
  .then(success(res))
  .catch(next);

export const destroy = ({ user, params }, res, next) => Image.findById(params.id)
  .then(notFound(res))
  .then(authorOrAdmin(res, user, 'createdBy'))
  .then((image) => {
    cloudinary.uploader.destroy(image.public_id);
    return image;
  })
  .then((image) => (image ? image.remove() : null))
  .then(success(res, 204))
  .catch(next);
