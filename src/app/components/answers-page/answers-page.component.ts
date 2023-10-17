import { Component } from '@angular/core';
import { FORM_BUILDER_ROUTE } from '../../routes';
import { AnswersService } from '../../services/answers.service';
import { Observable } from 'rxjs';
import { AnswerInterface } from '../../types/answers.interface';

@Component({
  selector: 'app-answers-page',
  templateUrl: './answers-page.component.html',
  styleUrls: ['./answers-page.component.scss'],
})
export class AnswersPageComponent {
  public readonly BACK_TO_FORM = 'Back to Forms Builder';
  public readonly TITLE = 'Your answers';
  public readonly QUESTION = 'Question';
  public readonly ANSWER = 'Answer';
  public readonly FORM_BUILDER_ROUTE = FORM_BUILDER_ROUTE;
  protected readonly Array = Array;
  public answers$: Observable<AnswerInterface[][]> =
    this.answersService.answers$.asObservable();

  constructor(private answersService: AnswersService) {}
}
