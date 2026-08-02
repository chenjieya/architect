---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. 概述

Cesium 是一个基于 WebGL 的开源三维地球与地图可视化引擎。

官网：[https://cesium.com/](https://cesium.com/)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251117133904501.png)

## 2. 基础

- 初始化 Cesium 地图/地球
- Cesium 底图
- Cesium 控件

初始化 Cesium 地图/地球：下载模块，设置资源，设置 token

Cesium 底图：默认 bing map，可以选择：天地图、高德、百度等

Cesium 控件：显示隐藏，位置与样式，自定义交互逻辑等

### 2.1 camera 相机

- 飞行
- 跟踪
- 锁定
- 指定边界
- 方向
- 移动相机位置

飞行：camera.flyTo/camera.setView，地球的三维笛卡尔坐标系（跟经纬度是有区别的）

跟踪：viewer.flyTo/viewer.zoomTo，实体的位置

锁定：camera.lookAt/camera.lookAtTransform

指定边界：Cesium.Rectangle

方向：heading（航向角），pitch（俯仰角），roll（翻滚角）

移动相机位置：camera.moveForward/camera.moveUp ...

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251117133948918.png)

### 2.2 scene 场景

- Controller 控制器

- 天空盒

- 光照

- 显示太阳，月亮等

Controller 控制器：scene.screenSpaceCameraController，缩放，拖拽，倾斜等

天空盒：scene.skyBox，设置六个面的图片

光照：scene.globe.enableLighting

显示太阳，月亮等：scene.sun，scene.moon ...

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251117134007778.png)

### 2.3 实体

- 点，线，面
- 几何体：球体，锥体，走廊，外墙等
- 3D 模型
- 动画

点，线，面：viewer.entities.add({point, polyline, polygon})

几何体：viewer.entities.add({cylinder, corridor, wall})

3D 模型：glTF 格式（.glb），viewer.entities.add({model})

动画：Cesium.CallbackProperty

### 2.4 材质

- 纯色
- 格网、条纹、棋盘等
- 自定义

纯色：ColorMaterialProperty，Cesium.Color.RED.withAlpha(0.5)

网格，条纹，棋盘：GridMaterialProperty，StripeMaterialProperty，CheckerboardMaterialProperty ...

自定义：Cesium.Material（图元用的比较多）

### 2.5 图元

实体的底层实现

- 性能更好
- 对模型的精细化控制
- 更多的材质

性能更好：多个图元可以一起渲染，geometryInstances: [instance1, instance2]

对模型的精细化控制：gltfCallback: gltf => {}

更多的材质：Dot、Water 等，Fabric 定义，GLSL 着色器

### 2.6 事件

- 点击，双击，鼠标移入
- 与 DOM 配合
- 钩子：加载完成，实时更新坐标等

点击，双击，鼠标移入：Cesium.ScreenSpaceEventType.LEFT_CLICK/LEFT_DOUBLE_CLICK/MOUSE_MOVE

与 DOM 配合：点击实体弹出 DOM 提示框等

钩子：tileLoadProgressEvent，postRender 等

### 2.7 加载资源

- 栅格数据
- geojson
- kml
- CZML

栅格数据：图像或图片，viewer.imageryLayers.addImageryProvider

geojson：Cesium.GeoJsonDataSource.load

kml：谷歌的一种类 xml 的格式，Cesium.KmlDataSource.load

CZML： Cesium 专用的一种数据格式，Cesium.CzmlDataSource.load

## 3. Cesium ion 平台

- tokens
- 调用默认资源或自定义资源
- Stories
- Clips
- rest-api
- 平台的优势：自动转换格式

tokens： assets（资源） profile（账号） tokens archives（安装包） exports（离线导出）

调用默认资源或自定义资产：Cesium.IonResource.fromAssetId()

Stories：允许您在网络上构建和共享 3D 地理空间演示文稿和故事

Clips：裁剪模型周围的范围

rest-api：对资产进行增删改查，https://api.cesium.com/v1/assets/{assetId}

自动转换格式：转 3d tiles，转 png

### 3.1 3 D Tiles 瓦片

- 默认自带的 tiles 数据
- 模型等转 tiles 格式
- 本地加载 tiles 数据
- 如何生成 tiles 数据
- 样式与交互

默认自带的 tiles 数据：Cesium OSM Buildings，Google Photorealistic 3D Tiles ...

模型等转 tiles 格式：glTF，CityGML ...

本地加载 tiles 数据：tileset.json

如何生成 tiles 数据：cesium ion 平台，cesiumlab 平台

样式与交互：Cesium.Cesium3DTileStyle()

### 3.2 运动轨迹

- clock
- 方向
- 路线：高德 API，geojson，CZML

clock： 决定 Cesium 世界的时间流逝，viewer.clock，viewer.timeline

方向：改变模型的方向，1 变换矩阵，2 模型编辑器

路线：经纬度 + 高度的坐标点，1 高德 API，2geojson，3CZML

### 3.3 粒子效果

- 基本配置
- 发射器类型
- 与运动结合
- 特效

基本配置：大小，颜色，图片等，Cesium.ParticleSystem(options)

发射器类型：盒子，锥体，球体等，BoxEmitter，ConeEmitter，SphereEmitter ...

与运动结合：运动轨迹，比如飞机的尾气，particleSystem.modelMatrix = airplaneEntity.computeModelMatrix(time, new Cesium.Matrix4())

特效：喷水，爆炸等

### 3.4 后期特效

整体完成后进行后期特效处理：泛光，灰度，模糊，夜视等

语法：viewer.scene.postProcessStages，Cesium.PostProcessStage

### 3.5 Shader 着色器

- 概念：GPU，顶点，片段
- 语法，glsl 文件
- 与图元，tiles，后期等结合
- 特效：扫光，飞线，雨雪等

概念：是运行在 GPU 上的小程序， 顶点着色器： 把 3D 顶点转换到屏幕坐标， 片段着色器： 决定每个像素的最终颜色和透明度，vertexShaderSource/fragmentShaderText

语法： Cesium 的着色器语言是 GLSL（OpenGL Shading Language），一种强类型语言。

与图元，tiles，后期等结合：tileset.customShader = new Cesium.CustomShader()

特效：扫光，飞线，雨雪等， czm_frameNumber

## 4. 框架结合

- Vue，React
- turf.js
- three.js

Vue，React：组件库，工程化插件

turf.js：计算距离，面积，空间关系等

three.js： 模型更炫酷、更可控、更灵活等

## 5. Cesium 离线部署

[https://github.com/CesiumGS/cesium/tree/main/Documentation/OfflineGuide](https://github.com/CesiumGS/cesium/tree/main/Documentation/OfflineGuide)
