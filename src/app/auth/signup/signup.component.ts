import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { Subscription } from "rxjs";

import { AuthService } from "../auth.service";

@Component({
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  signUpForm: FormGroup;
  private authStatusSub: Subscription;

  constructor(
    public authService: AuthService,
    private formBuilder: FormBuilder
    ) {}

  ngOnInit() {
    this.initSignUpForm();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }
  initSignUpForm() {
    this.signUpForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  get f() { return this.signUpForm.controls; }

  onSignup() {
    if (this.signUpForm.invalid) {
      return;
    }
    this.isLoading = true;
    console.log(this.signUpForm.value);
    this.authService.createUser(this.signUpForm.value.email, this.signUpForm.value.password, this.signUpForm.value.confirmPassword);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
