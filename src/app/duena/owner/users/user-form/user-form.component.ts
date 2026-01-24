import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserEmployee, RoleStat } from '../users.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() user: UserEmployee | null = null; // null = crear, con valor = editar
  @Input() roleStats: RoleStat[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ name: string; email: string; password: string; roleId: string }>();

  userForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.isEditMode = !!this.user;
      this.updateForm();
    }
  }

  initializeForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      roleId: ['', [Validators.required]]
    });
  }

  updateForm() {
    if (this.user) {
      this.userForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        roleId: this.user.roleId,
        password: ''
      });
      // En modo edición, la contraseña es opcional
      this.userForm.get('password')?.clearAsyncValidators();
      this.userForm.get('password')?.setValidators([]);
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.reset();
      // En modo creación, la contraseña es requerida
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.userForm.invalid) return;

    this.save.emit({
      name: this.userForm.get('name')?.value,
      email: this.userForm.get('email')?.value,
      password: this.userForm.get('password')?.value,
      roleId: this.userForm.get('roleId')?.value
    });
  }

  getTitle(): string {
    return this.isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario';
  }

  getButtonText(): string {
    return this.isEditMode ? 'Guardar Cambios' : 'Crear Usuario';
  }

  getPasswordLabel(): string {
    return this.isEditMode
      ? 'Contraseña (dejar vacío para no cambiar)'
      : 'Contraseña';
  }

  getPasswordPlaceholder(): string {
    return this.isEditMode
      ? 'Nueva contraseña (opcional)'
      : 'Mínimo 6 caracteres';
  }
}
