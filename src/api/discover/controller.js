import OpenTriviaAPI from 'opentdb-api';
import mongoose from 'mongoose';
import e from 'express';
import jService from 'jservice-node';
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
    const error = opentdbError.toString().replace('Error:', '').split(':');
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
  .then((token) => {
    User.findById(user.id)
      .then(notFound(res))
      .then((userObj) => (userObj ? Object.assign(userObj,
        {
          opentdb_blacklisted: [],
        }).save() : null));
    return token;
  })
  .then((result) => res.status(200).json(result))
  .catch((err) => {
    const error = parseError(err.message);
    return res.status(error.status).send(error);
  });

export const getJServiceQuestions = ({ querymen: { query } }, res) => (
  jService.random(query.count, (error, response, clues) => {
    if (error) {
      return res.status(error.status).send(error);
    }
    if (!error && response.statusCode === 200) {
      const results = clues.map((question) => ({
        difficulty: question.value,
        question: question.question,
        correct_answer: question.answer,
        incorrect_answers: [],
        tags: [question.category.title],
      }));
      return res.status(200).json(results);
    }
    return res.status(204);
  })
);

export const getBalancedQuestions = ({ querymen: { query, cursor }, user }, res) => (
  checkToken(user, res)
    .then((newToken) => {
      if (newToken) { // token has been refreshed, save in the db
        User.findById(user.id)
          .then(notFound(res))
          .then((userObj) => (userObj ? Object.assign(userObj,
            {
              opentdb_token: newToken,
            }).save() : null));
        return verify(newToken);
      }
      return verify(user.opentdb_token); // otherwise, just verify the existing token
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
        let opentdbCategories = category.opentriviadb_categories; // get the linked otdb cats
        if (user.opentdb_blacklisted && user.opentdb_blacklisted.length) {
          opentdbCategories = opentdbCategories
            .filter((categoryId) => !user.opentdb_blacklisted.includes(categoryId)); // filter out blacklisted ones
        }
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
      return Promise.allSettled(promises)
        .then((otdbQueries) => {
          const blacklisted = otdbQueries
            .filter((otdbQuery) => otdbQuery.status === 'rejected')
            .map((otdbQuery, idx) => options[idx].otdbCatId);
          if (blacklisted && blacklisted.length) {
            User.findById(user.id) // update user model with blacklisted cats
              .then((userObj) => (userObj ? Object.assign(userObj, { opentdb_blacklisted: blacklisted }).save() : null));
          }

          const allFailed = otdbQueries.every((otdbQuery) => otdbQuery.status === 'rejected');
          if (allFailed) {
            console.log('all queries failed');
            const error = parseError(otdbQueries[0].reason);
            return res.status(error.status).send(error);
          }
          return otdbQueries
            .filter((otdbQuery) => otdbQuery.status === 'fulfilled' && otdbQuery.value)
            .map((otdbQuery) => otdbQuery.value);
        })
        .then((questions) => (questions && questions.length) && [].concat(...questions).map((question) => question && ({
          ...question,
          tags: question.category.split(/[&:]/).map((tag) => tag.toLowerCase().trim()),
          category: query.category, // add the category ID so it can be saved to the db
        }))
          .sort(() => 0.5 - Math.random()));
    })
    .then((trivia) => res.status(200).json(trivia))
    .catch((err) => {
      const error = parseError(err.message);
      return res.status(error.status).send(error);
    }));

// 9 General Knowledge
// 10 Entertainment: Books
// 11 Entertainment: Film
// 12 Entertainment: Music
// 13 Entertainment: Musicals & Theatres
// 14 Entertainment: Television
// 15 Entertainment: Video Games
// 16 Entertainment: Board Games
// 17 Science & Nature
// 18 Science: Computers
// 19 Science: Mathematics
// 20 Mythology
// 21 Sports
// 22 Geography
// 23 History
// 24 Politics
// 25 Art
// 26 Celebrities
// 27 Animals
// 28 Vehicles
// 29 Entertainment: Comics
// 30 Science: Gadgets
// 31 Entertainment: Japanese Anime & Manga
// 32 Entertainment: Cartoon & Animations
