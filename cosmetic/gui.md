# OpenCore美化

本指南将介绍的主要内容:

[[toc]]]

## 设置OpenCore的GUI

在开始之前，我们需要0.5.7或更新版本，因为这些构建将GUI包含在其他文件中。如果你使用的是较旧的版本，我建议更新:[更新 OpenCore](../universal/update.md)

完成之后，我们还需要做几件事:

* [二进制资源](https://github.com/acidanthera/OcBinaryData)
* [OpenCanopy.efi](https://github.com/acidanthera/OpenCorePkg/releases)
  * 注:OpenCanopy.efi必须来自与您的OpenCore文件相同的版本，因为不匹配的文件会导致启动问题

完成这两个操作后，接下来将其添加到EFI分区中:

* 将[资源文件夹](https://github.com/acidanthera/OcBinaryData)添加到EFI/OC
* 添加OpenCanopy.efi到EFI/OC/Drivers

![](../images/extras/gui-md/folder-gui.png)

现在在我们的config.Plist中，我们有4个问题需要解决:

* `Misc -> Boot -> PickerMode`: `External`
* `Misc -> Boot -> PickerAttributes`: `17`
  * 这使鼠标/触控板支持以及从驱动器读取volumeicon.icns，允许macOS安装程序图标出现在选择器中
    * PickerAttributes的其他设置可以在[Configuration.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Configuration.pdf)中找到
* `Misc -> Boot -> PickerVariant`: `Acidanthera\GoldenGate`
  * 适用变量:
    * `Auto` — 根据默认背景颜色自动选择一组图标。
    * `Acidanthera\Syrah` — N正常图标设置。
    * `Acidanthera\GoldenGate` — 新图标集。
    * `Acidanthera\Chardonnay` — 复古图标集。
* 并将OpenCanopy.efi添加到`UEFI -> Drivers`

一旦所有这些都保存下来，你就可以重新启动，并看到一个真正的类似mac的GUI:

| 默认的 (Syrah) | 新的 (GoldenGate) | 老的 (Chardonnay) |
| :--- | :--- | :--- |
| ![](../images/extras/gui-md/gui.png) | ![](../images/extras/gui-md/gui-nouveau.png) | ![](../images/extras/gui-md/gui-old.png) |

## 使用AudioDxe设置开机铃声

首先，我们需要一些东西:

* 内置音频输出
  * USB dac无法工作
  * GPU音频输出好坏参半
* [AudioDxe](https://github.com/acidanthera/OpenCorePkg/releases) 放到 EFI/OC/Drivers 和 UEFI -> Drivers
* [二进制资源](https://github.com/acidanthera/OcBinaryData)
  * 将Resources文件夹添加到EFI/OC中，就像我们对OpenCore GUI部分所做的那样
  * 对于那些空间不足的人，只需要 `OCEFIAudio_VoiceOver_Boot.mp3`也可以
* 启用日志记录的OpenCore的调试版本
  * 参见[OpenCore调试](https://sumingyd.github.io/OpenCore-Install-Guide/troubleshooting/debug.html)了解更多信息
  * 注意:在完成设置后，您可以恢复到发布版本

**设置NVRAM**:

* NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82:
  * `SystemAudioVolume | Data | 0x46`
  * 这是启动编码器和屏幕阅读器的音量，注意它是十六进制的，因此将变成十进制的`70`;`0x80`是静音的

::: details 可选NVRAM表项

* NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82:
  * `StartupMute | Data | 0x00`
  * 在固件音频支持中静音启动铃声;`0x00`是未静音的，不填写变量或填写任何其他值都意味着静音
:::

**设置UEFI -> Audio:**

* **AudioCodec:** (Number)
  * 音频控制器编解码器地址。这通常包含第一个音频编解码器地址装入的模拟音频控制器(HDEF)。失效保护值为0。
  * 找到你的:
    * 检查[IORegistryExplorer](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip) -> HDEF -> AppleHDAController -> IOHDACodecDevice并查看`IOHDACodecAddress`属性(例如:`0x0`)
    * 也可以通过终端进行检查(注意，如果出现多个设备，请使用供应商ID查找正确的设备):

      ```sh
      ioreg -rxn IOHDACodecDevice | grep VendorID   # 列出所有可能的设备
      sh ioreg -rxn IOHDACodecDevice | grep IOHDACodecAddress # 获取编解码器地址
      ```

* **AudioDevice:** (String)
  * 音频控制器的设备路径(PciRoot)
  * 运行[gfxutil](https://github.com/acidanthera/gfxutil/releases)找到路径:
    * `/path/to/gfxutil -f HDEF`
    * 例如: `PciRoot(0x0)/Pci(0x1f,0x3)`

* **AudioOutMask:** (Number)
  * 在UEFI中播放声音到多个声道(例如主扬声器加低音扬声器)。失效保护的值是`-1`(输出到所有)。
  * 输出通道在内部编号为比特`0`(值`1`)，比特`1`(值`2`)等等。值`1`表示第一个音频输出(不一定是主扬声器)。值`-1`用于同时向所有通道播放。
  * 启用AudioSupport时，AudioDevice必须为空或有效路径，并且AudioOutMask必须非零
  * 找到正确输出的最简单方法是遍历每个输出(从2^0到2^(N - 1)，其中N是日志中列出的输出数量);例如:5个输出将转换为1/2/4/8/16(或这些值的组合)作为可能的值
  * 你可以在OpenCore调试日志中找到你的所有编解码器:

    ```
    06:065 00:004 OCAU: Matching PciRoot(0x0)/Pci(0x1F,0x3)/VenMsg(A9003FEB-D806-41DB-A491-5405FEEF46C3,00000000)...
    06:070 00:005 OCAU: 1/2 PciRoot(0x0)/Pci(0x1F,0x3)/VenMsg(A9003FEB-D806-41DB-A491-5405FEEF46C3,00000000) (5 outputs) - Success
    ```

* **AudioSupport:** (Boolean)
  * 设置为 `True`
  * 启用此设置将音频播放从内置协议路由到指定音频控制器(AudioDevice)上指定编解码器(AudioCodec)的指定专用音频端口(AudioOutMask)

* **DisconnectHDA:** (Boolean)
  * 设置为 `False`

* **MaximumGain:** (Number)
  * 用于UEFI音频的最大增益，以分贝(dB)指定，相对于放大器参考电平0 dB
  * 设置为 `-15`

* **MinimumAssistGain:** (Number)
  * 用于picker音频辅助的最小增益分贝(dB)。如果从SystemAudioVolumeDB NVRAM变量读取的系统放大器增益低于此值，则屏幕阅读器将使用此放大器增益
  * 设置为 `-30`

* **MinimumAudibleGain:** (Number)
  * 尝试播放任何声音的最小增益分贝(dB)
  * 设置为 `-55`

* **PlayChime:** (String)
  * 设置为 `Enabled`
  * 支持的值为:
    * `Auto` — 当StartupMute NVRAM变量不存在或设置为00时启用铃声
    * `Enabled` — 无条件启用铃声
    * `Disabled` — 无条件禁用铃声

* **ResetTrafficClass:** (Boolean)
  * 设置为 `False`

* **SetupDelay:** (Number)
  * 默认值为`0`
  * 有些解码器需要额外的设置时间，如果你有问题，我们建议设置为`500`毫秒(0.5秒)

一旦完成，你应该会得到这样的结果:

![](../images/extras/gui-md/audio-config.png)

::: tip 信息

有像Realtek ALC295 (HP等)这样的编解码器，其默认音频采样率为48 kHz。在这种情况下，即使编解码器支持44.1 kHz，声音输出也会失败。目前解决这个问题的唯一方法是更改`OCEFIAudio_VoiceOver_Boot.mp3`的采样率文件或使用音频编辑工具将它从44.1 kHz提高到48 kHz。这必须手动完成，因为OpenCore没有自动机制。

:::

::: tip 信息

**视障人士注意事项**:

* OpenCore没有忘记您!使用AudioDxe设置，您可以通过以下2个设置启用选择器音频和文件库语音转换:
  * `Misc -> Boot -> PickerAudioAssist -> True` 启用选择器音频
  * `UEFI -> ProtocolOverrides -> AppleAudio -> True` 启动文件库语音转换
* 请参阅[安全和文件库](../universal/Security.md)了解如何设置其余的文件以获得适当的文件库支持。

:::
