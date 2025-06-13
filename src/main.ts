import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import { provideHttpClient } from '@angular/common/http'; // <--- Import this!


// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient() // <--- Add this to the providers array!
  ]
}).catch(err => console.error(err));
