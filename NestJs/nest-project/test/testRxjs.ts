import { concatMap, forkJoin, from, Observable, of } from 'rxjs';

// 1.
// const observable = new Observable((subscriber) => {
//   subscriber.next('Hello');
//   subscriber.next('RxJS');
//   subscriber.complete();
// });

// observable.subscribe({
//   next: (value) => console.log(value),
//   complete: () => console.log('Completed'),
// });

// 2.
// const observable = of(1, 2, 3, 4, 5, 6);
// observable.subscribe({
//   next: (value) => console.log(value),
//   complete: () => console.log('Completed'),
// });

// 3. from会将数组，字符串等参数展开单个处理， 也可以接受promise参数
// const promise1 = new Promise((resolve) => {
//   setTimeout(() => {
//     resolve('Promise Resolved');
//   }, 1000);
// });

// const observable = from(promise1);
// observable.subscribe({
//   next: (value) => console.log(value),
//   complete: () => console.log('Completed'),
// });

// 4.
const promise1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('hello');
  }, 500);
});

const promise2 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('world');
  }, 2000);
});

const promise3 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('!');
  }, 1500);
});

const promises = [promise1, promise2, promise3];

// 单个执行
// from(promises)
//   .pipe(concatMap((promise) => from(promise)))
//   .subscribe({
//     next: (value) => console.log(value),
//     complete: () => console.log('All promises processed'),
//   });

// 并发
forkJoin(promises).subscribe({
  next: (value) => console.log('ForkJoin result:', value),
  complete: () => console.log('ForkJoin completed'),
});
