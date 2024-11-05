import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MetamaskComponent } from './metamask/metamask.component';
import { InicioComponent } from './inicio/inicio.component';
import { FloatingLogoComponent } from './floating-logo/floating-logo.component';

@NgModule({
  declarations: [
    AppComponent,
    MetamaskComponent,
    InicioComponent,
    FloatingLogoComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
