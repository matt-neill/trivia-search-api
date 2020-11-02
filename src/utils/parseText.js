// import YouTubeAPI from 'youtube-node';
// import getVideoId from './youtube';

// const YouTube = new YouTubeAPI();

// const getOptions = (questionFull) => {
//   const options = questionFull.split('a)');
//   // console.log(questionFull);

//   if (options.length > 1) {
//     return options[1].split(/b\)|c\)|d\)/).map((str) => str.replace(/\t/, '').trim());
//   }
//   return [];
// };

// options = options.length > 1 ? options[1].split(/b\)|c\)|d\)/).map((str) => str.replace(/\t/, '').trim()) : [];
// return options;

const parseText = (questionFull, questionType) => {
  // console.log()
  const questionText = questionFull.substr(0, questionFull.lastIndexOf('('));
  const lastBrackets = questionFull.match(/\(([^)]*)\)[^(]*$/);
  let question = questionText && questionText.length ? questionText.trim() : questionFull;
  const answer = lastBrackets && lastBrackets.length ? lastBrackets[1].trim() : null;
  // console.log(questionType);

  // let options = [];
  // if (questionType === 'mc') {
  //   options = getOptions(questionFull);
  // }

  // const getOptions = questionFull.split('a)');
  // const getOptions = mcOptions();
  // const options = getOptions.length > 1 ? getOptions[1].split(/b\)|c\)|d\)/).map((str) => str.replace(/\t/, '').trim()) : [];
  
  // const options = getOptions(questionFull);

  const mediaArr = question.match(/\bhttps?:\/\/\S+/gi);
  let media = {};

  // const promises = [];

  if (mediaArr && mediaArr.length) {
    question = question.replace(mediaArr[0], '').replace(/:([^:]*)$/, '').trim();
    media = {
      name: mediaArr[0],
      url: mediaArr[0],
      source: 'youtube',
    };
  }

  //   const videoId = getVideoId(mediaArr[0]);

  //   YouTube.setKey(process.env.YOUTUBE_KEY);
  //   const p = YouTube.getById(videoId, (error, result) => {
  //     if (error) {
  //       console.log(error);
  //       return false;
  //     }
  //     if (result && result.items[0]) {
  //       const {
  //         title,
  //         channelTitle,
  //         thumbnails,
  //       } = result.items[0].snippet;

  //       media = {
  //         name: title,
  //         author: channelTitle,
  //         url: mediaArr[0],
  //         source: 'youtube',
  //         image: thumbnails.default.url,
  //       };
  //       return media;
  //     }
  //     return false;
  //   });
  //   promises.push(p);
  // }

  // return Promise.all(promises).then(() => ({
  //   question,
  //   answer,
  //   options,
  //   media,
  //   notes: null,
  // }));

  return {
    question,
    answer,
    // options,
    media,
    notes: null,
  };
};

export default parseText;
