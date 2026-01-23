import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  showPassword = false;

  constructor(private router: Router) {}

  onLogin(event: Event) {
    event.preventDefault();
    // Aquí puedes agregar validación de credenciales
    // Por ahora solo navegamos al menú
    this.router.navigate(['/menu']);
  }
}
