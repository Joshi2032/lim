import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconButtonComponent } from '../icon-button/icon-button.component';

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
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
  isSubmitting: boolean = false;

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
      this.isSubmitting = false;
      this.updateForm();
    }
  }

  private initializeForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleId: ['', [Validators.required]],
      phone: [''] // Sin validadores - es opcional
    });

    // DEBUG: Suscribirse a cambios de valor para ver qué pasa
    this.userForm.valueChanges.subscribe(value => {
      console.log('📝 Form value changed:', value);
      console.log('📊 Form valid:', this.userForm.valid);
      console.log('🔍 Form errors:', this.getFormErrors());
    });

    // DEBUG: Verificar estado de cada control
    this.userForm.statusChanges.subscribe(status => {
      console.log('🔄 Form status changed:', status);
      this.debugFormControls();
    });
  }

  private debugFormControls() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      console.log(`  - ${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched
      });
    });
  }

  private updateForm() {
    if (this.user && this.isEditMode) {
      this.userForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        roleId: this.user.roleId,
        phone: this.user.phone || ''
      });

      const passwordControl = this.userForm.get('password');
      if (passwordControl) {
        passwordControl.clearValidators();
        passwordControl.updateValueAndValidity();
      }
    } else {
      this.userForm.reset({
        name: '',
        email: '',
        password: '',
        roleId: '',
        phone: ''
      });

      const passwordControl = this.userForm.get('password');
      if (passwordControl) {
        passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
        passwordControl.updateValueAndValidity();
      }
    }

    console.log('🔄 Form updated:', {
      isEditMode: this.isEditMode,
      formValue: this.userForm.value,
      formValid: this.userForm.valid
    });
  }

  private getFormValue(field: string): string {
    return this.userForm.get(field)?.value || '';
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    console.log('🚀 Save button clicked!');
    console.log('📊 Form status:', {
      valid: this.userForm.valid,
      invalid: this.userForm.invalid,
      isSubmitting: this.isSubmitting,
      errors: this.getFormErrors()
    });

    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });

    if (this.userForm.invalid) {
      console.log('❌ Form is invalid, cannot submit');
      return;
    }

    if (this.isSubmitting) {
      console.log('⏳ Already submitting, please wait');
      return;
    }

    this.isSubmitting = true;

    const formData: UserFormData = {
      name: this.getFormValue('name'),
      email: this.getFormValue('email'),
      password: this.getFormValue('password') || undefined,
      roleId: this.getFormValue('roleId'),
      phone: this.getFormValue('phone') || undefined
    };

    console.log('✅ Emitting save event with data:', formData);
    this.save.emit(formData);
  }

  get isFormValid(): boolean {
    const valid = this.userForm.valid && !this.isSubmitting;
    console.log('🔍 isFormValid getter called:', {
      formValid: this.userForm.valid,
      isSubmitting: this.isSubmitting,
      result: valid
    });
    return valid;
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
