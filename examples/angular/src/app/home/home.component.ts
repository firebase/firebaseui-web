/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AsyncPipe } from "@angular/common";
import { UserService } from "../services/user.service";
import { UnauthenticatedAppComponent } from "../app.component";
import { AuthenticatedAppComponent } from "../app.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, AsyncPipe, UnauthenticatedAppComponent, AuthenticatedAppComponent],
  template: `
    @if (user$ | async; as user) {
      <app-authenticated [user]="user" />
    } @else {
      <app-unauthenticated />
    }
  `,
})
export class HomeComponent {
  private userService = inject(UserService);
  user$ = this.userService.getUser();
}
