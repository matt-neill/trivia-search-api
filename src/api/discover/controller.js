import OpenTriviaAPI from 'opentdb-api';
import mongoose from 'mongoose';
import e from 'express';
import { sign, verify } from '../../services/jwt';
import { notFound } from '../../services/response';
import { User } from '../user';
import { Category } from '../category';

// const { ObjectId } = Schema.Types;
const { ObjectId } = mongoose;

const getErrorStatus = (code) => {
  switch (code) {
    case 1: return 404;
    case 2: return 400;
    case 3: return 401;
    case 4: return 404;

    default: return 500;
  }
};

const parseError = (opentdbError) => {
  if (opentdbError) {
    const error = opentdbError.split(':');
    const responseCode = parseInt(error[0].replace('Response code', '').trim(), 10); // Response code 4
    const statusText = error[1] ? error[1].trim() : null;

    return {
      status: getErrorStatus(responseCode),
      responseCode,
      statusText,
      opentdbError,
    };
  }
  return false;
};

const getTokenfromJwt = (user) => verify(user.opentdb_token)
  .then((tokenDecoded) => tokenDecoded.id);

const getNewToken = () => OpenTriviaAPI.getToken().then((opentdbToken) => sign(opentdbToken, { expiresIn: '6h' }));

const checkToken = (user) => new Promise((resolve) => {
  if (user.opentdb_token && user.opentdb_token.length) {
    verify(user.opentdb_token)
      .then((tokenDecoded) => {
        const exp = new Date(tokenDecoded.exp * 1000);
        if (exp < new Date()) { // token is expired
          getNewToken().then((token) => {
            resolve(token);
          });
        } else {
          resolve(null);
        }
      })
      .catch(() => (
        getNewToken().then((token) => {
          resolve(token);
        })
      ));
  } else {
    getNewToken().then((token) => {
      resolve(token);
    });
  }
});

const getCategoryTags = (trivia, opentdbCategoryId) => new Promise((resolve) => {
  const catId = parseInt(opentdbCategoryId, 10);
  Category.findOne({ opentriviadb_categories: { $in: catId } })
    .then((categoryObj) => {
      const category = categoryObj && categoryObj.view();
      const formatted = trivia.map((question) => {
        const tags = question.category.split(/[&:]/).map((tag) => tag.toLowerCase().trim());

        // eslint-disable-next-line no-param-reassign
        delete question.category;
        return {
          category,
          tags,
          ...question,
        };
      });
      resolve(formatted);
    });
});

export const index = ({ querymen: { query, cursor }, user }, res, next) => checkToken(user, res)
  .then((newToken) => {
    if (newToken) {
      User.findById(user.id)
        .then(notFound(res))
        .then((userObj) => (userObj ? Object.assign(userObj, { opentdb_token: newToken }).save() : null));
      return verify(newToken);
    }
    return verify(user.opentdb_token);
  })
  .then((decodedToken) => {
    const options = {
      token: decodedToken.id,
      amount: cursor.limit,
      ...query.category && { category: query.category },
      ...query.difficulty && { difficulty: query.difficulty },
      ...query.type && { type: query.type },
    };
    return options;
  })
  .then((options) => OpenTriviaAPI.getTrivia(options))
  .then((trivia) => getCategoryTags(trivia, query.category))
  .then((trivia) => res.status(200).json(trivia))
  .catch((err) => {
    const error = parseError(err.message);
    return res.status(error.status).send(error);
  });

export const getCategories = ({ params }, res, next) => OpenTriviaAPI.getCategories()
  .then((categories) => res.status(200).json(categories));

export const resetToken = ({ user }, res, next) => getTokenfromJwt(user)
  .then((token) => OpenTriviaAPI.resetToken(token))
  .then((result) => res.status(200).json(result))
  .catch((err) => {
    const error = parseError(err.message);
    return res.status(error.status).send(error);
  });

export const getBalancedQuestions = ({ querymen: { query, cursor }, user }, res) => (
  checkToken(user, res)
    .then((newToken) => {
      if (newToken) {
        User.findById(user.id)
          .then(notFound(res))
          .then((userObj) => (userObj ? Object.assign(userObj,
            {
              opentdb_token: newToken,
            }).save() : null));
        return verify(newToken);
      }
      return verify(user.opentdb_token);
    })
    .then((decodedToken) => {
      const options = {
        token: decodedToken.id,
        amount: cursor.limit,
        ...query.category && { category: query.category },
        ...query.difficulty && { difficulty: query.difficulty },
        ...query.type && { type: query.type },
      };
      return options;
    })
    .then((options) => Category.findById(options.category) // get the requested cat from db
      .then((category) => new Promise((resolve) => {
        const opentdbCategories = category.opentriviadb_categories; // get the linked otdb cats
        // generate # of questions requested
        const categories = [...Array(options.amount)].map(() => {

          // get a random cat from linked otdb
          const randomCategory = Math.floor(Math.random() * opentdbCategories.length);
          const opentdbCategoryId = opentdbCategories[randomCategory];
          return {
            otdbCatId: opentdbCategoryId,
            amount: 1,
            token: options.token,
          };
        }).reduce((cat, r) => {
          // count occurances of each category and generate an amount to call the db with
          const {
            amount, otdbCatId,
          } = r;
          cat[otdbCatId] = cat[otdbCatId] || {
            ...r,
            amount: 0,
          };
          cat[otdbCatId].amount += amount;
          return cat;
        }, {});

        resolve(Object.values(categories));
      })))
    .then((options) => {
      const promises = [];
      options.forEach((opt) => {
        // call the open trivia with the amount of each subcategory to get
        const p = OpenTriviaAPI.getTrivia({ ...opt, category: opt.otdbCatId });
        promises.push(p);
      });

      // once api calls are complete, concat array and shuffle it
      return Promise.all(promises).then((questions) => [].concat(...questions).map((question) => ({
        ...question,
        tags: question.category.split(/[&:]/).map((tag) => tag.toLowerCase().trim()),
        category: query.category, // add the category ID so it can be saved to the db
      })).sort(() => 0.5 - Math.random()));
    })
    .then((trivia) => res.status(200).json(trivia))
    .catch((err) => {
      const error = parseError(err.message);
      return res.status(error.status).send(error);
    }));
