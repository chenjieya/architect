
## 1. *RN* 基本介绍

本小节主要包含以下知识点：

- 什么是 *RN*
- *RN* 特点
- 谁在使用 *RN*

### 1.1 什么是 *RN*

*RN* 英文全称 *ReactNative*，是 *Facebook* 于 *2015* 年 *4* 月开源的跨平台移动应用开发框架，也是 *Facebook* 早先所开源的 *JavaScript* 框架 *React* 在原生移动应用平台的衍生产物，目前支持 *iOS* 和安卓两大平台。

*RN* 使用 *Javascript* 和 *React* 中类似于 *html* 的 *JSX*，以及 *css* 来开发移动应用，因此熟悉 *Web* 前端开发的技术人员只需很少的学习就可以快速进入移动应用开发领域。

*RN* 官网：*https://reactnative.dev/*

![image-20220602141555963](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-061556.png)



*RN* 中文网：*https://reactnative.cn/*

![image-20220602141614461](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-061614.png)



### 1.2 *RN* 特点

根据官网的介绍，*RN* 主要有如下的特点：

- 使用 *React* 来创建 *Android* 和 *iOS* 的原生应用
- 预览速度快
- 无缝跨平台

#### 1.2.1 使用 *React* 来创建 *Android* 和 *iOS* 的原生应用

目前来讲，我们的移动端应用主要分为三大类：*WebApp*、*NativeApp* 和 *HybridApp*。



*WebApp* 指的是移动端的 *Web* 浏览器，其实和 *PC* 端的 *Web* 浏览器没有任何区别，只不过 *Web* 浏览器所依附的操作系统不再是 *Windows* 和 *Linux* 了，而是 *iOS* 和 *Android*，*WebApp* 采用的技术主要是，传统的 *HTML、JavaScript、CSS* 等 *Web* 技术栈，当然现在 *HTML5* 也得到了广泛的应用。另外，*WebApp* 所访问的页面内容都是放在服务器端的，本质上就是 *Web* 网页，所以天生就是跨平台的。不能在商店中下载，只能在移动设备浏览器中打开。



*NativeApp* 指的是移动端的原生应用，对于 *Android* 是 *apk*，对于 *iOS* 就是 *ipa*。*NativeApp* 是一种基于手机操作系统（*iOS* 和 *Android*），并使用原生程序编写运行的第三方应用程序。*NativeApp* 的开发，*Android* 使用的语言通常是 Java 或者 *Kotlin*，*iOS* 使用的语言是 *Objective-C* 或者 *Swift*。通常来说，*NativeApp* 可以提供比较好的用户体验以及性能，而且可以方便地操作手机本地资源，可在应用商店内进行下载，以 *app* 的形式打包。



*HybridApp*，俗称混合应用，是介于 *WebApp* 和 *NativeApp* 两者之间的一种 *App* 形式，*HybridApp* 利用了 *WebApp* 和 *NativeApp* 的优点，通过一个原生实现的 *Native Container* 展示 *HTML5* 的页面。更通俗的讲法可以归结为，在原生移动应用中嵌入了 *Webview*，然后通过该 *Webview* 来访问网页。*HybridApp* 具有维护更新简单，用户体验优异以及较好的跨平台特性，是目前主流的移动应用开发模式，可在应用商店内进行下载，以 *app* 的形式打开。



那么，使用 *RN* 所开发的应用是属于哪一类呢？

根据官方的介绍，*RN* 所开发最终产品是一个真正的移动应用，从使用感受上和原生应用相比几乎是无法区分的。

![image-20220602141649879](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-061650.png)



在 *RN* 中所使用的基础 *UI* 组件会映射到原生应用中的对应组件。

![image-20220602141706862](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-061707.png)



#### 1.2.2 预览速度快

传统使用 *Objective-C* 或 *Java* 编写的原生应用，要预览效果，需要先将整个项目编译一次，而这个编译时间是比较耗时的。

*RN* 让你可以快速迭代开发应用。比起传统原生应用漫长的编译过程，现在你可以在瞬间刷新你的应用。开启 *Hot Reloading* 的话，甚至能在保持应用运行状态的情况下热替换新代码！

![image-20220602141803449](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-061803.png)



#### 1.2.3 无缝跨平台

