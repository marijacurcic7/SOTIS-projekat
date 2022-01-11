import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// storage
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { USE_EMULATOR as USE_STORAGE_EMULATOR } from '@angular/fire/compat/storage';
//firestore
import { AngularFireModule } from '@angular/fire/compat'
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/compat/firestore';
//cloud functions
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/compat/functions';
import { environment } from 'src/environments/environment';
//auth
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/compat/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './components/material.module';

/* 
This function is necessary to properly load logged in user after page refresh.
Otherwise, user will be logged out.
There is a bug in angularfire which is fixed by delaying auth emulator.
Use this function only in development environment!
*/
export function initializeApp1(afa: AngularFireAuth) {
  return () => {
    if (environment.production) return Promise.resolve()
    else return afa.useEmulator(`http://localhost:8083`);
  };
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [
    {
      provide: USE_STORAGE_EMULATOR,
      useValue: environment.production ? undefined : ['localhost', 8084]
    },
    {
      provide: USE_FIRESTORE_EMULATOR,
      useValue: environment.production ? undefined : ['localhost', 8080]
    },
    {
      provide: USE_FUNCTIONS_EMULATOR,
      useValue: environment.production ? undefined : ['localhost', 8082]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp1,
      deps: [AngularFireAuth],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
