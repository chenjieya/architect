数据科学工具包课程原始资料

来源：/Users/chenjie/Desktop/temp/data-science-tools（git 仓库，已去除 .git）
作者：袁进；课程定位：AI大全栈 / Python / 数据科学工具包
课程目标：为 AI Agents 应用开发做准备（不涉及模型训练/微调/部署）
资源地址：https://gitee.com/dev-edu/data-science-tools

目录结构：
- 1. 课程导言/        课程内容简介（NumPy/Pandas 处理结构化数据，Matplotlib/Seaborn 可视化）
- 2. jupyter/         Jupyter 环境搭建（uv 工程 + VS Code Jupyter 插件）
- 3. numpy-核心概念/  ndarray、dtype、shape、strides、axis、广播（含 assets 图片）
- 4. numpy-数据操作/  索引、切片、变形、重塑、统计、广播
- 5. pandas-数据类型/ Series、DataFrame、索引、loc/iloc
- 6. pandas-数据清洗/ 数据清洗实操（linking 数据）
- 7. matplotlib-核心概念/ figure、Axes、Artist，demo.py、3d.py
- 8. matplotlib-动画/ FuncAnimation、ArtistAnimation，demo1-3.py、sine_wave.gif
- 9. matplotlib-交互式组件/ button/checkbox/radiobutton/slider/textbox 交互组件 demo
- 10. seaborn/         用 Seaborn 分析前端开发者薪资数据

工程文件：
- pyproject.toml / uv.lock / .python-version  UV 工程环境（numpy==2.5.1、pandas==3.0.3、matplotlib>=3.11.0、openpyxl、ipympl）
- linking.csv / linking.xlsx / linking_clean.csv / linking_clean.xlsx  课程练习数据
- 课程内容.json        课程元数据（标题、技能点、目录）
- Agents.md            课程自身的 AI 沟通与课件规范

注意：本目录为原始资料层，AI 只读引用，禁止格式化与修改。
