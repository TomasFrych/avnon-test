export interface FormPassData {
  type: 'input' | 'checkbox',
  question: string,
  own_answer: boolean,
  is_required: boolean,
  aliases: string[]
}
