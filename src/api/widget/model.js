import mongoose, { Schema } from 'mongoose';

const Font = (fontFamily, color, fontWeight) => ({
  fontFamily, color, fontWeight,
});

const widgetSchema = new Schema({
  questionId: {
    type: String,
    required: true,
  },
  roundName: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  answerVisible: {
    type: Boolean,
    default: false,
  },
  questionNumber: {
    type: Number,
    required: true,
  },
  headingFont: {
    type: Object,
    default: new Font('Rubik', '#828282', 400),
  },
  questionFont: {
    type: Object,
    default: new Font('DIN Condensed', '#333', 700),
  },
  media: {
    type: Schema.ObjectId,
    ref: 'Image',
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

widgetSchema.methods = {
  view(full) {
    const view = {
      // simple view
      id: this.id,
      createdBy: this.createdBy.view(),
      questionId: this.questionId,
      answer: this.answer,
      answerVisible: this.answerVisible,
      roundName: this.roundName,
      question: this.question,
      questionNumber: this.questionNumber,
      headingFont: this.headingFont,
      questionFont: this.questionFont,
      media: this.media && this.media.view(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    return full ? {
      ...view,
      // add properties for a full view
    } : view;
  },
};

const model = mongoose.model('Widget', widgetSchema);

export const { schema } = model;
export default model;
