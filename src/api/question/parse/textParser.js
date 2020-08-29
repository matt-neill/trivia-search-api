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
    const notes = question.split(/http:\/\/|https:\/\//);

    return ({
      id: `${category.replace(/ /g, '').replace(/&/g, '+')}-${idx+1}`,
      question: notes.length > 1 ? notes[0].replace(':', ' ').trim() : question,
      answer,
      category: textCategories.includes(category) ? getCategory(idx, category) : category,
      notes: notes.length > 1 ? notes[1] : null,
    })
  }).get();
}

export default textParser;