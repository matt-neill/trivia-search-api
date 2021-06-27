import fs from 'fs';
import { json } from 'body-parser';
import { success, notFound } from '../../services/response';
import { Question } from '.';
import parseFile from './parse';
import parseText from '../../utils/parseText';
import titleCase from '../../utils/titleCase';

export const create = ({ bodymen: { body }, user }, res, next) => {
  const newQuestion = {
    ...body,
    options: body.options.length > 1 ? body.options.map((option) => (Array.isArray(option) ? option.join(', ') : option)) : [],
  };

  return Question.create({ ...newQuestion, createdBy: user })
    .then((question) => question.view(true))
    .then(success(res, 201))
    .catch(next);
};

export const createMultiple = ({ body, user }, res, next) => {
  const p = [];
  const { questions, createdAt } = body;
  questions.map((question) => p.push(
    Question.create({
      ...question,
      createdBy: user._id,
      lastUsed: createdAt || new Date(),
    }),
  ));
  return Promise.all(p)
    .then(success(res, 201))
    .catch(next);
};

export const index = ({ querymen: { query, select, cursor }, user }, res, next) => {
  if (query.category && query.category.$in) { // fixes querymen bug where multiple fields change the operator to "$in"
    delete Object.assign(query, { category: { $nin: query.category.$in } })[query.category.$in];
  }

  if (user.role === 'user') {
    query.createdBy = user;
  }

  return Question.count(query)
    .then((count) => Question.find(query, select, cursor)
      .populate('createdBy', 'name picture')
      .populate('category', 'name id slug')
      .then((questions) => ({
        count,
        rows: questions.map((question) => question.view()),
      })))
    .then(success(res))
    .catch(next);
};

export const show = ({ params, user }, res, next) => {
  const query = { _id: params.id };
  if (user.role === 'user') {
    query.createdBy = user;
  }

  return Question.findOne(query)
    .populate('createdBy', 'name picture')
    .populate('category', 'name id')
    .then(notFound(res))
    .then((question) => (question ? question.view() : null))
    .then(success(res))
    .catch(next);
};

export const update = ({ bodymen: { body }, params, user }, res, next) => {
  const query = { _id: params.id };
  if (user.role === 'user') {
    query.createdBy = user;
  }

  const updatedQuestion = {
    ...body,
    options: body.options.length ? body.options.map((option) => (Array.isArray(option) ? option.join(', ') : option)) : [],
    updatedAt: new Date(),
  };

  return Question.findOne(query)
    .then(notFound(res))
    .then((question) => (question ? Object.assign(question, updatedQuestion).save() : null))
    .then((question) => (question ? question.view(true) : null))
    .then(success(res))
    .catch(next);
};

export const destroy = ({ params, user }, res, next) => {
  const query = { _id: params.id };
  if (user.role === 'user') {
    query.createdBy = user;
  }

  return Question.findOne(query)
    .then(notFound(res))
    .then((question) => (question ? question.remove() : null))
    .then(success(res, 204))
    .catch(next);
};

export const upload = ({ user, file }, res, next) => {
  parseFile(file.path).then((questions) => {
    fs.unlinkSync(file.path);
    return res.json({
      questions,
    });
  });
};

export const parseMultiple = (req, res, next) => {
  const {
    questions,
    type,
    category,
  } = req.body;

  // const categories = category.split('&').map((cat) => titleCase(cat).trim());
  let questionsSplit = questions.split('\n');
  let options = [];

  if (type === 'mc') {
    const tempQuestions = [];

    options = questionsSplit
      .filter((question) => question && question.length > 0) // remove blank lines
      .reduce((resultArray, item, questionIdx) => {
        const optionArray = resultArray;
        const chunkIndex = Math.floor(questionIdx / 5);
        if (!optionArray[chunkIndex]) {
          optionArray[chunkIndex] = []; // start a new chunk of 5
        }
        optionArray[chunkIndex].push(item);
        return optionArray;
      }, [])
      .map((optionsArr) => {
        const question = optionsArr.splice(0, 1);
        tempQuestions.push(question[0]);
        const alpha = ['a)', 'b)', 'c)', 'd)'];
        return optionsArr.map((option, optIdx) => `${alpha[optIdx]} ${option}`);
      });
    questionsSplit = tempQuestions;
  }

  let returnQuestions = [];
  returnQuestions = questionsSplit.map((question, idx) => {
    // const isFirstHalf = idx >= Math.ceil(questionsSplit.length / 2) ? 1 : 0; // determine if question is in first half of array
    // const cat = type !== 'audio' ? categories[categories.length > 1 ? isFirstHalf : 0] : 'Audio Clip'; // set category name based off of array position

    // return parseText(question).then((questionObj) => {
    //   console.log(questionObj);
    //   const questionObj = {
    //     ...parseText(question),
    //     id: idx,
    //     category: cat,
    //   };
    //   return questionObj;
    // })

    const questionObj = {
      ...parseText(question, type),
      options: options[idx],
      id: idx,
      category,
    };
    return questionObj;
  });
  return res.json(returnQuestions);
};
