import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { Subject, takeUntil } from 'rxjs';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { text } from './text';
import { FormPassData } from '../../types/formPassData';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Output() receiveData: EventEmitter<FormPassData> =
    new EventEmitter<FormPassData>();
  public readonly text = text;
  public readonly FIVE = 5;
  public readonly FOUR = 4;
  private destroy$: Subject<void> = new Subject<void>();
  public isModalOpen$ = this.modalService.isModalOpen$;
  public modalForm!: FormGroup;
  public isInput = false;
  public isCheckbox = false;
  public availableCheckboxNumber = 5;

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
  ) {}

  public ngOnInit(): void {
    this.setModal();
    this.ownAnswerInput?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.availableCheckboxNumber = !data ? this.FIVE : this.FOUR;
        if (data && this.aliases.length >= 5) {
          this.aliases.removeAt(this.aliases.length - 1);
        }
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public get aliases(): FormArray {
    return this.modalForm.get('aliases') as FormArray;
  }

  public get questionInput(): AbstractControl | null {
    return this.modalForm.get('question');
  }

  public get ownAnswerInput(): AbstractControl | null {
    return this.modalForm.get('own_answer');
  }

  public addAlias(): void {
    if (
      this.aliases.length >= 5 ||
      (this.aliases.length >= 4 && this.modalForm.get('own_answer')?.value)
    )
      return;
    this.aliases.push(this.fb.control('', [Validators.required]));
  }

  public closeModal(): void {
    this.resetChosenType();
    this.modalForm.reset();
    this.modalForm.get('own_answer')?.enable();
    this.aliases.clear();
    this.modalService.isModalOpen$.next(false);
  }

  private setModal(): void {
    this.modalForm = this.fb.group({
      question: ['', [Validators.required]],
      own_answer: [false],
      is_required: [false],
      aliases: this.fb.array([]),
    });
  }

  public resetChosenType(): void {
    this.isInput = this.isCheckbox = false;
  }

  public onInputSelect(): void {
    this.isInput = true;
    this.modalForm.get('own_answer')?.disable();
  }

  public onCheckboxSelect(): void {
    this.isCheckbox = true;
    this.addAlias();
  }

  public onSubmit(): void {
    this.modalForm.markAllAsTouched();
    if (this.modalForm.invalid || !this.modalForm.get('question')?.value)
      return;

    this.receiveData.emit({
      ...this.modalForm.value,
      type: this.isInput ? 'input' : 'checkbox',
    });
    this.closeModal();
  }
}
