import OpenTriviaAPI from 'opentdb-api';
import { sign, verify } from '../../services/jwt';
import { notFound } from '../../services/response';
import { User } from '../user';
import { Category } from '../category';

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
      const category = categoryObj.view();
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
