import mammoth from 'mammoth';
import cheerio from 'cheerio';
import textParser from './textParser';
import mcParser from './mcParser';
import titleCase from '../../../utils/titleCase';

function getQuestions($, sectionQuestions, category){
  if (category.toUpperCase() === 'MULTIPLE CHOICE') {
    return mcParser($, sectionQuestions, category);
  }
  return textParser($, sectionQuestions, category);
};

const parseFile = (path) => new Promise((resolve, reject) => {
  if (!path) {
    reject('No path specified');
  }
  mammoth.convertToHtml({ path })
    .then(function(result){
      const html = result.value; // The generated HTML
      const $ = cheerio.load(html);
      let roundNumber = 1;
      const questionsObj = $('strong').map((idx, heading) => {
        const sectionTitle = $(heading).text();
        const category = titleCase(sectionTitle.substring(
          sectionTitle.lastIndexOf('–') + 1, 
          sectionTitle.lastIndexOf('\t')
        ).trim());

        if (category.length) {
          const currentSection = $(heading).parent();
          const sectionQuestions = currentSection.nextAll().html();
          const roundQuestions = getQuestions($, sectionQuestions, category);
          roundNumber++;
          return roundQuestions;
        }
      }).get();
      resolve(questionsObj);
    })
    .done();
});


  
  export default parseFile;