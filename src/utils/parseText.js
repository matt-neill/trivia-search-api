const parseText = (questionFull) => {
  const questionText = questionFull.substr(0, questionFull.lastIndexOf('('));
  const lastBrackets = questionFull.match(/\(([^)]*)\)[^(]*$/);
  const question = questionText && questionText.length ? questionText.trim() : questionFull;
  const answer = lastBrackets && lastBrackets.length ? lastBrackets[1].trim() : null;
  const getOptions = questionFull.split('a)');
  const options = getOptions.length > 1 ? getOptions[1].split(/b\)|c\)|d\)/).map((str) => str.replace(/\t/, '').trim()) : [];

  return {
    question,
    answer,
    options,
  }
};

export default parseText;