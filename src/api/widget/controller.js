import _ from 'lodash';
import { success, notFound } from '../../services/response';
import { Widget } from '.';

export const create = ({ user, bodymen: { body } }, res, next) => {
  const query = { createdBy: user };
  const update = { ...body, createdBy: user };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  return Widget.findOneAndUpdate(query, update, options)
    .then((widget) => widget.view(true))
    .then(success(res, 201))
    .catch(next);
};

export const show = ({ params }, res, next) => Widget.findOne({ createdBy: params.userId })
  .populate('createdBy')
  .then(notFound(res))
  .then((widget) => (widget ? widget.view() : null))
  .then(success(res))
  .catch(next);

export const destroy = ({ params }, res, next) => Widget.findById(params.id)
  .then(notFound(res))
  .then((widget) => (widget ? widget.remove() : null))
  .then(success(res, 204))
  .catch(next);
