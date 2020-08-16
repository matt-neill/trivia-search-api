const mcParser = ($, sectionQuestions, category) => {
  let questionId = 1;
  return $(sectionQuestions).map((idx, li) => {
    const questionFull = $(li).text().split(/(?=a\))/g); // split at "a)" in question string, but keep delimiter
    const questionSection = questionFull && questionFull.length ? questionFull[0] : null;
    const optionsSection = questionFull && questionFull.length ? questionFull[1] : null;
    if (questionSection && questionSection.length) {
      const questionText = questionSection.substr(0, questionSection.lastIndexOf('('));
      const lastBrackets = questionSection.match(/\(([^)]*)\)[^(]*$/);
      const question = questionText && questionText.length ? questionText.trim() : questionSection;
      const answer = lastBrackets && lastBrackets.length ? lastBrackets[1].trim() : null;
      const options = optionsSection && optionsSection.length ?
        optionsSection.split('\t').map((opt, idx) => opt.trim()).filter((opt) => opt.length > 0) : [];

      questionId++;
      return {
        id: `${category.replace(/ /g, '')}-${questionId}`,
        question,
        answer,
        category,
        options,
      };
    }
  }).get();
}

export default mcParser;