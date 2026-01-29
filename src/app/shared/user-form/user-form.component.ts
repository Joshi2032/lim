import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconButtonComponent } from '../icon-button/icon-button.component';

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  roleId: string;
  phone?: string;
}

export interface UserBase {
  id?: string;
  name: string;
  email: string;
  roleId: string;
  phone?: string;
}

export interface RoleOption {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconButtonComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() user: UserBase | null = null;
  @Input() roleOptions: RoleOption[] = [];
  @Input() title: string = '';
  @Input() submitButtonText: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UserFormData>();

  userForm!: FormGroup;
  isEditMode: boolean = false;

  private defaultTitles = {
    create: 'Crear Nuevo Usuario',
    edit: 'Editar Usuario'
  };

  private defaultButtonTexts = {
    create: 'Crear Usuario',
    edit: 'Guardar Cambios'
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue) {
      this.isEditMode = !!this.user?.id;
      this.updateForm();
    }
  }

  private initializeForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      roleId: ['', [Validators.required]],
      phone: ['']
    });
  }

  private updateForm() {
    if (this.user) {
      this.userForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        roleId: this.user.roleId,
        password: ''
      });

      const passwordControl = this.userForm.get('password');
      passwordControl?.setValidators([]);
      passwordControl?.updateValueAndValidity();
    } else {
      this.userForm.reset();

      const passwordControl = this.userForm.get('password');
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      passwordControl?.updateValueAndValidity();
    }
  }

  private getFormValue(field: string): string {
    return this.userForm.get(field)?.value || '';
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.userForm.invalid) return;

    this.save.emit({
      name: this.getFormValue('name'),
      email: this.getFormValue('email'),
      password: this.getFormValue('password'),
      roleId: this.getFormValue('roleId')
    });
  }

  getTitle(): string {
    return this.title || (this.isEditMode ? this.defaultTitles.edit : this.defaultTitles.create);
  }

  getButtonText(): string {
    return this.submitButtonText || (this.isEditMode ? this.defaultButtonTexts.edit : this.defaultButtonTexts.create);
  }

  getPasswordLabel(): string {
    return this.isEditMode ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña';
  }

  getPasswordPlaceholder(): string {
    return this.isEditMode ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres';
  }
}
