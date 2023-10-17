import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormPassData } from '../../types/formPassData';
import { AnswersService } from '../../services/answers.service';
import { AnswerInterface } from '../../types/answers.interface';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

interface QuestionInterface {
  question: string;
  checkboxes?: string[];
  own_answer: boolean;
  is_required: boolean;
}

@Component({
  selector: 'app-form-page',
  templateUrl: './form-page.component.html',
  styleUrls: ['./form-page.component.scss'],
})
export class FormPageComponent implements OnInit, OnDestroy {
  public readonly ADD_QUESTION = 'Add Question';
  public readonly REVIEW_MY_ANSWERS = 'Review my answers';
  public readonly FIELD_IS_REQUIRED = 'This field is required';
  public formPageGroup!: FormGroup;
  public questions: QuestionInterface[] = [];
  private destroy$: Subject<void> = new Subject<void>();
  public isModalOpen = this.modalService.isModalOpen$;

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private answersService: AnswersService,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.formPageGroup = this.fb.group({
      aliases: this.fb.array([]),
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get aliases(): FormArray {
    return this.formPageGroup.get('aliases') as FormArray;
  }

  public openModal(): void {
    this.modalService.openModal();
  }

  public receiveData(data: FormPassData): void {
    if (data.type === 'input') {
      this.questions = [
        ...this.questions,
        {
          question: data.question,
          own_answer: false,
          is_required: data.is_required,
        },
      ];
      this.aliases.push(
        this.fb.control('', data.is_required ? [Validators.required] : []),
      );
    }

    if (data.type === 'checkbox') {
      const arr: string[] = data.own_answer
        ? [...data.aliases, 'Other', 'Your own answer']
        : data.aliases;
      this.aliases.push(
        this.fb.array(
          arr.map((str, index, arr) => {
            if (data.own_answer && index === arr.length - 1)
              return this.fb.control('');
            return this.fb.control(false);
          }),
          (control) => this.fromValidator(control, data),
        ),
      );

      if (data.own_answer) {
        const innerControlArr = this.aliases.at(-1) as FormArray;
        innerControlArr
          .at(-2)
          .valueChanges.pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            if (!data) innerControlArr.at(-1).reset('');
          });
      }

      this.questions = [
        ...this.questions,
        {
          question: data.question,
          checkboxes: arr,
          own_answer: data.own_answer,
          is_required: data.is_required,
        },
      ];
    }
  }

  public fromValidator(
    control: AbstractControl<any, any>,
    data: FormPassData,
  ): { [key: string]: any } | null {
    if (data.is_required) {
      const arrValues: (boolean | string)[] = control.value;
      const isValid = arrValues.some((item, index, arr) => {
        if (data.own_answer) {
          if (arr.length - 2 === index) {
            const ownAnswer = arr[arr.length - 1] as string;
            return item ? item && ownAnswer.trim() : false;
          }

          if (arr.length - 1 === index && typeof item === 'string') {
            return !!item.trim() && arr[arr.length - 2];
          }
        }
        return !!item;
      });
      return isValid ? null : { required: 'This field is required' };
    }
    return null;
  }

  public getCheckboxArray(index: any): FormArray {
    return this.formPageGroup.get('aliases')?.get(String(index)) as FormArray;
  }

  private mapAnswers(arr: (string | string[])[]): AnswerInterface[] {
    return arr.map((value, index, innerArr) => {
      return {
        question: this.questions[index].question,
        answer: Array.isArray(value)
          ? value.map((item, i) => {
              const checkQuestions = this.questions[index]?.checkboxes;
              const isOther =
                this.questions[index]?.own_answer &&
                i === innerArr[0].length - 2;
              if (!checkQuestions?.length) return {};

              return {
                checkbox: checkQuestions[i],
                selected: isOther ? false : value[i],
                own_answer: this.questions[index]?.own_answer,
              };
            })
          : value,
      } as AnswerInterface;
    });
  }

  public onSubmit(): void {
    const arr = this.aliases.value as Array<string | Array<string>>;
    this.formPageGroup.markAllAsTouched();

    if (this.formPageGroup.invalid || !arr.length) return;

    const answers: AnswerInterface[] = this.mapAnswers(arr);
    this.answersService.answers$.next([
      ...this.answersService.answers$.getValue(),
      answers,
    ]);
    this.formPageGroup.reset();
    this.aliases.clear();
    this.router.navigate(['form/answers']);
  }

  public isOwnAnswerInput(
    controls: AbstractControl<any>[],
    inIndex: number,
    questions: QuestionInterface[],
    i: number,
  ): boolean {
    return controls.length - 1 === inIndex && questions[i].own_answer;
  }

  public isInputInvalid(control: AbstractControl<any>): boolean {
    return control.invalid && (control.touched || control.dirty);
  }
}