使用 *RN* 所开发的移动端应用是无缝跨平台的，原生代码和 *API* 会被封装到 *RN* 组件中，开发者只需要掌握 *React* 和 *JavaScript* 知识即可进行开发。

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-061835.png" alt="image-20220602141835452" style="zoom:67%;" />



### 1.3 谁在使用 *RN*

*RN* 从 *2015* 年开源至今，已经有非常多的国内外厂商选择使用 *RN* 来开发移动端应用，因为比起以前开发 *Andriod* 和 *iOS* 应用要各自找一波开发工程师，现在只需要找一个前端工程师即可。

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-061857.png" alt="image-20220602141856881" style="zoom:67%;" />

更多使用厂商，可以参阅：*https://reactnative.dev/showcase*

---

## 2. 快速搭建 *RN* 开发环境

要进行 *RN* 的开发，首先第一步是搭建其开发环境。

官网为我们提供了搭建开发环境的详细步骤：*https://reactnative.dev/docs/environment-setup*

![image-20220602150930027](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-070930.png)



其中给了我们两个选择：

- 如果是作为学习阶段，想要快速体验 *RN* 开发，那么可以直接使用简易沙盒环境

- 如果是要做完整的上线应用开发，那么可以搭建完整的原生环境

这里我不希望大家一开始就在搭建环境这件事上消耗太多精力，因此我们先使用简易的沙盒环境，以便于能够快速进入到 *RN* 的开发学习。

>沙盒（英语：sandbox，又译为沙箱），计算机术语，在计算机安全领域中是一种安全机制，为运行中的程序提供的隔离环境。通常是作为一些来源不可信、具破坏力或无法判定程序意图的程序提供实验之用。
>沙盒通常严格控制其中的程序所能访问的资源，比如，沙盒可以提供用后即回收的磁盘及内存空间。在沙盒中，网络访问、对真实系统的访问、对输入设备的读取通常被禁止或是严格限制。从这个角度来说，沙盒属于虚拟化的一种。
>沙盒中的所有改动对操作系统不会造成任何损失。通常，这种技术被计算机技术人员广泛用于测试可能带毒的程序或是其他的恶意代码。

首先第一步，我们需要安装 *expo-cli*，这是一个脚手架工具，可以帮助我们快速搭建一个 *RN* 的项目。

```js
npm install -g expo-cli
```

安装完毕后可以使用 *expo -V* 来查看所安装的脚手架版本

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-070951.png" alt="image-20220602150951138" style="zoom:50%;" />

接下来我们就可以快速拉取一个项目，使用命令 *expo init <项目名称>*

![image-20220602151013904](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-071014.png)

首先会让我们选择项目的模板，如果不用 *TypeScript* 的话，一般选择第一个即可。

>注：使用 *expo-cli* 拉取项目时，很多依赖需要搭梯子才能安装，请自行搞定科学上网。

在科学上网的环境下，拉取项目还是比较快的，项目拉取完成图如下：

![image-20220602151034878](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-071035.png)

接下来 *cd* 到项目里面，使用 *npm start* 启动项目即可。

启动效果如下图所示，会有一个二维码，至此我们的 *RN* 开发环境已经搭建完毕。

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-071052.png" alt="image-20220602151051871" style="zoom: 50%;" />

接下来需要搞定 *RN* 项目的预览环境。以前写 *PC* 网页的时候，电脑上的浏览器就是我们的预览环境，而现在我们使用 *RN* 开发的是移动端应用，因此自然预览环境使用的是我们的手机。

除此之外，我们需要在手机上安装一个 *expo-client* 应用。

你可以在[这里](https://expo.dev/tools)根据你的手机系统版本下载对应的 *Client* 的文件。

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-071125.png" alt="image-20220602151125112" style="zoom:50%;" />

之后在手机上进行安装，安装完毕后确保手机和电脑是连接的同一个网络，打开该应用，点击 *Scan QR code* 进行扫码。

>如果是苹果手机，直接使用自带的相机应用进行扫码。

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-071151.png" alt="image-20220602151150979" style="zoom:50%;" />

扫码后会进入到项目打包构建过程，之后就会显示出当前项目的效果。

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-06-02-071211.png" alt="image-20220602151210602" style="zoom:50%;" />

至此，我们就快速的利用 *expo* 沙盒环境搭建了一个 *RN* 项目，并在手机上安装了 *expo-client* 来预览项目效果。

---

-*EOF*-







