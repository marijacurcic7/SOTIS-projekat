# Initialize App

## Initialize angular
`ng new app`

## Add official angularfire
Position into created angular project with `cd app` then `ng add @angular/fire`. 
If prompted  What features would you like to setup? - select none and finish process.

## Add firebase
`firebase init`
Be sure to add Firestore in Firebase console.

# Run App
## Run angular
`cd app`

`ng serve --o` - start local angular server

## Run firebase locally
`cd app`

`npx tsc --watch` - must compile functions first

`firebase emulators:start` - start local firebase server

`firebase emulators:start --import ../testdata` - start local firebase server with imported test data

`firebase emulators:export ../testdata` - export testdata

Or run scripts.