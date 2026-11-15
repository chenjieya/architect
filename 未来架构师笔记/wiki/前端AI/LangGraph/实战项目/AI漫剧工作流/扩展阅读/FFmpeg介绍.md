---
author: mixed
ai_editable: true
summary: 'AI 漫剧项目扩展阅读：音视频合成的基础与常用命令。'
refs:
  pages:
    - 01 目录
    - 13 视频生成与合成
  raw: []
updated_by: ai
updated: 2026-11-14
---

## 1. FFmpeg 介绍

想从视频里截一段、抽一张封面，或者把两段视频接起来，可以用 FFmpeg 在终端完成。下面用两段各 1 秒的纯色视频做练习，从安装开始，依次试试拼接、裁剪和抽帧。

### 1.1 FFmpeg 是什么？

FFmpeg 是一套开源的跨平台音视频工具。拿到一个视频文件后，可以用它裁一段、抽一帧、提取音频、缩小分辨率，或者把几段视频按顺序接起来。其中的 `ffmpeg` 是负责处理音视频的命令行程序。

工具包里的另一个程序 `ffprobe` 用来查看媒体信息。比如，同样叫 `.mp4` 的两个文件，里面可能分别使用 H.264 和 HEVC。MP4 是**容器**，负责组织视频、音频等媒体流。H.264 和 HEVC 是**编码格式**，描述视频流如何压缩。需要判断两段视频能否直接拼接时，可以先用 `ffprobe` 看里面装了什么。[FFmpeg 命令行文档](https://ffmpeg.org/ffmpeg.html) · [ffprobe 文档](https://ffmpeg.org/ffprobe.html)

### 1.2 在 Windows 和 macOS 上安装

#### 1.2.1 Windows

下面以常见的 64 位 Windows 10 或 11 为例，使用 Gyan 提供的预编译包。[Gyan Windows 构建下载页](https://www.gyan.dev/ffmpeg/builds/)

1. 在 **release builds** 区域下载 `ffmpeg-release-essentials.zip`，解压到自己容易找到的位置。
2. 找到解压目录中包含 `ffmpeg.exe` 和 `ffprobe.exe` 的 `bin` 文件夹。比如把解压后的目录放到 `C:\Tools\ffmpeg`，对应路径就是 `C:\Tools\ffmpeg\bin`。
3. 在开始菜单搜索「编辑账户的环境变量」，在用户变量中选中 `Path`，点「编辑」和「新建」，填入上一步找到的 `bin` 文件夹路径。保存后重新打开 PowerShell。

```powershell
ffmpeg -version
ffprobe -version
Get-Command ffmpeg
```

前两条会打印版本，第三条可以检查当前终端找到的是哪一个 `ffmpeg.exe`。如果终端仍提示找不到命令，先检查加入 `Path` 的那一层里是否直接包含 `ffmpeg.exe`。如果用 VS Code 的集成终端，可以退出并重开 VS Code，让它重新读取环境变量。

#### 1.2.2 macOS

在终端运行 `brew --version` 检查 Homebrew。若还没装，按照 Homebrew 官网的步骤安装，并执行安装程序给出的终端配置提示。然后运行以下命令。[Homebrew 安装说明](https://brew.sh/) · [FFmpeg formula](https://formulae.brew.sh/formula/ffmpeg)

```bash
brew install ffmpeg
ffmpeg -version
ffprobe -version
command -v ffmpeg
```

能打印版本和路径，就可以在当前终端运行下面的示例。

### 1.3 把两段视频拼成一段

#### 1.3.1 准备视频和拼接清单

先创建练习目录，以下命令在 PowerShell 和 macOS 终端中均可使用。

```bash
mkdir ffmpeg-demo
cd ffmpeg-demo
```

运行下面两条命令，分别生成 1 秒的红色和蓝色视频。两段视频采用相同的分辨率、帧率和编码，方便直接拼接。

```bash
ffmpeg -f lavfi -i "color=red:s=320x180:r=25:d=1" -c:v libx264 -pix_fmt yuv420p red.mp4
ffmpeg -f lavfi -i "color=blue:s=320x180:r=25:d=1" -c:v libx264 -pix_fmt yuv420p blue.mp4
```

用编辑器在同一目录创建纯文本文件 `concat.txt`，保存为 UTF-8（无 BOM）。每行写一个输入，播放顺序以清单为准。

```text
file 'red.mp4'
file 'blue.mp4'
```

```text
ffmpeg-demo/
├── concat.txt
├── red.mp4
└── blue.mp4
```

#### 1.3.2 执行拼接命令

```bash
ffmpeg -nostdin -hide_banner -loglevel error -y -f concat -safe 1 -i concat.txt -c copy joined.mp4
```

| 参数              | 作用                                                                               |
| ----------------- | ---------------------------------------------------------------------------------- |
| `-nostdin`        | 禁用从标准输入接收交互命令，适合在脚本中非交互执行。                               |
| `-hide_banner`    | 隐藏启动时的版本和构建信息。                                                       |
| `-loglevel error` | 只显示错误及更严重的日志。正常完成时终端可能没有输出。                             |
| `-y`              | 允许直接覆盖同名输出。手动试验时可以用 `-n`，让已有文件得到保留。                  |
| `-f concat`       | 指定用 concat 清单读取器处理输入。它会依次打开 `file` 指令列出的媒体文件。         |
| `-safe 1`         | 启用 concat 的安全路径规则。`red.mp4` 这样的相对文件名可以使用，绝对路径会被拒绝。 |
| `-i concat.txt`   | 指定输入清单。清单里的相对路径以清单所在目录为基准。                               |
| `-c copy`         | 直接复制选中的已编码媒体流到输出容器，省去解码和重新编码。                         |
| `joined.mp4`      | 输出文件。最后的 `.mp4` 让 FFmpeg 能根据扩展名选择 MP4 输出格式。                  |

执行成功后，打开 `joined.mp4`。视频应该约 2 秒，先红后蓝。 [FFmpeg 命令行选项](https://ffmpeg.org/ffmpeg.html) · [concat 清单格式与路径规则](https://ffmpeg.org/ffmpeg-formats.html#concat)

#### 1.3.3 为什么同是 MP4 也可能拼不起来？

`-c copy` 会保留原来的编码参数。直接拼接要求各段的媒体流结构和参数兼容，例如相同的流类型和顺序、编码格式、时间基准。分辨率或音频配置不一致时，即使生成了文件，也要检查镜头切换处能否正常播放。

先用下一节的 `ffprobe` 分别检查输入。如果素材的参数不一致，可以先把每段统一转成相同规格，再用统一后的文件重建清单。[concat 输入要求](https://ffmpeg.org/ffmpeg-formats.html#concat)

### 1.4 几个常用操作

以下命令可以继续在练习目录运行。命令通常按 `ffmpeg [输入选项] -i 输入文件 [输出选项] 输出文件` 排列。比如上面的 `-f concat` 作用于输入，而 `-c copy` 作用于输出。

#### 1.4.1 查看视频编码、画面大小和时长

```bash
ffprobe -v error -show_entries "stream=codec_type,codec_name,width,height,avg_frame_rate,time_base:format=duration" -of json joined.mp4
```

`-show_entries` 选出需要的字段，`-of json` 让结果便于阅读和交给程序处理。测试成片的 `format.duration` 应约为 `2.000000`，视频流应显示 `h264` 和 `320 × 180`。想排查拼接兼容性时，把最后的文件名换成各个输入文件，对比各自的输出。

#### 1.4.2 截取一小段

```bash
ffmpeg -ss 0.5 -i joined.mp4 -t 1 -c:v libx264 clip.mp4
```

`-ss 0.5` 从约 0.5 秒处开始读取，`-t 1` 输出 1 秒。示例重新编码视频，可以从所需位置裁剪。如果改用流复制，起点可能受关键帧位置影响。播放 `clip.mp4`，测试素材应包含红色转蓝色的片段。

#### 1.4.3 抽一帧做封面

```bash
ffmpeg -ss 1.2 -i joined.mp4 -frames:v 1 cover.png
```

`-frames:v 1` 只输出一帧视频画面。打开 `cover.png`，测试素材应显示蓝色。

#### 1.4.4 调整分辨率并重新编码

```bash
ffmpeg -i red.mp4 -vf "scale=640:-2" -c:v libx264 -pix_fmt yuv420p resized.mp4
```

`-vf` 应用视频滤镜。这里把宽度设为 640，高度按比例计算并取能被 2 整除的值。测试素材会得到 `640 × 360` 的 H.264 视频。滤镜会改变像素，所以这里选用 `-c:v libx264` 重新编码。

#### 1.4.5 转封装，或者单独提取音频

```bash
ffmpeg -i red.mp4 -c copy red.mkv
```

这条命令把视频流装进 MKV 容器。对容器支持的流，可以用 `-c copy` 保留原编码。

有一段**包含音轨**的视频时，把它放到当前目录并命名为 `with-audio.mp4`，就可以提取音频并编码成 MP3。前面的纯色视频没有音轨。

```bash
ffmpeg -i with-audio.mp4 -vn -c:a libmp3lame audio.mp3
```

`-vn` 跳过视频，`-c:a` 指定音频编码器。完成后可直接播放 `audio.mp3`。更多参数可以通过 `ffmpeg -h`、`ffmpeg -h demuxer=concat` 查询。[FFmpeg 选项与流复制](https://ffmpeg.org/ffmpeg.html)

### 1.5 合成失败时先查哪里？

| 表现                             | 检查方法                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 终端提示找不到 FFmpeg            | 确认安装目录已加入 `PATH`，重开终端后运行 `ffmpeg -version`。                                                                            |
| 找不到清单或视频文件             | 确认执行目录里有 `concat.txt`。再检查清单里的相对文件名是否能从清单所在目录找到。Windows 上可确认文件实际名称没有变成 `concat.txt.txt`。 |
| 提示 `Unsafe file name`          | 确认清单写的是 `red.mp4` 这类安全的相对路径。把清单和视频放在同一目录时，直接写文件名即可。                                              |
| 生成了文件，但切换镜头时画面异常 | 用 `ffprobe` 检查各段的流信息。对不一致的输入先统一规格，再拼接并播放检查。                                                              |

排查时，可以先用 `ffprobe` 确认输入文件里有哪些媒体流，再选处理方式。拼接兼容的视频或更换容器时可以用 `-c copy`。需要缩放、改变编码或精确裁剪时，再重新编码。

## 2. 相关章节

- [[01 目录]]：返回项目目录
- [[13 视频生成与合成]]
