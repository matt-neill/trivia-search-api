const textCategories = [
  'Science & Geography',
  'Pop Culture & History',
  'Sports & Leisure'
]

const getCategory = (idx, fullCategory) => {
  const catSplit = idx <= 3 ? 0 : 1;
  const category = fullCategory.split('&').map((category) => category.trim())[catSplit];
  return category;
}

const textParser = ($, sectionQuestions, category) => {
  return $(sectionQuestions).map((idx, li) => {
    const questionFull = $(li).text();
    const questionText = questionFull.substr(0, questionFull.lastIndexOf('('));
    const lastBrackets = questionFull.match(/\(([^)]*)\)[^(]*$/);
    const question = questionText && questionText.length ? questionText.trim() : questionFull;
    const answer = lastBrackets && lastBrackets.length ? lastBrackets[1].trim() : null;

    return ({
      id: `${category.replace(/ /g, '').replace(/&/g, '+')}-${idx+1}`,
      question: question,
      answer: answer,
      category: textCategories.includes(category) ? getCategory(idx, category) : category,
    })
  }).get();
}

export default textParser;