export interface checkboxAnswers {
  selected: boolean | string;
  checkbox: string;
  own_answer: boolean;
}

export interface AnswerInterface {
  question: string;
  answer: string | checkboxAnswers[];
}
