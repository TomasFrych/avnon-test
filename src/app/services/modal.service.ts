import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModalService implements OnDestroy {
  public readonly isModalOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  public ngOnDestroy(): void {
    this.isModalOpen$.next(false);
    this.isModalOpen$.complete();
  }

  public openModal(): void {
    this.isModalOpen$.next(true);
  }

  public closeModal(): void {
    this.isModalOpen$.next(false);
  }
}
