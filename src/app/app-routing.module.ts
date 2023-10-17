import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FormPageComponent} from "./components/form-page/form-page.component";
import {AnswersPageComponent} from "./components/answers-page/answers-page.component";
import {FORM_ANSWERS_ROUTE, FORM_BUILDER_ROUTE} from "./routes";

const routes: Routes = [
  {
    path: '', redirectTo: FORM_BUILDER_ROUTE, pathMatch: 'full'
  },
  {
    path: FORM_BUILDER_ROUTE, component: FormPageComponent,
  },
  {
    path: FORM_ANSWERS_ROUTE, component: AnswersPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
