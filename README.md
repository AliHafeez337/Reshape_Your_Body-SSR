
From Article: https://medium.com/js-dojo/how-i-made-it-easy-to-develop-on-vue-js-with-server-side-rendering-fdeebdd7e8d8


## How to use it

To start environment for local development, use:
```
npm install
npm run dev
```
**If you run it the first time, you'll get error, that server bundle wasn't found. 
It's normal. Just re-run this task.**

To production build, use (assets will be served from `dist` folder):
```
npm run build
```

To run server side, use:
```
npm run start-node
```
(Note, this way isn't for production. 
Better, you should use process manager, like `PM2`)

Application will be available on http://localhost:3000/ 

___
