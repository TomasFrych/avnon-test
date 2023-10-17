import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AnswerInterface} from "../types/answers.interface";

@Injectable({
  providedIn: 'root'
})
export class AnswersService implements OnDestroy {
  public answers$: BehaviorSubject<AnswerInterface[][]> = new BehaviorSubject<AnswerInterface[][]>([]);

  public ngOnDestroy(): void {
    this.answers$.complete();
  }
}
